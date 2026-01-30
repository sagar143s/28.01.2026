import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Store from '@/models/Store';
import EmailHistory from '@/models/EmailHistory';
import { sendMail } from '@/lib/email';
import { getRandomTemplate, getTemplateById, getAllTemplateIds } from '@/lib/promotionalEmailTemplates';
import mongoose from 'mongoose';

/**
 * API endpoint to send promotional emails
 * GET - Send to random customers with random template
 * POST - Send specific template to specific customers
 */

export async function GET(request) {
  try {
    // Get random template
    const template = getRandomTemplate();
    
    // Connect to database
    await connectDB();

    const storeObjectId = await resolveStoreObjectId();
    
    // Get customers (limit to avoid spam)
    const customers = await User.find({ 
      email: { $exists: true, $ne: null, $ne: '' }
    })
    .limit(50) // Send to 50 customers at a time
    .select('email name')
    .lean();

    if (customers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No customers found with valid emails' 
      }, { status: 404 });
    }

    // Get featured products
    const featuredProducts = await Product.find({ 
      isPublished: true,
      stock: { $gt: 0 }
    })
    .sort({ sold: -1 })
    .limit(4)
    .select('name price salePrice images')
    .lean();

    const products = featuredProducts.map(p => ({
      name: p.name,
      price: p.salePrice || p.price,
      originalPrice: p.salePrice ? p.price : null,
      image: p.images && p.images[0] ? p.images[0] : null
    }));

    // Send emails
    const results = [];
    for (const customer of customers) {
      try {
        const htmlContent = template.template(products);
        
        await sendMail({
          to: customer.email,
          subject: template.subject,
          html: htmlContent
        });

        if (storeObjectId) {
          try {
            await EmailHistory.create({
              storeId: storeObjectId,
              type: 'promotional',
              recipientEmail: customer.email,
              recipientName: customer.name || 'Customer',
              subject: template.subject,
              status: 'sent',
              customMessage: `template:${template.id}`,
              sentAt: new Date()
            });
          } catch (historyError) {
            console.error('[promotional-email] Failed to save email history:', historyError);
          }
        }
        
        results.push({ 
          email: customer.email, 
          status: 'sent',
          template: template.id 
        });
        
        // Rate limiting: Wait 600ms between emails (max 2 requests/second)
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (error) {
        console.error(`Failed to send email to ${customer.email}:`, error);
        if (storeObjectId) {
          try {
            await EmailHistory.create({
              storeId: storeObjectId,
              type: 'promotional',
              recipientEmail: customer.email,
              recipientName: customer.name || 'Customer',
              subject: template.subject,
              status: 'failed',
              errorMessage: error.message || 'Unknown error',
              customMessage: `template:${template.id}`,
              sentAt: new Date()
            });
          } catch (historyError) {
            console.error('[promotional-email] Failed to save failed email history:', historyError);
          }
        }
        results.push({ 
          email: customer.email, 
          status: 'failed',
          error: error.message 
        });
      }
    }

    const emailsSent = results.filter(r => r.status === 'sent').length;
    const emailsFailed = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        subject: template.subject
      },
      totalCustomers: customers.length,
      emailsSent,
      emailsFailed,
      results: process.env.NODE_ENV === 'development' ? results : undefined
    });

  } catch (error) {
    console.error('Error sending promotional emails:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { templateId, customerEmails, limit = 50 } = body;

    // Validate template
    const template = templateId ? getTemplateById(templateId) : getRandomTemplate();
    
    if (!template) {
      return NextResponse.json({ 
        success: false, 
        error: 'Template not found',
        availableTemplates: getAllTemplateIds()
      }, { status: 400 });
    }

    await connectDB();

    const storeObjectId = await resolveStoreObjectId();

    // Get customers based on provided emails or fetch from database
    let customers;
    if (customerEmails && Array.isArray(customerEmails) && customerEmails.length > 0) {
      customers = await User.find({ 
        email: { $in: customerEmails }
      })
      .select('email name')
      .lean();
    } else {
      customers = await User.find({ 
        email: { $exists: true, $ne: null, $ne: '' }
      })
      .limit(limit)
      .select('email name')
      .lean();
    }

    if (customers.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No customers found' 
      }, { status: 404 });
    }

    // Get featured products
    const featuredProducts = await Product.find({ 
      isPublished: true,
      stock: { $gt: 0 }
    })
    .sort({ sold: -1 })
    .limit(4)
    .select('name price salePrice images')
    .lean();

    const products = featuredProducts.map(p => ({
      name: p.name,
      price: p.salePrice || p.price,
      originalPrice: p.salePrice ? p.price : null,
      image: p.images && p.images[0] ? p.images[0] : null
    }));

    // Send emails
    const results = [];
    for (const customer of customers) {
      try {
        const htmlContent = template.template(products);
        
        await sendMail({
          to: customer.email,
          subject: template.subject,
          html: htmlContent
        });

        if (storeObjectId) {
          try {
            await EmailHistory.create({
              storeId: storeObjectId,
              type: 'promotional',
              recipientEmail: customer.email,
              recipientName: customer.name || 'Customer',
              subject: template.subject,
              status: 'sent',
              customMessage: `template:${template.id}`,
              sentAt: new Date()
            });
          } catch (historyError) {
            console.error('[promotional-email] Failed to save email history:', historyError);
          }
        }
        
        results.push({ 
          email: customer.email, 
          status: 'sent',
          template: template.id 
        });
        
        // Rate limiting: Wait 600ms between emails (max 2 requests/second)
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (error) {
        console.error(`Failed to send email to ${customer.email}:`, error);
        if (storeObjectId) {
          try {
            await EmailHistory.create({
              storeId: storeObjectId,
              type: 'promotional',
              recipientEmail: customer.email,
              recipientName: customer.name || 'Customer',
              subject: template.subject,
              status: 'failed',
              errorMessage: error.message || 'Unknown error',
              customMessage: `template:${template.id}`,
              sentAt: new Date()
            });
          } catch (historyError) {
            console.error('[promotional-email] Failed to save failed email history:', historyError);
          }
        }
        results.push({ 
          email: customer.email, 
          status: 'failed',
          error: error.message 
        });
      }
    }

    const emailsSent = results.filter(r => r.status === 'sent').length;
    const emailsFailed = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        subject: template.subject
      },
      totalCustomers: customers.length,
      emailsSent,
      emailsFailed,
      results: process.env.NODE_ENV === 'development' ? results : undefined
    });

  } catch (error) {
    console.error('Error sending promotional emails:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function resolveStoreObjectId() {
  const envStoreId = process.env.PROMOTIONAL_STORE_ID;
  let storeId = envStoreId;
  if (!storeId) {
    const store = await Store.findOne({}).select('_id').lean();
    storeId = store?._id?.toString();
  }
  if (!storeId) return null;
  return new mongoose.Types.ObjectId(storeId);
}
