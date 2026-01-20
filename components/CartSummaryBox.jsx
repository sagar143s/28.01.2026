import React from "react";
import { useRouter } from "next/navigation";

export default function CartSummaryBox({ subtotal, shipping, total }) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Items</span>
          <span>₹ {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className={shipping === 0 ? 'text-green-600' : 'text-gray-400'}>
            Shipping &amp; handling
          </span>
          <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'text-gray-400'}>
            {shipping === 0 ? 'FREE' : `₹ ${shipping.toLocaleString()}`}
          </span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between font-bold text-base text-gray-800">
          <span>Total</span>
          <span>₹ {total.toLocaleString()}</span>
        </div>
      </div>
      <button
        className="w-full border border-gray-300 rounded-md py-2 font-semibold text-gray-800 mb-3 hover:bg-gray-100 transition"
        onClick={() => router.push("/products")}
      >
        Continue Shopping
      </button>
      <button
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-md transition"
        onClick={() => router.push("/checkout")}
      >
        Checkout
      </button>
    </div>
  );
}
