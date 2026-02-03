import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Rating from "@/models/Rating";
import Category from "@/models/Category";
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
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50); // Default 20, max 50
        const offset = parseInt(searchParams.get('offset') || '0', 10);
        const fastDelivery = searchParams.get('fastDelivery');
        
        // OPTIMIZED: Use MongoDB aggregation pipeline instead of find + populate
        const matchStage = { inStock: true };
        if (fastDelivery === 'true') {
            matchStage.fastDelivery = true;
        }

        const aggregationPipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            {
                $addFields: {
                    category: { $arrayElemAt: ['$categoryData.name', 0] },
                    discount: {
                        $cond: [
                            { $and: [
                                { $gt: ['$mrp', '$price'] },
                                { $ne: ['$mrp', null] },
                                { $ne: ['$price', null] }
                            ] },
                            { $round: [{ $multiply: [{ $divide: [{ $subtract: ['$mrp', '$price'] }, '$mrp'] }, 100] }] },
                            null
                        ]
                    }
                }
            },
            { $project: { categoryData: 0 } }, // Remove temp field
            { 
                $addFields: {
                    label: {
                        $cond: [
                            { $gte: ['$discount', 50] },
                            { $concat: ['Min. ', { $toString: '$discount' }, '% Off'] },
                            {
                                $cond: [
                                    { $gt: ['$discount', 0] },
                                    { $concat: [{ $toString: '$discount' }, '% Off'] },
                                    null
                                ]
                            }
                        ]
                    },
                    labelType: {
                        $cond: [
                            { $gt: ['$discount', 0] },
                            'offer',
                            null
                        ]
                    }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: offset },
            { $limit: limit }
        ];

        const products = await Product.aggregate(aggregationPipeline).lean().exec();

        // FIX N+1: Batch fetch all ratings in ONE query
        const productIds = products.map(p => String(p._id));
        const allRatings = await Rating.find({ 
            productId: { $in: productIds }, 
            approved: true 
        }).select('productId rating').lean();
        
        // Create a map of productId -> ratings for O(1) lookup
        const ratingsMap = {};
        allRatings.forEach(review => {
            if (!ratingsMap[review.productId]) {
                ratingsMap[review.productId] = [];
            }
            ratingsMap[review.productId].push(review.rating);
        });

        // Enrich with ratings - synchronous, no async overhead
        const enrichedProducts = products.map(product => {
            try {
                const reviews = ratingsMap[String(product._id)] || [];
                const ratingCount = reviews.length;
                const averageRating = ratingCount > 0 ? (reviews.reduce((sum, r) => sum + r, 0) / ratingCount) : 0;

                return {
                    ...product,
                    ratingCount,
                    averageRating
                };
            } catch (err) {
                console.error('Error enriching product:', err);
                return {
                    ...product,
                    ratingCount: 0,
                    averageRating: 0
                };
            }
        });

        return NextResponse.json({ products: enrichedProducts }, {
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200' // 10 min cache, 20 min stale
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