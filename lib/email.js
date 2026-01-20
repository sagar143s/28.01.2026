// Send order status update email (generic dispatcher)
export async function sendOrderStatusEmail(order, status) {
  const { guestEmail, guestName, userId, shippingAddress, trackingId, trackingUrl, courier } = order;
  let email = guestEmail;
  let name = guestName;
  if (!email && order.email) email = order.email;
  if (!name && order.name) name = order.name;
  if (!email && order.userId && order.userId.email) email = order.userId.email;
  if (!name && order.userId && order.userId.name) name = order.userId.name;
  if (!email) return;
  switch (status) {
    case 'ORDER_PLACED':
      return sendOrderConfirmationEmail({
        email,
        name,
        orderId: order._id,
        shortOrderNumber: order.shortOrderNumber,
        total: order.total,
        orderItems: order.orderItems,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod
      });
    case 'CONFIRMED':
      return sendOrderConfirmedEmail({ email, name, order });
    case 'PROCESSING':
      return sendOrderProcessingEmail({ email, name, order });
    case 'PICKUP_REQUESTED':
      return sendOrderPickupRequestedEmail({ email, name, order });
    case 'WAITING_FOR_PICKUP':
      return sendOrderWaitingForPickupEmail({ email, name, order });
    case 'PICKED_UP':
      return sendOrderPickedUpEmail({ email, name, order });
    case 'WAREHOUSE_RECEIVED':
      return sendOrderWarehouseReceivedEmail({ email, name, order });
    case 'SHIPPED':
      return sendOrderShippedEmail({ email, name, orderId: order._id, trackingId, trackingUrl, courier });
    case 'OUT_FOR_DELIVERY':
      return sendOrderOutForDeliveryEmail({ email, name, order });
    case 'DELIVERED':
      return sendOrderDeliveredEmail({ email, name, order });
    case 'RETURN_REQUESTED':
      return sendOrderReturnRequestedEmail({ email, name, order });
    case 'RETURNED':
      return sendOrderReturnedEmail({ email, name, order });
    case 'CANCELLED':
      return sendOrderCancelledEmail({ email, name, order });
    default:
      return sendOrderCustomStatusEmail({ email, name, order, status });
  }

// --- Custom templates for new statuses (moved to bottom for hoisting) ---

function sendOrderWaitingForPickupEmail({ email, name, order }) {
  const subject = `Waiting for Pickup - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#fbbf24;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>⏳ Waiting for Pickup</h1>
      <p>Your order is ready and waiting for pickup by our delivery partner.</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>We will notify you as soon as your order is picked up from our warehouse.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}

function sendOrderOutForDeliveryEmail({ email, name, order }) {
  const subject = `Out for Delivery - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#14b8a6;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>🚚 Out for Delivery</h1>
      <p>Your order is out for delivery and will reach you soon.</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>Our delivery partner is on the way to your address.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}

function sendOrderReturnRequestedEmail({ email, name, order }) {
  const subject = `Return Requested - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#f472b6;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>↩️ Return Requested</h1>
      <p>Your return request has been received. We will process it soon.</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>We will notify you when your return is picked up or processed.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}
}

// Custom template: Confirmed
export async function sendOrderConfirmedEmail({ email, name, order }) {
  const subject = `Order Confirmed - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#2874f0;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>✅ Order Confirmed</h1>
      <p>Your order is confirmed and will be processed soon.</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>Thank you for your order. We will notify you when it is ready for pickup or shipping.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}

// Custom template: Pickup Requested
export async function sendOrderPickupRequestedEmail({ email, name, order }) {
  const subject = `Pickup Requested - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#2874f0;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>🚚 Pickup Requested</h1>
      <p>Your order is ready for pickup by our delivery partner.</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>We will notify you as soon as your order is picked up from our warehouse.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}

// Custom template: Picked Up
export async function sendOrderPickedUpEmail({ email, name, order }) {
  const subject = `Order Picked Up - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#2874f0;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>📦 Order Picked Up</h1>
      <p>Your order has been picked up from our warehouse and is on its way.</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>We will send you tracking details soon.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}

// Custom template: Warehouse Received
export async function sendOrderWarehouseReceivedEmail({ email, name, order }) {
  const subject = `Order Received at Warehouse - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#2874f0;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>🏢 Order at Warehouse</h1>
      <p>Your order has arrived at our warehouse and will be shipped soon.</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>We will notify you when your order is shipped.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}

// Fallback for unknown/custom statuses
export async function sendOrderCustomStatusEmail({ email, name, order, status }) {
  const subject = `Order Update (${status}) - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#2874f0;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>Order Update: ${status}</h1>
      <p>Your order status has been updated to <b>${status}</b>.</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>If you have any questions, reply to this email.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}

// Custom template: Processing
export async function sendOrderProcessingEmail({ email, name, order }) {
  const subject = `Order Processing - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#2874f0;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>🛠️ Order Processing</h1>
      <p>Your order is being prepared for shipment.</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>We have received your order and our team is getting it ready. You will receive another update when it ships.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}

// Custom template: Delivered
export async function sendOrderDeliveredEmail({ email, name, order }) {
  const subject = `Order Delivered - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#2874f0;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>📦 Order Delivered</h1>
      <p>Your order has been delivered. We hope you enjoy your purchase!</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>Thank you for shopping with QuickFynd. If you have any feedback or need support, reply to this email.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}

// Custom template: Cancelled
export async function sendOrderCancelledEmail({ email, name, order }) {
  const subject = `Order Cancelled - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#2874f0;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>❌ Order Cancelled</h1>
      <p>Your order has been cancelled. If you have questions, contact support.</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>If you did not request this cancellation, please reply to this email immediately.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}

// Custom template: Returned
export async function sendOrderReturnedEmail({ email, name, order }) {
  const subject = `Order Returned - ${order._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="background:#2874f0;padding:32px 0;text-align:center;color:#fff;">
      <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" style="max-width:200px;margin-bottom:16px;"/>
      <h1>↩️ Order Returned</h1>
      <p>Your return has been processed. Refunds (if any) will be issued soon.</p>
    </div>
    <div style="padding:32px;background:#f8f9fa;">
      <h2>Hi ${name || 'there'}!</h2>
      <p>If you have any questions, reply to this email.</p>
      <p style="margin-top:30px;">Order ID: <b>${order._id.toString().slice(-8).toUpperCase()}</b></p>
    </div>
  `;
  return sendMail({ to: email, subject, html });
}
// lib/email.js

import { Resend } from 'resend';
import mailjet from 'node-mailjet';
import nodemailer from 'nodemailer';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const mailjetClient = (process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY)
  ? mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY)
  : null;

const smtpTransporter = (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

/**
 * Send email using either Resend or Mailjet, depending on available credentials.
 * @param {Object} param0
 * @param {string} param0.to
 * @param {string} param0.subject
 * @param {string} param0.html
 */
export async function sendMail({ to, subject, html }) {
  // Prefer Resend, then Mailjet, then SMTP (Hostinger)
  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: [to],
        subject,
        html,
      });
      if (error) {
        console.error('Email sending error (Resend):', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Failed to send email (Resend):', error);
      throw error;
    }
  } else if (mailjetClient) {
    try {
      const fromEmail = process.env.EMAIL_FROM || 'noreply@quickfynd.com';
      const fromName = process.env.EMAIL_FROM_NAME || 'QuickFynd';
      const result = await mailjetClient
        .post('send', { version: 'v3.1' })
        .request({
          Messages: [
            {
              From: {
                Email: fromEmail,
                Name: fromName,
              },
              To: [
                {
                  Email: to,
                },
              ],
              Subject: subject,
              HTMLPart: html,
            },
          ],
        });
      return result.body;
    } catch (error) {
      console.error('Failed to send email (Mailjet):', error);
      throw error;
    }
  } else if (smtpTransporter) {
    try {
      const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;
      const info = await smtpTransporter.sendMail({
        from: fromEmail,
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      console.error('Failed to send email (SMTP):', error);
      throw error;
    }
  } else {
    throw new Error('No email provider configured. Please set RESEND_API_KEY, MAILJET_API_KEY/MAILJET_SECRET_KEY, or SMTP credentials.');
  }
}

// Send welcome email when customer creates account
export async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to QuickFynd! 🎉';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
        .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .benefit-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .benefit-item:last-child { border-bottom: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to QuickFynd!</h1>
          <p>Your journey to amazing products starts here</p>
        </div>
        <div class="content">
          <h2>Hi ${name || 'there'}! 👋</h2>
          <p>Thank you for creating an account with QuickFynd. We're excited to have you as part of our community!</p>
          
          <div class="benefits">
            <h3>Here's what you can enjoy:</h3>
            <div class="benefit-item">✅ Fast & secure checkout</div>
            <div class="benefit-item">✅ Order tracking & history</div>
            <div class="benefit-item">✅ Exclusive deals & offers</div>
            <div class="benefit-item">✅ Wishlist & saved items</div>
            <div class="benefit-item">✅ Easy returns within 7 days</div>
          </div>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">Start Shopping</a>

          <p>If you have any questions, feel free to reach out to our support team at <a href="mailto:${process.env.NEXT_PUBLIC_ADMIN_EMAIL}">${process.env.NEXT_PUBLIC_ADMIN_EMAIL}</a></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} QuickFynd. All rights reserved.</p>
          <p>You're receiving this email because you created an account on our website.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendMail({ to: email, subject, html });
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(orderData) {
  const { email, name, orderId, shortOrderNumber, total, orderItems, shippingAddress, createdAt, paymentMethod } = orderData;
  
  const itemsHtml = orderItems.map(item => {
    const product = item.productId || item.product || {};
    return `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 15px;">
            ${product.images?.[0] ? `<img src="${product.images[0]}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` : ''}
            <div>
              <strong>${product.name || 'Product'}</strong><br>
              <span style="color: #6b7280; font-size: 14px;">Qty: ${item.quantity}</span>
            </div>
          </div>
        </td>
        <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e5e7eb;">
          <strong>₹${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</strong>
        </td>
      </tr>
    `;
  }).join('');

  // Use same order number everywhere (dashboard, success page, emails)
  const displayOrderNumber = shortOrderNumber
    ? String(shortOrderNumber)
    : orderId.toString().slice(-8).toUpperCase();

  const subject = `Order Confirmation - ${displayOrderNumber}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f6fb; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(40,116,240,0.07); }
        .header {
          background: #2874f0;
          color: white;
          padding: 32px 24px 18px 24px;
          text-align: center;
        }
        .header-logo {
          max-width: 160px;
          height: 40px;
          object-fit: contain;
          margin-bottom: 8px;
        }
        .header h1 {
          margin: 0 0 8px 0;
          font-size: 2rem;
          font-weight: 700;
        }
        .header p {
          margin: 0;
          font-size: 1.1rem;
        }
        .content { background: #f8f9fa; padding: 32px 24px; }
        .order-id { background: #fff; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0 18px 0; font-size: 18px; border: 1px solid #e3e8f0; }
        .items-table { width: 100%; background: #fff; border-radius: 8px; overflow: hidden; margin: 20px 0; border: 1px solid #e3e8f0; }
        .address-box { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e3e8f0; }
        .total-box { background: #2874f0; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right; font-size: 1.2rem; font-weight: 600; }
        .button { display: inline-block; background: #ff9800; color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: bold; font-size: 1rem; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(40,116,240,0.08); transition: background 0.2s; }
        .button:hover { background: #f57c00; }
        .footer { text-align: center; margin-top: 30px; padding: 24px; color: #6b7280; font-size: 14px; background: #fff; }
        @media (max-width: 600px) {
          .container, .content, .header { padding: 12px !important; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://res.cloudinary.com/dyccpu74t/image/upload/v1765529523/Asset_6_q7xkxg.png" alt="QuickFynd Logo" class="header-logo" />
          <h1>✅ Order Confirmed!</h1>
          <p>Thank you for your purchase</p>
        </div>
        <div class="content">
          <h2 style="margin-top:0;">Hi ${name || 'there'}! 👋</h2>
          <p>Your order has been successfully placed and is being processed.</p>
          <div class="order-id">
            <strong>Order No:</strong> ${displayOrderNumber}<br>
            <span style="color: #6b7280; font-size: 14px;">Placed on ${new Date(createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
          </div>
          <h3 style="margin-bottom:8px;">Order Items</h3>
          <table class="items-table" cellpadding="0" cellspacing="0">
            ${itemsHtml}
          </table>
          <div class="total-box">
            Total Amount: ₹${(total || 0).toFixed(2)}
          </div>
          <div class="order-id">
            <strong>Payment Method:</strong> ${paymentMethod ? paymentMethod : 'N/A'}
          </div>
          ${shippingAddress ? `
          <div class="address-box">
            <h3 style="margin-top:0;">Shipping Address</h3>
            <p style="margin:0;">
              <strong>${shippingAddress.name || name}</strong><br>
              ${shippingAddress.street || ''}<br>
              ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zip || ''}<br>
              ${shippingAddress.country || ''}<br>
              ${shippingAddress.phone ? `Phone: ${shippingAddress.phone}` : ''}
            </p>
          </div>
          ` : ''}
          <center>
            <a href="https://quickfynd.com/track-order" class="button" style="background:#3b82f6;color:#fff;padding:14px 36px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:1rem;letter-spacing:0.5px;box-shadow:0 2px 8px rgba(40,116,240,0.08);transition:background 0.2s;">Track Order</a>
          </center>
          <p style="margin-top: 30px;">We'll send you another email when your order ships. If you have any questions, contact us at <a href="mailto:${process.env.NEXT_PUBLIC_ADMIN_EMAIL}">${process.env.NEXT_PUBLIC_ADMIN_EMAIL}</a></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} QuickFynd. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendMail({ to: email, subject, html });
}

// Send order shipped email
export async function sendOrderShippedEmail(orderData) {
  const { email, name, orderId, trackingId, trackingUrl, courier } = orderData;
  
  const subject = `Order Shipped - ${orderId.toString().slice(-8).toUpperCase()}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .tracking-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 Your Order is On the Way!</h1>
          <p>Order #${orderId.toString().slice(-8).toUpperCase()}</p>
        </div>
        <div class="content">
          <h2>Hi ${name || 'there'}! 👋</h2>
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          

          ${trackingId || trackingUrl || courier ? `
          <div class="tracking-box">
            <h3 style="margin-top: 0;">Tracking Information</h3>
            ${courier ? `<p><strong>Courier:</strong> ${courier}</p>` : ''}
            ${trackingId ? `<p><strong>Tracking ID:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${trackingId}</code></p>` : ''}
            ${trackingUrl ? `
              <center>
                <a href="${trackingUrl}" class="button" style="background:#3b82f6;color:#fff;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Track Shipment</a>
              </center>
            ` : ''}
          </div>
          ` : ''}

          <p>You can also track your order here:</p>
          <center>
            <a href="https://quickfynd.com/track-order" class="button" style="background:#3b82f6;color:#fff;padding:12px 30px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Track Order</a>
          </center>

          <p style="margin-top: 30px;">If you have any questions, contact us at <a href="mailto:${process.env.NEXT_PUBLIC_ADMIN_EMAIL}">${process.env.NEXT_PUBLIC_ADMIN_EMAIL}</a></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} QuickFynd. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendMail({ to: email, subject, html });
}

// Sends a password setup email to the user (basic implementation)
export async function sendPasswordSetupEmail(email, name) {
  const subject = 'Set up your password';
  const html = `<p>Hi ${name || ''},</p><p>Please click the link below to set your password for your new account.</p>`;
  return sendMail({ to: email, subject, html });
}

