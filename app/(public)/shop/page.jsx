"use client";
import { Suspense, useMemo, useState, useCallback } from "react";
import ProductCard from "@/components/ProductCard"
import ProductFilterSidebar from "@/components/ProductFilterSidebar"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

function ShopContent() {
    const searchParams = useSearchParams();
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const router = useRouter();
    const products = useSelector(state => state.product.list);
    const loading = useSelector(state => state.product.loading);
    
    const [activeFilters, setActiveFilters] = useState({
        categories: [],
        priceRange: { min: 0, max: 100000 },
        rating: 0,
        inStock: false,
        sortBy: 'popularity'
    });

    // Fuzzy match helper (Levenshtein distance)
    const levenshtein = (a, b) => {
        const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
        for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
        for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return matrix[a.length][b.length];
    };

    // Apply filters
    const applyFilters = useCallback((productsToFilter) => {
        return productsToFilter.filter(product => {
            // Fuzzy match for search
            if (search) {
                const productName = product.name.toLowerCase();
                const searchTerm = search.toLowerCase();
                if (!productName.includes(searchTerm) && levenshtein(productName, searchTerm) > 2) {
                    return false;
                }
            }

            // Category matching (from URL param)
            if (category) {
                // Get all category values (single category field + categories array)
                const productCategories = [
                    product.category,
                    ...(Array.isArray(product.categories) ? product.categories : [])
                ].filter(Boolean);
                
                // If no categories at all, skip this product
                if (productCategories.length === 0) {
                    return false;
                }
                
                const categorySlug = category.toLowerCase();
                const normalizedSearchCat = categorySlug.replace(/-/g, ' ').replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                const searchWords = normalizedSearchCat.split(' ').filter(w => w.length > 0);
                
                // Check if ANY of the product's categories match
                const hasMatchingCategory = productCategories.some(prodCat => {
                    const productCategory = prodCat.toLowerCase();
                    const normalizedProductCat = productCategory.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                    const productCategorySlug = productCategory.replace(/[^\w\s]/g, '').replace(/\s+/g, '-').toLowerCase();
                    const productWords = normalizedProductCat.split(' ').filter(w => w.length > 0);
                    
                    // Strict matching strategies to avoid cross-category matches
                    const exactMatch = productCategorySlug === categorySlug;
                    const normalizedMatch = normalizedProductCat === normalizedSearchCat;
                    
                    // Check if all search words appear as full words in product category
                    const allWordsMatch = searchWords.length > 0 && searchWords.every(searchWord => 
                        productWords.some(productWord => productWord === searchWord)
                    );
                    
                    return exactMatch || normalizedMatch || allWordsMatch;
                });
                
                if (!hasMatchingCategory) {
                    return false;
                }
            }

            // Filter by selected categories from sidebar
            if (activeFilters.categories.length > 0) {
                const productCategories = [
                    product.category,
                    ...(Array.isArray(product.categories) ? product.categories : [])
                ].filter(Boolean);
                
                const hasMatchingCategory = productCategories.some(cat => 
                    activeFilters.categories.includes(cat)
                );
                if (!hasMatchingCategory) return false;
            }

            // Filter by price range
            if (product.price < activeFilters.priceRange.min || product.price > activeFilters.priceRange.max) {
                return false;
            }

            // Filter by rating
            if (activeFilters.rating > 0) {
                const avgRating = product.averageRating || 0;
                if (avgRating < activeFilters.rating) return false;
            }

            // Filter by stock availability
            if (activeFilters.inStock && product.inStock === false) {
                return false;
            }

            return true;
        });
    }, [activeFilters, search, category, levenshtein]);

    // Apply sorting
    const sortProducts = useCallback((productsToSort) => {
        const sorted = [...productsToSort];
        
        switch (activeFilters.sortBy) {
            case 'price-low-high':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high-low':
                return sorted.sort((a, b) => b.price - a.price);
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            case 'rating':
                return sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
            case 'discount':
                return sorted.sort((a, b) => {
                    const discountA = a.mrp > a.price ? ((a.mrp - a.price) / a.mrp * 100) : 0;
                    const discountB = b.mrp > b.price ? ((b.mrp - b.price) / b.mrp * 100) : 0;
                    return discountB - discountA;
                });
            case 'popularity':
            default:
                return sorted.sort((a, b) => {
                    const aRatings = a.rating?.length || 0;
                    const bRatings = b.rating?.length || 0;
                    return bRatings - aRatings;
                });
        }
    }, [activeFilters.sortBy]);

    const filteredAndSortedProducts = useMemo(() => {
        const filtered = applyFilters(products);
        return sortProducts(filtered);
    }, [products, applyFilters, sortProducts]);

    const handleFilterChange = useCallback((filters) => {
        setActiveFilters(filters);
    }, []);

    const pageTitle = category 
        ? category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : 'All Products';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-[1250px] mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6 mt-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {category ? `${pageTitle}` : search ? `Search: ${search}` : 'All Products'}
                    </h1>
                    <p className="text-gray-600">
                        {category ? `Browse our ${pageTitle} collection` : search ? `Results for "${search}"` : 'Discover our complete product collection'}
                    </p>
                </div>

                <div className="flex gap-6">
                    {/* Filter Sidebar */}
                    <div className="hidden lg:block flex-shrink-0">
                        <ProductFilterSidebar 
                            products={products} 
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading || products.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
                                <p className="text-gray-500 text-lg">Loading products...</p>
                            </div>
                        ) : filteredAndSortedProducts.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                                <p className="text-gray-500 text-lg">No products match your filters.</p>
                                <button 
                                    onClick={() => {
                                        setActiveFilters({
                                            categories: [],
                                            priceRange: { min: 0, max: 100000 },
                                            rating: 0,
                                            inStock: false,
                                            sortBy: 'popularity'
                                        });
                                        if (category || search) {
                                            router.push('/shop');
                                        }
                                    }}
                                    className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                                {filteredAndSortedProducts.map((product) => (
                                    <ProductCard key={product._id || product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}