import dbConnect from "@/lib/mongodb";
import ShippingSetting from "@/models/ShippingSetting";
import authSeller from "@/middlewares/authSeller";

import { NextResponse } from "next/server";

// GET: Public - return shipping settings for a specific store
// Pass ?storeId=xxx in query params
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    
    let setting;
    if (storeId) {
      setting = await ShippingSetting.findOne({ storeId }).lean();
    } else {
      // Fallback: get the first store's settings (for backward compatibility)
      setting = await ShippingSetting.findOne({}).lean();
    }
    
    return NextResponse.json({
      setting: setting || {
        enabled: false,
        shippingType: "FLAT_RATE",
        flatRate: 0,
        perItemFee: 0,
        maxItemFee: null,
        weightUnit: "kg",
        baseWeight: 1,
        baseWeightFee: 0,
        additionalWeightFee: 0,
        freeShippingMin: 0,
        localDeliveryFee: null,
        regionalDeliveryFee: null,
        estimatedDays: "3-5",
        enableCOD: true,
        codFee: 0,
        enableExpressShipping: false,
        expressShippingFee: 0,
        expressEstimatedDays: "1-2"
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// PUT: Seller only - update or create singleton settings
export async function PUT(request) {
  try {
    // Extract userId from Firebase token in Authorization header
    const authHeader = request.headers.get("authorization");
    let userId = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const idToken = authHeader.split(" ")[1];
      const { getAuth } = await import("firebase-admin/auth");
      const { initializeApp, applicationDefault, getApps } = await import("firebase-admin/app");
      if (getApps().length === 0) {
        initializeApp({ credential: applicationDefault() });
      }
      try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        userId = decodedToken.uid;
      } catch (e) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const storeId = await authSeller(userId);
    if (!storeId) return NextResponse.json({ error: "not authorized" }, { status: 401 });

    const body = await request.json();
    const data = {
      storeId,  // Associate settings with the seller's store
      enabled: Boolean(body.enabled ?? true),
      shippingType: body.shippingType || "FLAT_RATE",
      // Flat Rate
      flatRate: Number(body.flatRate ?? 5),
      // Per Item
      perItemFee: Number(body.perItemFee ?? 2),
      maxItemFee: body.maxItemFee ? Number(body.maxItemFee) : null,
      // Weight Based
      weightUnit: body.weightUnit || "kg",
      baseWeight: Number(body.baseWeight ?? 1),
      baseWeightFee: Number(body.baseWeightFee ?? 5),
      additionalWeightFee: Number(body.additionalWeightFee ?? 2),
      // Free Shipping
      freeShippingMin: Number(body.freeShippingMin ?? 499),
      // Regional
      localDeliveryFee: body.localDeliveryFee ? Number(body.localDeliveryFee) : null,
      regionalDeliveryFee: body.regionalDeliveryFee ? Number(body.regionalDeliveryFee) : null,
      // Delivery Time
      estimatedDays: body.estimatedDays || "3-5",
      // COD
      enableCOD: Boolean(body.enableCOD ?? true),
      codFee: Number(body.codFee ?? 0),
      // Express
      enableExpressShipping: Boolean(body.enableExpressShipping ?? false),
      expressShippingFee: Number(body.expressShippingFee ?? 20),
      expressEstimatedDays: body.expressEstimatedDays || "1-2"
    };

    await dbConnect();
    const setting = await ShippingSetting.findOneAndUpdate(
      { storeId },  // Find by storeId (one setting per store)
      data,
      { upsert: true, new: true }
    );
    return NextResponse.json({ setting });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
