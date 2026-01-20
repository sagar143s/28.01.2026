'use client'
import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const Section4 = ({ sections }) => {
  const router = useRouter()

  if (!sections || sections.length === 0) return null

  return (
    <div className="w-full bg-white py-6 px-4">
        <div className="space-y-8">
          {sections.map((section, sectionIdx) => (
            <GridSection key={section._id || sectionIdx} section={section} router={router} />
          ))}
        </div>
    </div>
  )
}

const GridSection = ({ section, router }) => {
  const { title, category, products = [] } = section

  if (!products || products.length === 0) return null

  return (
    <div className="w-full mb-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2 mt-5">
        <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{title || category}</h3>
        <button
          onClick={() => router.push(`/shop?category=${category}`)}
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm flex-shrink-0"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Products Grid - 3 columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4">
        {products.map((product, idx) => (
          <div
            key={product._id || idx}
            onClick={() => router.push(`/product/${product.slug}`)}
            className="flex-shrink-0 snap-start cursor-pointer group"
          >
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-t-lg">
                <Image
                  src={product.image || product.images?.[0] || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 16vw"
                />
                {product.discount && (
                  <div className="absolute top-1 left-1 bg-green-500 text-white text-[8px] sm:text-xs font-bold px-1.5 py-0.5 rounded shadow-md">
                    {product.discount}
                  </div>
                )}
                {product.badge && (
                  <div className="absolute top-1 right-1 bg-red-500 text-white text-[8px] sm:text-xs font-bold px-1.5 py-0.5 rounded shadow-md">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-2 sm:p-3">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 mb-1 leading-tight">
                  {product.name}
                </h4>
                {product.offer && (
                  <p className="text-[10px] sm:text-xs font-bold text-green-600">
                    {product.offer}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  )
}

export default Section4