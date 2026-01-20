import { NextResponse } from "next/server";
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import StoreUser from '@/models/StoreUser';
import admin from 'firebase-admin';

export async function POST(request) {
  try {
    await connectDB();

    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            })
        });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: 'Missing userEmail' }, { status: 400 });
    }

    // Find store owned by this user
    const store = await Store.findOne({ userId }).lean();
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Approve the user
    const updated = await StoreUser.findOneAndUpdate(
      { storeId: store._id.toString(), email: userEmail },
      { status: 'approved', approvedById: userId },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User approved successfully', user: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
