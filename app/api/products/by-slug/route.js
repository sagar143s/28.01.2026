import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (!slug) {
        return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }
    // Only select needed fields for performance
    const product = await Product.findOne({ slug })
        .select('name slug description shortDescription mrp price images category sku inStock stockQuantity hasVariants variants attributes hasBulkPricing bulkPricing fastDelivery allowReturn allowReplacement storeId imageAspectRatio createdAt updatedAt')
        .lean();
    if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
}
