"use client";
import CarouselProducts from "@/components/admin/CarouselProducts";

export default function CarouselSliderPage() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Carousel Slider Products</h1>
      <p className="mb-6 text-slate-600">Select which products you want to display in the homepage carousel slider. These products will be shown in a horizontal slider below the main banner on your store's homepage.</p>
      <CarouselProducts />
    </div>
  );
}
