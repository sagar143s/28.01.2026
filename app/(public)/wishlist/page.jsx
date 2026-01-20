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
            <div className="text-center py-20">
              <HeartIcon size={60} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold">Wishlist is empty</h2>
              <button
                onClick={() => router.push("/shop")}
                className="mt-6 bg-orange-500 text-white px-6 py-3 rounded-lg"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold">
                  {wishlist.length} Items
                </h2>
                <button
                  onClick={selectAll}
                  className="text-orange-500 text-sm font-medium"
                >
                  {selected.length === wishlist.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {wishlist.map((item) => {
                  const product = getProduct(item);
                  if (!product) return null;

                  const img =
                    product.images?.[0] || PLACEHOLDER_IMAGE;
                  const isSelected = selected.includes(product._pid);

                  return (
                    <div
                      key={product._pid}
                      className="bg-white rounded-xl border shadow-sm hover:shadow-md transition relative"
                    >
                      {/* SELECT */}
                      <button
                        onClick={() => toggleSelect(product._pid)}
                        className="absolute top-2 right-2 z-10"
                      >
                        <CheckCircle2
                          size={22}
                          className={
                            isSelected
                              ? "text-orange-500"
                              : "text-gray-300"
                          }
                        />
                      </button>

                      {/* IMAGE */}
                      <div
                        className="aspect-square p-3 cursor-pointer"
                        onClick={() =>
                          router.push(`/product/${product.slug}`)
                        }
                      >
                        <Image
                          src={img}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="object-contain w-full h-full"
                        />
                      </div>

                      {/* INFO */}
                      <div className="px-3 pb-3">
                        <h3 className="text-sm font-medium line-clamp-2 min-h-[40px]">
                          {product.name}
                        </h3>

                        <div className="mt-1">
                          <span className="text-lg font-bold">
                            ₹{product.price}
                          </span>
                          {product.mrp && (
                            <span className="text-sm text-gray-400 line-through ml-2">
                              ₹{product.mrp}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between items-center mt-3">
                          <button
                            onClick={() =>
                              dispatch(addToCart({ product }))
                            }
                            className="bg-orange-500 text-white text-sm px-4 py-2 rounded-lg"
                          >
                            Add
                          </button>

                          <button
                            onClick={() =>
                              removeFromWishlist(product._pid)
                            }
                            className="text-red-500"
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
          <div className="sticky top-24 bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              Price Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Selected</span>
                <span>{selected.length}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              disabled={selected.length === 0}
              onClick={addSelectedToCart}
              className={`w-full mt-5 py-3 rounded-lg font-semibold ${
                selected.length === 0
                  ? "bg-gray-200 text-gray-400"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              Go to Checkout
            </button>
          </div>
        </aside>
      </div>

      {/* ------------------ MOBILE CHECKOUT BAR ------------------ */}
      {selected.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs">{selected.length} selected</p>
              <p className="font-bold">₹{total.toFixed(2)}</p>
            </div>
            <button
              onClick={addSelectedToCart}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg"
            >
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
