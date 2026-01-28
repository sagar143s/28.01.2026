'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import {
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  CheckCircle2,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/features/cart/cartSlice";
import PageTitle from "@/components/PageTitle";
import Loading from "@/components/Loading";
import DashboardSidebar from "@/components/DashboardSidebar";

const PLACEHOLDER_IMAGE = "/placeholder.png";

/* ----------------------------------------------------
   Normalize wishlist item (API / Guest safe)
---------------------------------------------------- */
const getProduct = (item) => {
  if (!item) return null;

  if (item.product) {
    return {
      ...item.product,
      _pid: item.productId || item.product.id,
    };
  }

  return {
    ...item,
    _pid: item.productId || item.id,
  };
};

function WishlistAuthed() {
  const { user, isSignedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();

  const [wishlist, setWishlist] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------------------
     Load wishlist
  ---------------------------------------------------- */
  useEffect(() => {
    if (authLoading) return;
    isSignedIn ? loadUserWishlist() : loadGuestWishlist();
  }, [authLoading, isSignedIn]);

  const loadGuestWishlist = () => {
    try {
      const data = JSON.parse(
        localStorage.getItem("guestWishlist") || "[]"
      );
      setWishlist(Array.isArray(data) ? data : []);
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserWishlist = async () => {
    try {
      const token = await user.getIdToken(true);
      const { data } = await axios.get("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(Array.isArray(data?.wishlist) ? data.wishlist : []);
    } catch {
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------------------------
     Wishlist actions
  ---------------------------------------------------- */
  const removeFromWishlist = async (pid) => {
    if (!isSignedIn) {
      const updated = wishlist.filter(
        (i) => (i.productId || i.id) !== pid
      );
      localStorage.setItem("guestWishlist", JSON.stringify(updated));
      setWishlist(updated);
      setSelected((s) => s.filter((x) => x !== pid));
      return;
    }

    const token = await user.getIdToken(true);
    await axios.post(
      "/api/wishlist",
      { productId: pid, action: "remove" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setWishlist((w) => w.filter((i) => i.productId !== pid));
    setSelected((s) => s.filter((x) => x !== pid));
  };

  const toggleSelect = (pid) => {
    setSelected((s) =>
      s.includes(pid) ? s.filter((x) => x !== pid) : [...s, pid]
    );
  };

  const selectAll = () => {
    setSelected(
      selected.length === wishlist.length
        ? []
        : wishlist.map((i) => i.productId || i.id)
    );
  };

  const addSelectedToCart = () => {
    selected.forEach((pid) => {
      const item = wishlist.find(
        (i) => (i.productId || i.id) === pid
      );
      const product = getProduct(item);
      if (product) dispatch(addToCart({ product }));
    });
    router.push("/cart");
  };

  const total = selected.reduce((sum, pid) => {
    const item = wishlist.find(
      (i) => (i.productId || i.id) === pid
    );
    const product = getProduct(item);
    return sum + Number(product?.price || 0);
  }, 0);

  if (authLoading || loading) return <Loading />;

  return (
    <>
      <PageTitle title="My Wishlist" />

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[4fr_1fr] gap-6">
        {isSignedIn && <DashboardSidebar />}

        {/* ------------------ LEFT (80%) ------------------ */}
        <main>
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="bg-gradient-to-br from-pink-100 to-red-100 rounded-full p-8 mb-6">
                <HeartIcon size={64} className="text-red-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
              <p className="text-gray-500 mb-8 text-center max-w-md">
                Save items you love by clicking the heart icon on any product
              </p>
              <button
                onClick={() => router.push("/shop")}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3.5 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
                  <p className="text-sm text-gray-500 mt-1">{wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}</p>
                </div>
                <button
                  onClick={selectAll}
                  className="text-orange-600 text-sm font-semibold hover:text-orange-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  {selected.length === wishlist.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlist.map((item) => {
                  const product = getProduct(item);
                  if (!product) return null;

                  const img =
                    product.images?.[0] || PLACEHOLDER_IMAGE;
                  const isSelected = selected.includes(product._pid);
                  const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

                  return (
                    <div
                      key={product._pid}
                      className={`group bg-white rounded-xl border-2 transition-all hover:shadow-xl relative overflow-hidden ${
                        isSelected ? 'border-orange-500 shadow-lg' : 'border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                          {discount}% OFF
                        </div>
                      )}

                      {/* SELECT */}
                      <button
                        onClick={() => toggleSelect(product._pid)}
                        className="absolute top-2 right-2 z-10 transition-transform hover:scale-110"
                      >
                        <div className={`rounded-full p-1 ${isSelected ? 'bg-orange-500' : 'bg-white'}`}>
                          <CheckCircle2
                            size={22}
                            className={
                              isSelected
                                ? "text-white"
                                : "text-gray-400"
                            }
                            strokeWidth={isSelected ? 2.5 : 2}
                          />
                        </div>
                      </button>

                      {/* IMAGE */}
                      <div
                        className="aspect-square p-4 cursor-pointer bg-gray-50 group-hover:bg-gray-100 transition-colors"
                        onClick={() =>
                          router.push(`/product/${product.slug}`)
                        }
                      >
                        <Image
                          src={img}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* INFO */}
                      <div className="px-4 pb-4">
                        <h3 className="text-sm font-medium line-clamp-2 min-h-[40px] text-gray-800 group-hover:text-gray-900">
                          {product.name}
                        </h3>

                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-xl font-bold text-gray-900">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.mrp && (
                            <span className="text-sm text-gray-400 line-through">
                              ₹{product.mrp.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() =>
                              dispatch(addToCart({ product }))
                            }
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 hover:shadow-md"
                          >
                            <ShoppingCartIcon size={16} />
                            Add
                          </button>

                          <button
                            onClick={() =>
                              removeFromWishlist(product._pid)
                            }
                            className="bg-red-50 hover:bg-red-100 text-red-500 p-2.5 rounded-lg transition-all"
                          >
                            <TrashIcon size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>

        {/* ------------------ RIGHT (20%) ------------------ */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-orange-500 rounded-full p-2">
                <ShoppingCartIcon size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Price Summary
              </h3>
            </div>

            <div className="space-y-4 text-sm bg-white rounded-xl p-4 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Selected Items</span>
                <span className="font-semibold text-gray-900 text-lg">{selected.length}</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-gray-900 font-semibold">Total Amount</span>
                <span className="font-bold text-2xl text-orange-600">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              disabled={selected.length === 0}
              onClick={addSelectedToCart}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                selected.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
            >
              {selected.length === 0 ? 'Select Items' : 'Go to Checkout'}
            </button>
            
            {selected.length > 0 && (
              <p className="text-xs text-gray-500 text-center mt-3">
                🎉 {selected.length} {selected.length === 1 ? 'item' : 'items'} ready to checkout
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* ------------------ MOBILE CHECKOUT BAR ------------------ */}
      {selected.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-200 p-4 z-40 shadow-2xl">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">{selected.length} {selected.length === 1 ? 'item' : 'items'} selected</p>
              <p className="font-bold text-xl text-gray-900">₹{total.toLocaleString()}</p>
            </div>
            <button
              onClick={addSelectedToCart}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3.5 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg flex items-center gap-2"
            >
              <ShoppingCartIcon size={20} />
              Checkout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function WishlistPage() {
  return <WishlistAuthed />;
}
