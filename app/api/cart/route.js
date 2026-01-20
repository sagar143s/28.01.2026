import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getAuth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";


// Update user cart 
export async function POST(request){
    try {
        // Firebase Auth: get Bearer token from header
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const idToken = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = await getAuth().verifyIdToken(idToken);
        } catch (e) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = decodedToken.uid;

        await dbConnect();
        const { cart } = await request.json();

        // Ensure user exists (minimal) then update cart
        await User.findOneAndUpdate(
            { _id: userId },
            { cart: cart },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ message: 'Cart updated' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// Get user cart 
export async function GET(request){
    try {
        // Firebase Auth: get Bearer token from header
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ cart: {} });
        }
        const idToken = authHeader.split(" ")[1];
        let decodedToken;
        try {
            decodedToken = await getAuth().verifyIdToken(idToken);
        } catch (e) {
            return NextResponse.json({ cart: {} });
        }
        const userId = decodedToken.uid;

        await dbConnect();
        let user = await User.findOne({ _id: userId });

        // If user doesn't exist yet, create a minimal record so reads don't fail
        if (!user) {
            user = await User.create({
                _id: userId,
                name: 'Unknown',
                email: '',
                cart: {},
            });
        }

        return NextResponse.json({ cart: user.cart || {} });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}