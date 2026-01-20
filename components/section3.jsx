"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Dummy from '../assets/ads.png';

export default function TopDeals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: sectionData }, { data: productData }] = await Promise.all([
          axios.get("/api/admin/home-sections"),
          axios.get("/api/products")
        ]);

        const adminSections = sectionData.sections || [];
        const allProducts = productData.products || productData;

        const section = adminSections.find(s => s.category);
// let result = allProducts.filter(p => p.category === "Trending Deals");
let result = allProducts;
        if (section && section.category) {
          result = allProducts.filter(p => p.category === section.category);
        }

        setProducts(result);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="w-full flex justify-center px-4 mt-8 ">
      <div className="w-full max-w-[1250px] flex gap-6">

        {/* LEFT GRID PRODUCTS */}
        <div className="flex-1">
          <h2 className="text-lg sm:text-[28px] font-semibold mb-3 sm:mb-5">Top Deals</h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-6">
              {[...Array(10)].map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="cursor-pointer text-center"
                >
                  {/* Skeleton Image */}
                  <div
                    className="w-[80px] h-[70px] sm:w-[150px] sm:h-[140px] mx-auto rounded-md"
                    style={{
                      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite',
                    }}
                  />
                  {/* Skeleton Title */}
                  <div
                    className="h-3 sm:h-4 mx-auto mt-1 sm:mt-2 rounded"
                    style={{
                      width: '80%',
                      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite',
                    }}
                  />
                  {/* Skeleton Price */}
                  <div
                    className="h-3 sm:h-4 mx-auto mt-0.5 sm:mt-1 rounded"
                    style={{
                      width: '50%',
                      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite',
                    }}
                  />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-gray-500 py-5 text-center">No Deals Found</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-6">

{products?.slice(0, 10).map((item, i) => {
                const img =
                  item.images?.[0] && item.images[0] !== ""
                    ? item.images[0]
                    : "https://ik.imagekit.io/jrstupuke/placeholder.png";

                return (
                  <a
                    key={i}
                    href={`/product/${item.slug}`}
                    className="cursor-pointer text-center block"
                  >
                    <img
                      src={img}
                      alt={item.name}
                      className="w-[80px] h-[70px] sm:w-[150px] sm:h-[140px] mx-auto object-contain hover:scale-105 transition-all duration-200"
                      onError={e => { e.currentTarget.src = "https://ik.imagekit.io/jrstupuke/placeholder.png"; }}
                    />
                    <p className="text-[10px] sm:text-[15px] font-medium mt-1 sm:mt-2 truncate">
                      {item.name}
                    </p>
                    <p className="font-bold text-[9px] sm:text-[16px] mt-0.5 sm:mt-1">
                      From ₹{item.price}
                    </p>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT FIXED BANNER */}
        <div className="w-[300px] hidden md:block">
          <Image
            src={Dummy}   // <--- Replace with banner
            alt="Offer Banner"
            className="w-full rounded-lg shadow"
          />
        </div>
      </div>
    </div>
  );
}
