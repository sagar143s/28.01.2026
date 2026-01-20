import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Rating from "@/models/Rating";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, description, shortDescription, mrp, price, images, category, sku, inStock, hasVariants, variants, attributes, hasBulkPricing, bulkPricing, fastDelivery, allowReturn, allowReplacement, storeId, slug, imageAspectRatio = '1:1' } = body;

        // Generate slug from name if not provided
        const productSlug = slug || name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');

        // Check if slug is unique
        const existing = await Product.findOne({ slug: productSlug });
        if (existing) {
            return NextResponse.json({ error: "Slug already exists. Please use a different product name." }, { status: 400 });
        }

        const product = await Product.create({
            name,
            slug: productSlug,
            description,
            shortDescription,
            mrp,
            price,
            images,
            category,
            sku,
            inStock,
            hasVariants,
            variants,
            attributes,
            hasBulkPricing,
            bulkPricing,
            fastDelivery,
            allowReturn,
            allowReplacement,
            storeId,
            imageAspectRatio,
        });

        return NextResponse.json({ product }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Error creating product', details: error.message, stack: error.stack }, { status: 500 });
    }
}


export async function GET(request){
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const sortBy = searchParams.get('sortBy');
        const limit = parseInt(searchParams.get('limit') || '50', 10); // increased default
        const offset = parseInt(searchParams.get('offset') || '0', 10);
        const fastDelivery = searchParams.get('fastDelivery');
        
        // Build query
        const query = { inStock: true };
        if (fastDelivery === 'true') {
            query.fastDelivery = true;
        }
        
        // Optimized query with field selection
        let products = await Product.find(query)
            .select('name slug description shortDescription mrp price images category sku hasVariants variants attributes fastDelivery stockQuantity imageAspectRatio createdAt')
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean()
            .exec();

        // Add discount label and review stats if applicable
        products = await Promise.all(products.map(async product => {
            try {
                let label = null;
                let labelType = null;
                if (typeof product.mrp === 'number' && typeof product.price === 'number' && product.mrp > product.price) {
                    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
                    if (discount >= 50) {
                        label = `Min. ${discount}% Off`;
                        labelType = 'offer';
                    } else if (discount > 0) {
                        label = `${discount}% Off`;
                        labelType = 'offer';
                    }
                }

                // Fetch review stats
                const reviews = await Rating.find({ productId: String(product._id), approved: true }).select('rating').lean();
                const ratingCount = reviews.length;
                const averageRating = ratingCount > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount) : 0;

                return {
                    ...product,
                    label,
                    labelType,
                    ratingCount,
                    averageRating
                };
            } catch (err) {
                console.error('Error mapping product review stats:', err);
                return {
                    ...product,
                    label: null,
                    labelType: null,
                    ratingCount: 0,
                    averageRating: 0,
                    reviewError: err.message
                };
            }
        }));

        // Sort based on the sortBy parameter
        if (sortBy === 'orders') {
            // Placeholder: implement order-based sorting if you have order data
        } else if (sortBy === 'rating') {
            // Placeholder: implement rating-based sorting if you have rating data
        }

        return NextResponse.json({ products }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });
    } catch (error) {
        console.error('Error in products API:', error);
        if (error instanceof Error && error.stack) {
            console.error('Stack trace:', error.stack);
        }
        return NextResponse.json({ error: "An internal server error occurred.", details: error.message, stack: error.stack }, { status: 500 });
    }
}