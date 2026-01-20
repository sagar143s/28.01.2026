"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCartIcon, StarIcon } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'

import { useAuth } from '@/lib/useAuth'
import { addToCart, uploadCart } from '@/lib/features/cart/cartSlice'

import toast from 'react-hot-toast'

// Pick a usable image source with graceful fallbacks
const getImageSrc = (product) => {
    if (Array.isArray(product.images) && product.images.length) {
        const first = product.images[0]
        if (first?.url) return first.url
        if (first?.src) return first.src
        if (typeof first === 'string' && first.trim() !== '') return first
    }
    return 'https://ik.imagekit.io/jrstupuke/placeholder.png'
}

// Normalize price-like values (numbers or strings with currency symbols)
const parseAmount = (value) => {
    const num = Number(String(value ?? '').replace(/[^0-9.]/g, ''))
    return Number.isNaN(num) ? 0 : num
}

// Best-guess sale price from common fields
const getSalePrice = (product) => parseAmount(
    product.price ??
    product.salePrice ?? product.sale_price ??
    product.discountedPrice ?? product.discounted_price ??
    product.sellingPrice ?? product.selling_price ??
    product.offerPrice ?? product.offer_price ??
    product.currentPrice ?? product.current_price
)

// Best-guess MRP/compare-at price from common fields
const getMrpPrice = (product) => parseAmount(
    product.mrp ??
    product.compareAtPrice ?? product.compare_at_price ??
    product.originalPrice ?? product.original_price ??
    product.listPrice ?? product.list_price ??
    product.basePrice ?? product.base_price ??
    product.regularPrice ?? product.regular_price
)

const ProductCard = ({ product }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const dispatch = useDispatch()
    const { getToken } = useAuth()
    const cartItems = useSelector(state => state.cart.cartItems)
    const itemQuantity = cartItems[product._id] || 0

    const [reviews, setReviews] = useState([])
    const [, setLoadingReviews] = useState(false)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoadingReviews(true)
                const { data } = await import('axios').then(ax => ax.default.get(`/api/review?productId=${product._id}`))
                setReviews(data.reviews || [])
            } catch (error) {
                // silent fail
            } finally {
                setLoadingReviews(false)
            }
        }
        fetchReviews()
    }, [product._id])

    const averageRating = reviews.length > 0
        ? Math.round(reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length)
        : Math.round(product.averageRating || 0)

    const ratingCount = reviews.length > 0
        ? reviews.length
        : (typeof product.ratingCount === 'number' ? product.ratingCount : 0)

    let priceNum = getSalePrice(product)
    let mrpNum = getMrpPrice(product)
    const explicitDiscount = parseAmount(
        product.discountPercent ?? product.discount_percent ??
        product.discountPercentage ?? product.discount_percentage ??
        product.discount
    )

    // If only one price plus a percent is present, synthesize the other
    if (priceNum === 0 && mrpNum > 0 && explicitDiscount > 0) {
        priceNum = +(mrpNum * (1 - explicitDiscount / 100)).toFixed(2)
    }
    if (mrpNum === 0 && priceNum > 0 && explicitDiscount > 0) {
        mrpNum = +(priceNum / (1 - explicitDiscount / 100)).toFixed(2)
    }

    const discount = mrpNum > priceNum && priceNum > 0
        ? Math.round(((mrpNum - priceNum) / mrpNum) * 100)
        : explicitDiscount > 0
            ? Math.round(explicitDiscount)
            : 0

    const hasFastDelivery = Boolean(
        product.fastDelivery || product.fast_delivery ||
        product.fastDeliveryAvailable || product.fast_delivery_available ||
        product.isFastDelivery || product.is_fast_delivery ||
        product.fast || product.expressDelivery || product.express_delivery ||
        product.deliverySpeed === 'fast' || product.delivery_speed === 'fast'
    )

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(addToCart({ productId: product._id }))
        dispatch(uploadCart({ getToken }))
        toast.success('Added to cart')
    }

    const displayName = (product.name || product.title || 'Untitled Product').length > 50
        ? `${(product.name || product.title || 'Untitled Product').slice(0, 50)}...`
        : (product.name || product.title || 'Untitled Product')

    const showPrice = priceNum > 0 || mrpNum > 0

    const imageSrc = getImageSrc(product)

    return (
        <Link href={`/product/${product.slug || product._id || ''}`} className="group w-full">
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full relative">
                {/* Product Image */}
                <div className={`relative w-full bg-gray-50 overflow-hidden ${getAspectRatioClass(product.aspectRatio)}`}>
                    {hasFastDelivery && (
                        <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm z-20 pointer-events-none">
                            Fast Delivery
                        </span>
                    )}
                    {discount > 0 && (
                        <span className={`absolute top-3 right-3 ${discount >= 50 ? 'bg-green-500' : 'bg-orange-500'} text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm z-20 pointer-events-none`}>
                            {discount}% OFF
                        </span>
                    )}
                    <Image
                        src={imageSrc}
                        alt={displayName}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                            if (e.currentTarget.src !== 'https://ik.imagekit.io/jrstupuke/placeholder.png') {
                                e.currentTarget.src = 'https://ik.imagekit.io/jrstupuke/placeholder.png'
                            }
                        }}
                    />
                </div>

                {/* Product Details */}
                <div className="flex flex-col p-2 sm:p-2.5 flex-1">
                    <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-1 mb-0.5">
                        {displayName}
                    </h3>

                    <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-0.5">
                            {ratingCount > 0 ? (
                                <>
                                    <div className="flex items-center">
                                        {Array(5).fill('').map((_, index) => (
                                            <StarIcon
                                                key={index}
                                                size={10}
                                                className="text-yellow-400"
                                                fill={averageRating >= index + 1 ? '#FBBF24' : 'none'}
                                                stroke={averageRating >= index + 1 ? '#FBBF24' : '#D1D5DB'}
                                                strokeWidth={1.5}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] sm:text-[11px] text-gray-400">({ratingCount})</span>
                                </>
                            ) : (
                                <span className="text-[10px] sm:text-[11px] text-red-400">No reviews</span>
                            )}
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-700 hover:bg-slate-800 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 relative flex-shrink-0"
                        >
                            <ShoppingCartIcon className="text-white" size={15} strokeWidth={2} />
                            {itemQuantity > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold min-w-[15px] h-[15px] sm:min-w-[16px] sm:h-[16px] rounded-full flex items-center justify-center shadow-md border-2 border-white px-0.5">
                                    {itemQuantity > 99 ? '99+' : itemQuantity}
                                </span>
                            )}
                        </button>
                    </div>

                    {showPrice && (
                        <div className="flex items-center gap-1.5">
                            {priceNum > 0 && (
                                <p className="text-sm sm:text-base font-bold text-gray-900">{currency} {priceNum.toFixed(2)}</p>
                            )}
                            {mrpNum > 0 && mrpNum > priceNum && priceNum > 0 && (
                                <p className="text-[10px] sm:text-xs text-gray-400 line-through">{currency} {mrpNum.toFixed(2)}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

// Helper function for aspect ratio CSS class
function getAspectRatioClass(ratio) {
    switch (ratio) {
        case '1:1': return 'aspect-square'
        case '4:6': return 'aspect-[2/3]'
        case '2:3': return 'aspect-[2/3]'
        case '3:4': return 'aspect-[3/4]'
        case '16:9': return 'aspect-[16/9]'
        case '9:16': return 'aspect-[9/16]'
        case '4:5': return 'aspect-[4/5]'
        case '5:7': return 'aspect-[5/7]'
        case '7:10': return 'aspect-[7/10]'
        case '5:8': return 'aspect-[5/8]'
        case '3:2': return 'aspect-[3/2]'
        case '8:10': return 'aspect-[8/10]'
        case '11:14': return 'aspect-[11/14]'
        default: return 'aspect-square'
    }
}

export default ProductCard

