import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import { getAuth } from '@/lib/firebase-admin';
import { sendTicketCreatedEmail } from '@/lib/emailService';

// GET - Fetch user's tickets
export async function GET(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const tickets = await Ticket.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ 
      success: true, 
      tickets 
    });
  } catch (error) {
    console.error('Tickets GET error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// POST - Create new ticket
export async function POST(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;
    const userName = decodedToken.name || decodedToken.email;

    const { subject, category, description, priority } = await request.json();

    if (!subject || !category || !description) {
      return NextResponse.json({ 
        error: 'Subject, category, and description are required' 
      }, { status: 400 });
    }

    const ticket = await Ticket.create({
      userId,
      userEmail,
      userName,
      subject,
      category,
      description,
      priority: priority || 'normal',
      status: 'open'
    });

    // Send email notifications
    try {
      await sendTicketCreatedEmail(ticket);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Continue even if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Ticket created successfully',
      ticket 
    }, { status: 201 });
  } catch (error) {
    console.error('Ticket POST error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
