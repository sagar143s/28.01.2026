'use client'

import { Plus, ShoppingCart } from 'lucide-react'

export default function MobileProductActions({ 
  onOrderNow, 
  onAddToCart,
  effPrice,
  currency,
  cartCount,
  isOutOfStock = false
}) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 safe-area-bottom">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Order Now Button */}
        <button
          onClick={onOrderNow}
          disabled={isOutOfStock}
          className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-lg font-bold text-white transition-all shadow-md ${
            isOutOfStock 
              ? 'bg-gray-400 cursor-not-allowed opacity-70' 
              : 'bg-red-500 active:bg-red-600'
          }`}
        >
          <span className="text-base">{isOutOfStock ? 'Out of Stock' : 'Order Now'}</span>
          {!isOutOfStock && <Plus size={20} strokeWidth={3} />}
        </button>

        {/* Add to Cart Button - Hidden when out of stock */}
        {!isOutOfStock && (
          <button
            onClick={onAddToCart}
            className="relative flex items-center justify-center w-16 h-12 rounded-lg transition-all shadow-md bg-green-500 active:bg-green-600"
          >
            <ShoppingCart size={24} className="text-white" strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
