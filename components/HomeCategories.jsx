import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Fast from '../assets/HOME/homecategory/FastDelivery.png'
import Trending from '../assets/HOME/homecategory/Trending.png'
import Men from '../assets/HOME/homecategory/mens.png'
import Women from '../assets/HOME/homecategory/Women.png'
import Kids from '../assets/HOME/homecategory/Kids.png'
import Accessories from '../assets/HOME/homecategory/mobileaccessories.png'
import Home from '../assets/HOME/homecategory/Home&Kitchen.png'
import Beauty from '../assets/HOME/homecategory/Beauty.png'
import Essentials from '../assets/HOME/homecategory/CarEssentials.png'
import Sports from '../assets/HOME/homecategory/sports.png'

const categories = [
  { label: "Fast Delivery", img: Fast, link: "/fast-delivery" },
  { label: "Trending", img: Trending, link: "/shop?category=trending-featured" },
  { label: "Men", img: Men, link: "/shop?category=men-s-fashion" },
  { label: "Women", img: Women, link: "/shop?category=women-s-fashion" },
  { label: "Kids", img: Kids, link: "/shop?category=kids" },
  { label: "Electronics", img: Home, link: "/shop?category=electronics" },
  { label: "Mobile Accessories", img: Accessories, link: "/shop?category=mobile-accessories" },
  { label: "Home & Kitchen", img: Home, link: "/shop?category=home-kitchen" },
  { label: "Beauty", img: Beauty, link: "/shop?category=beauty" },
  { label: "Car Essentials", img: Essentials, link: "/shop?category=car-essentials" },
  { label: "Sports & Fitness", img: Sports, link: "/shop?category=sports-fitness" },
  { label: "Groceries", img: Home, link: "/shop?category=groceries" }
];

export default function HomeCategories() {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    // Desktop: arrows hidden, Mobile: arrows visible
    // using hidden md:block or block md:hidden classes as needed
    <div className="relative w-full max-w-[1250px] mx-auto bg-white-100 py-4 px-2">
      {/* Left Arrow */}
      <button
        className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10"
        onClick={scrollLeft}
      >
        <ChevronLeft />
      </button>

      {/* Scrollable Row */}
      <div
        ref={scrollRef}
        className="px-3 md:px-4 items-center gap-3 md:gap-4 flex md:flex-row md:justify-between overflow-x-auto md:overflow-visible scrollbar-hide"
      >
        {categories.map((cat, idx) => (
          <Link
            key={cat.label + '-' + idx}
            href={cat.link}
            className="flex flex-col items-center min-w-[20vw] max-w-[22vw] md:min-w-0 md:w-full cursor-pointer hover:bg-blue-50 hover:scale-105 transition-all duration-200 rounded-2xl p-2 md:p-3 -m-2 md:-m-3"
          >
            <div className="relative">
              <Image 
                src={cat.img} 
                alt={cat.label} 
                width={60} 
                height={60} 
                className="object-contain md:w-[80px] md:h-[80px]" 
              />
              {cat.badge && (
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-blue-600 text-xs md:text-sm text-white px-3 py-1 rounded-full font-bold shadow-md z-50 border-2 border-white">
                  {cat.badge}
                </span>
              )}
            </div>
            <span className="mt-2 text-[11px] sm:text-sm md:text-base text-center font-medium line-clamp-2 leading-tight">
              {cat.label} {cat.hasDropdown && <span>&#9660;</span>}
            </span>
          </Link>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={scrollRight}
        className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 z-10"
      >
        <ChevronRight />
      </button>
    </div>
  );
}
