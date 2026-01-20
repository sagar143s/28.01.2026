import { NextResponse } from "next/server";
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import Store from '@/models/Store';

// PUT - Update a coupon
export async function PUT(req, { params }) {
    try {
        await connectDB();
        
        // Firebase Auth
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const idToken = authHeader.split(" ")[1];
        const { getAuth } = await import('firebase-admin/auth');
        const { initializeApp, applicationDefault, getApps } = await import('firebase-admin/app');
        if (getApps().length === 0) {
            initializeApp({ credential: applicationDefault() });
        }
        let decodedToken;
        try {
            decodedToken = await getAuth().verifyIdToken(idToken);
        } catch (e) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = decodedToken.uid;

        const { code } = await params;

        // Get store
        const store = await Store.findOne({ userId }).lean();

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // Check if coupon belongs to this store
        const existingCoupon = await Coupon.findOne({ code }).lean();

        if (!existingCoupon || existingCoupon.storeId !== store._id.toString()) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        }

        const body = await req.json();
        const {
            description,
            discount,
            discountType,
            minPrice,
            minProductCount,
            specificProducts,
            forNewUser,
            forMember,
            firstOrderOnly,
            oneTimePerUser,
            usageLimit,
            isPublic,
            isActive,
            expiresAt
        } = body;

        // Update coupon
        const updateData = {};
        if (description !== undefined) updateData.description = description;
        if (discount !== undefined) updateData.discount = parseFloat(discount);
        if (discountType !== undefined) updateData.discountType = discountType;
        if (minPrice !== undefined) updateData.minPrice = parseFloat(minPrice);
        if (minProductCount !== undefined) updateData.minProductCount = minProductCount ? parseInt(minProductCount) : null;
        if (specificProducts !== undefined) updateData.specificProducts = specificProducts;
        if (forNewUser !== undefined) updateData.forNewUser = forNewUser;
        if (forMember !== undefined) updateData.forMember = forMember;
        if (firstOrderOnly !== undefined) updateData.firstOrderOnly = firstOrderOnly;
        if (oneTimePerUser !== undefined) updateData.oneTimePerUser = oneTimePerUser;
        if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit) : null;
        if (isPublic !== undefined) updateData.isPublic = isPublic;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (expiresAt) updateData.expiresAt = new Date(expiresAt);
        
        const coupon = await Coupon.findOneAndUpdate(
            { code },
            updateData,
            { new: true }
        ).lean();

        return NextResponse.json({ coupon }, { status: 200 });
    } catch (error) {
        console.error("Error updating coupon:", error);
        return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
    }
}

// DELETE - Delete a coupon
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        
        // Firebase Auth
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const idToken = authHeader.split(" ")[1];
        const { getAuth } = await import('firebase-admin/auth');
        const { initializeApp, applicationDefault, getApps } = await import('firebase-admin/app');
        if (getApps().length === 0) {
            initializeApp({ credential: applicationDefault() });
        }
        let decodedToken;
        try {
            decodedToken = await getAuth().verifyIdToken(idToken);
        } catch (e) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = decodedToken.uid;

        const { code } = await params;

        // Get store
        const store = await Store.findOne({ userId }).lean();

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // Check if coupon belongs to this store
        const existingCoupon = await Coupon.findOne({ code }).lean();

        if (!existingCoupon || existingCoupon.storeId !== store._id.toString()) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        }

        // Delete coupon
        await Coupon.findOneAndDelete({ code });

        return NextResponse.json({ message: "Coupon deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
    }
}
