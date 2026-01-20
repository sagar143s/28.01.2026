"use client";
import { Suspense, useEffect } from "react";
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

 function ShopContent() {
    // get query params ?search=abc
    const searchParams = useSearchParams();
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const router = useRouter();
    const products = useSelector(state => state.product.list);

    // Debug: Log AI keyword and product names
    useEffect(() => {
        if (search && products?.length) {
            console.log('AI keyword:', search);
            console.log('Product names:', products.map(p => p.name));
            // Log Levenshtein scores for each product
            const searchTerm = search.toLowerCase();
            products.forEach(product => {
                const score = levenshtein(product.name.toLowerCase(), searchTerm);
                console.log(`Product: ${product.name}, Score: ${score}`);
            });
        }
    }, [search, products]);

    // Fuzzy match helper (Levenshtein distance)
    function levenshtein(a, b) {
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
    }

    const applyFilters = (productsToFilter) => {
        return productsToFilter.filter(product => {
            // Fuzzy match for search
            if (search) {
                const productName = product.name.toLowerCase();
                const searchTerm = search.toLowerCase();
                // Substring match or Levenshtein distance <= 2
                if (!productName.includes(searchTerm) && levenshtein(productName, searchTerm) > 2) {
                    return false;
                }
            }
            
            // Category matching (from URL param)
            if (category) {
                const productCategory = product.category?.toLowerCase() || '';
                const categorySlug = category.toLowerCase();
                // Convert both to comparable formats
                const productCategorySlug = productCategory.replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                const productCategoryWords = productCategory.replace(/[^\w\s]/g, '').split(/\s+/);
                const searchWords = categorySlug.split('-');
                // Match if: exact slug match OR category contains all search words OR search is contained in category
                const exactMatch = productCategorySlug === categorySlug;
                const containsAllWords = searchWords.every(word => 
                    productCategoryWords.some(catWord => catWord.includes(word) || word.includes(catWord))
                );
                const partialMatch = productCategory.includes(categorySlug.replace(/-/g, ' ')) || 
                                     categorySlug.replace(/-/g, ' ').includes(productCategory);
                if (!exactMatch && !containsAllWords && !partialMatch) {
                    return false;
                }
            }
            return true;
        });
    };

    const filteredProducts = applyFilters(products);
    const pageTitle = category 
        ? category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : 'All Products';

    return (
        <div className="min-h-[70vh]">
            <div className="max-w-7xl mx-auto flex gap-4 px-4 lg:px-6">
                {/* Filter Sidebar */}
                <div className="hidden lg:block">
                    <FilterSidebar 
                        products={products} 
                        onFilterChange={(filters) => setActiveFilters(filters)}
                    />
                </div>

                {/* Mobile Filter Modal */}
                <MobileFilterModal
                    isOpen={isMobileFilterOpen}
                    onClose={() => setIsMobileFilterOpen(false)}
                    products={products}
                    currentFilters={activeFilters}
                    onApplyFilters={(filters) => setActiveFilters(filters)}
                />

                {/* Products Grid */}
                <div className="flex-1">
                    <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> 
                        {(search || category) && <MoveLeftIcon size={20} />}  
                        {category ? (
                            <>Category: <span className="text-slate-700 font-medium">{pageTitle}</span></>
                        ) : search ? (
                            <>Search: <span className="text-slate-700 font-medium">{search}</span></>
                        ) : (
                            <>All <span className="text-slate-700 font-medium">Products</span></>
                        )}
                    </h1>
                    
                    {/* Mobile Filter Button */}
                    <div className="lg:hidden mb-4">
                        <button 
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                        >
                            Filters & Sort
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 mb-32">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product, idx) => (
                                <ProductCard key={product._id || product.id || idx} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500 text-lg">No products found</p>
                                <button 
                                    onClick={() => router.push('/shop')}
                                    className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                                >
                                    View All Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}