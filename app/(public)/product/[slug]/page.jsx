"use client"
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
// import axios from "axios";
import ProductCard from "@/components/ProductCard";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProductBySlug() {
    const { slug } = useParams();
    const [product, setProduct] = useState();
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const products = useSelector(state => state.product.list);

    const fetchProduct = async () => {
        setLoading(true);
        let found = products.find((product) => product.slug === slug);
        // If the Redux product is missing variants, refetch from backend to get full data
        const needsFresh = !found || !Array.isArray(found.variants) || found.variants.length === 0;
        if (needsFresh) {
            try {
                const { data } = await axios.get(`/api/products/by-slug?slug=${encodeURIComponent(slug)}`);
                found = data.product || found || null;
            } catch {
                // keep whatever we had in Redux if API fails
                found = found || null;
            }
        }
        setProduct(found);
        // Get related products from Redux if available
        if (found && products.length > 0) {
            const related = products
                .filter(p => p.slug !== slug && p.category === found.category && p.inStock)
                .slice(0, 5);
            setRelatedProducts(related);
        } else {
            setRelatedProducts([]);
        }
        setLoading(false);
    }

    const fetchReviews = async (productId) => {
        setLoadingReviews(true);
        try {
            const { data } = await axios.get(`/api/review?productId=${productId}`);
            setReviews(data.reviews || []);
        } catch (error) {
            setReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        scrollTo(0, 0);
    }, [slug, products]);

    useEffect(() => {
        if (product && (product._id || product.id)) {
            fetchReviews(product._id || product.id);
        }
    }, [product]);

    // Track browse history for signed-in users
    useEffect(() => {
        if (!product?._id) return;

        const trackView = async (user) => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                await axios.post('/api/browse-history', 
                    { productId: product._id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (error) {
                // Silent fail - don't interrupt user experience
                console.log('Browse history tracking failed:', error.message);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) trackView(user);
        });

        return () => unsubscribe();
    }, [product]);

    return (
        <div className="w-full">
            <div className="max-w-[1250px] mx-auto px-2 sm:px-6 pb-24 lg:pb-0">
                {/* Product Details */}
                {loading ? (
                    <div className="text-center py-16 text-gray-400">Loading product…</div>
                ) : product ? (
                    <>
                        <ProductDetails product={product} reviews={reviews} loadingReviews={loadingReviews} />
                        <ProductDescription product={product} reviews={reviews || []} loadingReviews={loadingReviews} onReviewAdded={() => fetchReviews(product._id || product.id)} />
                        {/* Related Products */}
                        {relatedProducts.length > 0 && (
                            <div className="px-4 mt-12 mb-16">
                                <h2 className="text-2xl font-semibold text-slate-800 mb-6">Related Products</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-6">
                                    {relatedProducts.map((prod) => (
                                        <ProductCard key={prod.id} product={prod} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 text-gray-400">Product not found.</div>
                )}
            </div>
        </div>
    );
}
