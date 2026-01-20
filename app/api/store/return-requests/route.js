
import connectDB from '@/lib/mongodb';
import Store from '@/models/Store';
import ReturnRequest from '@/models/ReturnRequest';
import User from '@/models/User';
import { NextResponse } from "next/server";
import admin from 'firebase-admin';

// Get store's return/replacement requests
export async function GET(request) {
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
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }
        const userId = decodedToken.uid;

        // Verify user has a store
        const store = await Store.findOne({ userId }).lean();

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const requests = await ReturnRequest.find({ storeId: store._id.toString() })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        // Format requests to match Prisma structure
        const formattedRequests = requests.map(req => ({
            ...req,
            _id: req._id.toString(),
            user: req.userId ? {
                name: req.userId.name,
                email: req.userId.email
            } : null
        }));

        return NextResponse.json({ requests: formattedRequests });
    } catch (error) {
        console.error('Error fetching store return requests:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
