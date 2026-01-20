"use client";

import React, { useState, useEffect } from "react";
import { countryCodes } from "@/assets/countryCodes";
import { indiaStatesAndDistricts } from "@/assets/indiaStatesAndDistricts";
import { useSelector, useDispatch } from "react-redux";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { clearCart } from "@/lib/features/cart/cartSlice";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { fetchShippingSettings, calculateShipping } from "@/lib/shipping";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import dynamic from "next/dynamic";
import Script from "next/script";
import Creditimage1 from '../../../assets/creditcards/19 - Copy.webp';
import Creditimage2 from '../../../assets/creditcards/16 - Copy.webp';
import Creditimage3 from '../../../assets/creditcards/20.webp';
import Creditimage4 from '../../../assets/creditcards/11.webp';
import Image from "next/image";

const SignInModal = dynamic(() => import("@/components/SignInModal"), { ssr: false });
const AddressModal = dynamic(() => import("@/components/AddressModal"), { ssr: false });
const PincodeModal = dynamic(() => import("@/components/PincodeModal"), { ssr: false });
const PrepaidUpsellModal = dynamic(() => import("@/components/PrepaidUpsellModal"), { ssr: false });

export default function CheckoutPage() {
  const { user, loading: authLoading, getToken } = useAuth();
  const dispatch = useDispatch();
  const addressList = useSelector((state) => state.address?.list || []);
  const addressFetchError = useSelector((state) => state.address?.error);
  const { cartItems } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.product.list);
  
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const [form, setForm] = useState({
    addressId: "",
    payment: "cod",
    phoneCode: '+91',
    country: 'India',
    state: 'Kerala',
    district: '',
    street: '',
    city: '',
    pincode: '',
    name: '',
    email: '',
    phone: '',
  });

  // For India state/district dropdowns
  const keralaDistricts = indiaStatesAndDistricts.find(s => s.state === 'Kerala')?.districts || [];
  const [districts, setDistricts] = useState(keralaDistricts);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [payingNow, setPayingNow] = useState(false);
  const [showPrepaidModal, setShowPrepaidModal] = useState(false);
  const [upsellOrderId, setUpsellOrderId] = useState(null);
  const [upsellOrderTotal, setUpsellOrderTotal] = useState(0);
  const [navigatingToSuccess, setNavigatingToSuccess] = useState(false);
  const [shippingSetting, setShippingSetting] = useState(null);
  const [shipping, setShipping] = useState(0);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Coupon logic
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!coupon.trim()) {
      setCouponError("Enter a coupon code to see discount.");
      return;
    }
    setCouponError("");
    // TODO: Add real coupon validation logic here
  };

  const router = useRouter();

  // Fetch products if not loaded
  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts({}));
    }
  }, [dispatch, products]);

  // Fetch addresses for logged-in users
  useEffect(() => {
    if (user && getToken) {
      dispatch(fetchAddress({ getToken }));
    }
  }, [user, getToken, dispatch]);

  // Auto-select first address
  useEffect(() => {
    if (user && addressList.length > 0 && !form.addressId) {
      setForm((f) => ({ ...f, addressId: addressList[0]._id }));
    }
  }, [user, addressList, form.addressId]);

  // Auto-open pincode modal for guests without saved addresses or when no address is present
  useEffect(() => {
    if (!authLoading && !user && addressList.length === 0 && !form.pincode) {
      const timer = setTimeout(() => {
        setShowPincodeModal(true);
      }, 500); // Small delay for better UX
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, addressList, form.pincode]);

  const handlePincodeSubmit = (pincodeData) => {
    setForm(f => ({
      ...f,
      pincode: pincodeData.pincode,
      city: pincodeData.city,
      district: pincodeData.district,
      state: pincodeData.state,
      country: pincodeData.country
    }));
    // Update districts for the selected state
    const stateObj = indiaStatesAndDistricts.find(s => s.state === pincodeData.state);
    if (stateObj) {
      setDistricts(stateObj.districts);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    const confirmed = window.confirm("Are you sure you want to delete this address? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const token = await getToken();
      const res = await fetch(`/api/address/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Refresh address list
        dispatch(fetchAddress({ getToken }));
        setFormError("");
      } else {
        const error = await res.json();
        setFormError(error.message || "Failed to delete address");
      }
    } catch (error) {
      setFormError("Failed to delete address. Please try again.");
    }
  };

  // Build cart array
  const cartArray = [];
  console.log('Checkout - Cart Items:', cartItems);
  console.log('Checkout - Products:', products?.map(p => ({ id: p._id, name: p.name })));
  
  for (const [key, value] of Object.entries(cartItems || {})) {
    const product = products?.find((p) => String(p._id) === String(key));
    const qty = typeof value === 'number' ? value : value?.quantity || 0;
    const priceOverride = typeof value === 'number' ? undefined : value?.price;
    if (product && qty > 0) {
      console.log('Found product for key:', key, product.name);
      const unitPrice = priceOverride ?? product.price ?? 0;
      cartArray.push({ ...product, quantity: qty, _cartPrice: unitPrice });
    } else {
      console.log('No product found for key:', key);
    }
  }
  
  console.log('Checkout - Final Cart Array:', cartArray);

  const subtotal = cartArray.reduce((sum, item) => sum + (item._cartPrice ?? item.price ?? 0) * item.quantity, 0);
  const total = subtotal + shipping;

  // Load shipping settings - refetch on page load and when products change
  useEffect(() => {
    async function loadShipping() {
      const setting = await fetchShippingSettings();
      setShippingSetting(setting);
      console.log('Shipping settings loaded:', setting);
    }
    loadShipping();
  }, [products]); // Refetch when products load

  // Calculate dynamic shipping based on settings
  useEffect(() => {
    if (shippingSetting && cartArray.length > 0) {
      const calculatedShipping = calculateShipping({ 
        cartItems: cartArray, 
        shippingSetting,
        paymentMethod: form.payment === 'cod' ? 'COD' : 'CARD'
      });
      setShipping(calculatedShipping);
      console.log('Calculated shipping:', calculatedShipping, 'Settings:', shippingSetting, 'Payment:', form.payment);
    } else {
      setShipping(0);
    }
  }, [shippingSetting, cartArray, form.payment]);

  // Redirect to shop when cart is empty (must be a top-level hook)
  useEffect(() => {
    if (!authLoading && (!cartItems || Object.keys(cartItems).length === 0) && !placingOrder && !showPrepaidModal) {
      const timer = setTimeout(() => {
        router.push('/shop');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, cartItems, router, placingOrder, showPrepaidModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      // Update districts when state changes
      const stateObj = indiaStatesAndDistricts.find(s => s.state === value);
      setDistricts(stateObj ? stateObj.districts : []);
      setForm(f => ({ ...f, state: value, district: '' }));
    } else if (name === 'country') {
      setForm(f => ({ ...f, country: value, state: '', district: '' }));
      if (value !== 'India') setDistricts([]);
    } else if (name === 'payment') {
      // If trying to select COD and not logged in, show sign-in instead
      if (value === 'cod' && !user) {
        setShowSignIn(true);
        return; // Don't change the payment method yet
      }
      setForm(f => ({ ...f, [name]: value }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Razorpay Payment Handler
  const handleRazorpayPayment = async (paymentPayload) => {
    if (!razorpayLoaded) {
      setFormError("Payment system is loading. Please wait...");
      return false;
    }

    if (!window.Razorpay) {
      setFormError("Payment system failed to load. Please refresh and try again.");
      setPlacingOrder(false);
      return false;
    }

    try {
      // Step 1: Create Razorpay order on backend
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total), // Ensure it's a whole number
          currency: "INR",
          receipt: `order_${Date.now()}`,
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        setFormError(errorData.error || "Failed to create payment order");
        setPlacingOrder(false);
        return false;
      }

      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.orderId) {
        setFormError("Failed to initialize payment");
        setPlacingOrder(false);
        return false;
      }

      // Step 2: Open Razorpay checkout with the order ID
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: orderData.orderId, // Use the order ID from backend
        amount: Math.round(total * 100), // Amount in paise
        currency: "INR",
        name: "QuickFynd",
        description: "Order Payment",
        image: "/logo.png",
        handler: async function (response) {
          try {
            // Verify payment on backend AND create order
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                paymentPayload: paymentPayload,
              }),
            });

            const responseData = await verifyRes.json();

            // Check for orderId from verify response (handles both _id and orderId fields)
            const orderId = responseData.orderId || responseData._id || responseData.id;

            if (verifyRes.ok && responseData.success && orderId) {
              // Payment successful - clear cart and redirect to success page
              dispatch(clearCart());
              router.push(`/order-success?orderId=${orderId}`);
            } else {
              // Payment or order creation failed - redirect to failed page
              setPlacingOrder(false);
              router.push(`/order-failed?reason=${encodeURIComponent(responseData.message || 'Payment verification failed')}`);
            }
          } catch (error) {
            // Network or parsing error - redirect to failed page
            setPlacingOrder(false);
            router.push(`/order-failed?reason=${encodeURIComponent('Payment verification error. Please contact support.')}`);
          }
        },
        prefill: {
          name: paymentPayload.guestInfo?.name || form.name || user?.displayName || "",
          email: paymentPayload.guestInfo?.email || form.email || user?.email || "",
          contact: paymentPayload.guestInfo?.phone || form.phone || "",
        },
        theme: {
          color: "#F97316", // Orange color
        },
        modal: {
          ondismiss: function() {
            setPlacingOrder(false);
            router.push(`/order-failed?reason=${encodeURIComponent('Payment cancelled by user')}`);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      return true;
    } catch (error) {
      console.error("Payment initiation error:", error);
      setFormError("Failed to initiate payment. Please try again.");
      setPlacingOrder(false);
      return false;
    }
  };

  const [formError, setFormError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    // Validate required fields
    if (cartArray.length === 0) {
      setFormError("Your cart is empty.");
      return;
    }
    
    // For card payment, trigger Razorpay (allows guest checkout)
    if (form.payment === 'card') {
      setPlacingOrder(true);
      // Validate phone number
      if (!form.phone || !/^[0-9]{7,15}$/.test(form.phone)) {
        setFormError("Please enter a valid phone number (7-15 digits).");
        setPlacingOrder(false);
        return;
      }
      // Prepare payload but DON'T create order yet - wait for payment verification
      try {
        // Build items from cart state to include variantOptions
        const itemsFromStateCard = Object.entries(cartItems || {}).map(([id, value]) => {
          const qty = typeof value === 'number' ? value : value?.quantity || 0;
          const variantOptions = typeof value === 'object' ? value?.variantOptions : undefined;
          return { id, quantity: qty, ...(variantOptions ? { variantOptions } : {}) };
        }).filter(i => i.quantity > 0);

        let payload = {
          items: itemsFromStateCard,
          paymentMethod: 'CARD',
          shippingFee: shipping,
          paymentStatus: 'pending',
        };
        
        if (user) {
          const addressId = form.addressId || (addressList[0] && addressList[0]._id);
          if (addressId) {
            payload.addressId = addressId;
          }
        } else {
          if (!form.name || !form.email || !form.phone || !form.street || !form.city || !form.state || !form.country) {
            setFormError("Please fill all required shipping details.");
            setPlacingOrder(false);
            return;
          }
          payload.isGuest = true;
          payload.guestInfo = {
            name: form.name,
            email: form.email,
            phone: form.phone,
            street: form.street,
            city: form.city,
            state: form.state,
            country: form.country,
            pincode: form.pincode,
          };
        }
        
        if (user && getToken) {
          payload.token = await getToken();
        }
        
        // Open Razorpay without creating order first
        await handleRazorpayPayment(payload);
      } catch (error) {
        setFormError(error.message || "Payment failed");
        setPlacingOrder(false);
      }
      return;
    }
    
    // COD and other payment methods - REQUIRES LOGIN
    if (!user) {
      setFormError("Please sign in to use Cash on Delivery. Or use Credit Card for guest checkout.");
      setShowSignIn(true);
      return;
    }
    
    setPlacingOrder(true);
    try {
      let addressId = form.addressId;
      // If logged in and no address selected, skip address creation for now
      // Orders can work without addressId
      
      // Validate payment method
      if (!form.payment) {
        setFormError("Please select a payment method.");
        setPlacingOrder(false);
        return;
      }
      // Build order payload
      let payload;
      
      console.log('Checkout - User state:', user ? 'logged in' : 'guest');
      console.log('Checkout - User object:', user);
      
      if (user) {
        console.log('Building logged-in user payload...');
        // Build items directly from cartItems to preserve variantOptions
        const itemsFromState = Object.entries(cartItems || {}).map(([id, value]) => {
          const qty = typeof value === 'number' ? value : value?.quantity || 0;
          const variantOptions = typeof value === 'object' ? value?.variantOptions : undefined;
          return { id, quantity: qty, ...(variantOptions ? { variantOptions } : {}) };
        }).filter(i => i.quantity > 0);

        payload = {
          items: itemsFromState,
          paymentMethod: form.payment === 'cod' ? 'COD' : form.payment.toUpperCase(),
          shippingFee: shipping,
        };
        // Only add addressId if it exists
        if (addressId || (addressList[0] && addressList[0]._id)) {
          payload.addressId = addressId || addressList[0]._id;
        } else if (form.street && form.city && form.state && form.country) {
          // User is logged in but has no saved address - include address in payload
          payload.addressData = {
            name: form.name || user.displayName || '',
            email: form.email || user.email || '',
            phone: form.phone || '',
            street: form.street,
            city: form.city,
            state: form.state,
            country: form.country || 'UAE',
            zip: form.zip || form.pincode || '000000',
            district: form.district || ''
          };
        }
      }
      
      console.log('Submitting order:', payload);
      
      let fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      };
      
      if (user && getToken) {
        console.log('Adding Authorization header for logged-in user...');
        const token = await getToken();
        console.log('Got token:', token ? 'yes' : 'no');
        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${token}`,
        };
      } else {
        console.log('No Authorization header - guest checkout');
      }
      
      console.log('Final fetch options:', { ...fetchOptions, body: 'payload' });
      
      const res = await fetch("/api/orders", fetchOptions);
      if (!res.ok) {
        const errorText = await res.text();
        let msg = errorText;
        try {
          const data = JSON.parse(errorText);
          msg = data.message || data.error || errorText;
        } catch {}
        setFormError(msg);
        setPlacingOrder(false);
        router.push(`/order-failed?reason=${encodeURIComponent(msg)}`);
        return;
      }
      const data = await res.json();
      if (data._id || data.id) {
        // Order created successfully - clear cart and show prepaid upsell before redirect
        const createdOrderId = data._id || data.id;
        const orderTotal = data.total || total;
        dispatch(clearCart());
        setUpsellOrderId(createdOrderId);
        setUpsellOrderTotal(orderTotal);
        setShowPrepaidModal(true);
      } else {
        // No order ID returned - treat as failure
        setFormError("Order creation failed. Please try again.");
        setPlacingOrder(false);
        router.push(`/order-failed?reason=${encodeURIComponent('Order creation failed')}`);
      }
    } catch (err) {
      const errorMsg = err.message || "Order failed. Please try again.";
      setFormError(errorMsg);
      setPlacingOrder(false);
      router.push(`/order-failed?reason=${encodeURIComponent(errorMsg)}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePayNowForExistingOrder = async () => {
    if (!upsellOrderId) return;
    
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      alert('Payment gateway is loading... Please try again in a moment.');
      return;
    }
    
    try {
      setPayingNow(true);
      // Fetch order to get accurate total
      const orderRes = await fetch(`/api/orders?orderId=${upsellOrderId}`);
      const orderData = await orderRes.json();
      const order = orderData.order;
      if (!order) {
        setPayingNow(false);
        setShowPrepaidModal(false);
        router.push(`/order-success?orderId=${upsellOrderId}`);
        return;
      }
      const discountedAmount = Math.round((order.total || 0) * 0.95);

      // Create Razorpay order
      const rpRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: discountedAmount, currency: 'INR', receipt: `order_${upsellOrderId}` })
      });
      const rpData = await rpRes.json();
      if (!rpRes.ok || !rpData.success || !rpData.orderId) {
        setPayingNow(false);
        alert('Failed to create payment. Redirecting to order page...');
        setTimeout(() => {
          setShowPrepaidModal(false);
          router.push(`/order-success?orderId=${upsellOrderId}`);
        }, 1500);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: rpData.orderId,
        amount: Math.round(discountedAmount * 100),
        currency: 'INR',
        name: 'QuickFynd',
        description: 'Prepaid Payment (5% OFF)',
        image: '/logo.png',
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                paymentPayload: { existingOrderId: upsellOrderId }
              })
            });
            const verifyData = await verifyRes.json();
            setPayingNow(false);
            setNavigatingToSuccess(true);
            setTimeout(() => {
              setShowPrepaidModal(false);
              router.push(`/order-success?orderId=${upsellOrderId}`);
            }, 300);
          } catch (err) {
            setPayingNow(false);
            setNavigatingToSuccess(true);
            setTimeout(() => {
              setShowPrepaidModal(false);
              router.push(`/order-success?orderId=${upsellOrderId}`);
            }, 300);
          }
        },
        prefill: {
          name: user?.displayName || form.name || '',
          email: user?.email || form.email || '',
          contact: form.phone || '',
        },
        theme: { color: '#16a34a' },
        modal: {
          ondismiss: function () {
            // User cancelled payment - continue with COD
            setPayingNow(false);
            setNavigatingToSuccess(true);
            setTimeout(() => {
              setShowPrepaidModal(false);
              router.push(`/order-success?orderId=${upsellOrderId}`);
            }, 300);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      setPayingNow(false); // Enable Pay Now button while Razorpay is open
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      setPayingNow(false);
      alert('Payment failed. Redirecting to order page...');
      setTimeout(() => {
        setNavigatingToSuccess(true);
        setShowPrepaidModal(false);
        router.push(`/order-success?orderId=${upsellOrderId}`);
      }, 1500);
    }
  };

  if (authLoading) return null;
  
  // Show loading state while products are being fetched
  if (!products || products.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="text-gray-600">Loading your cart...</div>
      </div>
    );
  }
  
  if (!cartItems || Object.keys(cartItems).length === 0) {
    // If we just placed a COD order, show the prepaid upsell modal even though cart is empty
    if (showPrepaidModal || navigatingToSuccess) {
      return (
        <>
          <PrepaidUpsellModal 
            open={showPrepaidModal || navigatingToSuccess}
            orderTotal={upsellOrderTotal}
            discountAmount={upsellOrderTotal * 0.05}
            onClose={() => { 
              setNavigatingToSuccess(true); 
              setTimeout(() => {
                router.push(`/order-success?orderId=${upsellOrderId}`); 
              }, 100);
            }}
            onNoThanks={() => { 
              setNavigatingToSuccess(true); 
              setTimeout(() => {
                router.push(`/order-success?orderId=${upsellOrderId}`); 
              }, 100);
            }}
            onPayNow={handlePayNowForExistingOrder}
            loading={payingNow}
          />
          <Script 
            src="https://checkout.razorpay.com/v1/checkout.js" 
            strategy="afterInteractive"
            onLoad={() => setRazorpayLoaded(true)}
          />
        </>
      );
    }
    return (
      <div className="py-20 text-center">
        <div className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</div>
        <div className="text-gray-600 mb-4">Redirecting to shop...</div>
        <button 
          onClick={() => router.push('/shop')}
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Continue Shopping Now
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: address, form, payment */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {/* Cart Items Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2 text-gray-900">Cart Items</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cartArray.map((item) => (
                  <div key={item._id} className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-3 gap-3">
                    <img src={item.image || item.images?.[0] || '/placeholder.png'} alt={item.name} className="w-14 h-14 object-cover rounded-md border" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate">{item.brand || ''}</div>
                      <div className="text-xs text-gray-400">₹ {item.price.toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1">
                        <button type="button" className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => {
                          if (item.quantity > 1) {
                            dispatch({ type: 'cart/removeFromCart', payload: { productId: item._id } });
                          }
                        }}>-</button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button type="button" className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => {
                          dispatch({ type: 'cart/addToCart', payload: { productId: item._id } });
                        }}>+</button>
                      </div>
                      <button type="button" className="text-xs text-red-500 hover:underline mt-1" onClick={() => {
                        dispatch({ type: 'cart/deleteItemFromCart', payload: { productId: item._id } });
                      }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Shipping Method Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">Choose Shipping Method</h2>
              {/* Only one shipping method for now, auto-selected */}
              <div className="border border-green-400 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-green-900">{shipping === 0 ? 'Free Shipping' : 'Standard Shipping'}</div>
                  <div className="text-xs text-gray-600">Delivered within {shippingSetting?.estimatedDays || '2-5'} business days</div>
                </div>
                <div className="font-bold text-green-900 text-lg">{shipping === 0 ? 'Free' : `₹ ${shipping.toLocaleString()}`}</div>
              </div>
            </div>
            {/* Shipping Details Section */}
            <form id="checkout-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-semibold">Payment Error</div>
                    <div className="text-sm mt-1">{formError}</div>
                  </div>
                </div>
              )}
              
              {/* Guest Checkout Notice */}
              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-blue-900 mb-1">Checkout as Guest</h3>
                      <p className="text-sm text-blue-800">You can place your order without creating an account.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSignIn(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-semibold underline whitespace-nowrap ml-4"
                    >
                      Sign In Instead
                    </button>
                  </div>
                </div>
              )}
              
              <h2 className="text-xl font-bold mb-2 text-gray-900">Shipping details</h2>
              {/* ...existing code for address/guest form... */}
              {/* Show address fetch error if present */}
              {addressFetchError && (
                <div className="text-red-600 font-semibold mb-2">
                  {addressFetchError === 'Unauthorized' ? (
                    <>
                      You are not logged in or your session expired. <button className="underline text-blue-600" type="button" onClick={() => setShowSignIn(true)}>Sign in again</button>.
                    </>
                  ) : addressFetchError}
                </div>
              )}
              {addressList.length > 0 && !showAddressModal && !addressFetchError ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-900">{addressList[0].name}</div>
                    <div className="text-blue-700 text-sm">{addressList[0].district || addressList[0].city}</div>
                    <div className="text-gray-800 text-sm">{addressList[0].street}</div>
                    <div className="text-gray-800 text-sm">{addressList[0].city}, {addressList[0].state}, {addressList[0].country}</div>
                    <div className="text-orange-500 text-sm font-semibold">{addressList[0].phoneCode || '+91'} {addressList[0].phone}</div>
                    <div className="flex flex-col gap-1 mt-2 text-xs text-gray-700">
                      <span>Total: <span className="font-bold">₹ {subtotal.toLocaleString()}</span></span>
                      <span className="text-gray-500">Delivery charge: <span className="font-bold">₹ {shipping.toLocaleString()}</span></span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <button type="button" className="text-blue-600 text-xs font-semibold hover:underline" onClick={() => {
                      setEditingAddressId(addressList[0]._id);
                      setShowAddressModal(true);
                    }}>
                      Edit address
                    </button>
                    <button type="button" className="text-blue-600 text-xs font-semibold hover:underline" onClick={() => {
                      setEditingAddressId(null);
                      setShowAddressModal(true);
                    }}>
                      Add new address
                    </button>
                    <button 
                      type="button" 
                      className="text-red-600 text-xs font-semibold hover:underline" 
                      onClick={() => handleDeleteAddress(addressList[0]._id)}
                    >
                      Delete address
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mb-4">
                  {/* ...existing code for guest/inline address form... */}
                  {/* Name */}
                  <input
                    className="border border-gray-200 bg-white rounded px-4 py-2 focus:border-gray-400"
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={form.name || ''}
                    onChange={handleChange}
                    required
                  />
                  {/* Phone input */}
                  <div className="flex gap-2">
                    <select
                      className="border border-gray-200 bg-white rounded px-2 py-2 focus:border-gray-400"
                      name="phoneCode"
                      value={form.phoneCode}
                      onChange={handleChange}
                      style={{ maxWidth: '110px' }}
                      required
                    >
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                    <input
                      className="border border-gray-200 bg-white rounded px-4 py-2 flex-1 focus:border-gray-400"
                      type="tel"
                      name="phone"
                      placeholder="Phone number"
                      value={form.phone || ''}
                      onChange={handleChange}
                      pattern="[0-9]{7,15}"
                      title="Phone number must be 7-15 digits"
                      required
                    />
                  </div>
                  {form.phone && !/^[0-9]{7,15}$/.test(form.phone) && (
                    <div className="text-red-500 text-sm">Phone number must be 7-15 digits</div>
                  )}
                  {/* Email (optional) */}
                  <input
                    className="border border-gray-200 bg-white rounded px-4 py-2 focus:border-gray-400"
                    type="email"
                    name="email"
                    placeholder="Email address (optional)"
                    value={form.email || ''}
                    onChange={handleChange}
                  />
                  {/* Pincode with auto-fill option */}
                  <div className="flex gap-2 items-center">
                    <input
                      className="border border-gray-200 bg-white rounded px-4 py-2 focus:border-gray-400 flex-1"
                      type="text"
                      name="pincode"
                      placeholder="Pincode"
                      value={form.pincode || ''}
                      onChange={handleChange}
                      required={form.country === 'India'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPincodeModal(true)}
                      className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 whitespace-nowrap text-sm font-semibold"
                    >
                      Auto-fill
                    </button>
                  </div>
                  {form.pincode && (
                    <div className="text-xs text-gray-500 -mt-2">
                      ✓ Address auto-filled from pincode
                    </div>
                  )}
                  {/* City - Auto-filled from pincode */}
                  <input
                    className="border border-gray-200 bg-white rounded px-4 py-2 focus:border-gray-400"
                    type="text"
                    name="city"
                    placeholder="City (auto-filled from pincode)"
                    value={form.city || ''}
                    onChange={handleChange}
                    required
                  />
                  {/* District dropdown (for India) */}
                  {form.country === 'India' && (
                    <select
                      className="border border-gray-200 bg-white rounded px-4 py-2 focus:border-gray-400"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      required={!!form.state}
                      disabled={!form.state}
                    >
                      <option value="">Select District</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  )}
                  {/* Full Address Line (street) */}
                  <input
                    className="border border-gray-200 bg-white rounded px-4 py-2 focus:border-gray-400"
                    type="text"
                    name="street"
                    placeholder="Full Address Line (Street, Building, Apartment)"
                    value={form.street || ''}
                    onChange={handleChange}
                    required
                  />
                  {/* State dropdown (all states, default Kerala) */}
                  <select
                    className="border border-gray-200 bg-white rounded px-4 py-2 focus:border-gray-400"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select State</option>
                    {indiaStatesAndDistricts.map((s) => (
                      <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                  </select>
                  {/* Country dropdown (default India) */}
                  <select
                    className="border border-gray-200 bg-white rounded px-4 py-2 focus:border-gray-400"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                  >
                    <option value="India">India</option>
                    {countryCodes.filter(c => c.label !== 'India').map((c) => (
                      <option key={c.label} value={c.label.replace(/ \(.*\)/, '')}>{c.label.replace(/ \(.*\)/, '')}</option>
                    ))}
                  </select>
                </div>
              )}
              <h2 className="text-xl font-bold mb-4 text-gray-900">Payment methods</h2>
              <div className="flex flex-col gap-3">
                {/* Credit Card / Razorpay Option */}
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400 hover:bg-blue-50/30 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={form.payment === 'card'}
                    onChange={handleChange}
                    className="accent-blue-600 w-5 h-5 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-semibold text-gray-900">Credit Card</span>
                      <div className="flex items-center gap-0.5 ml-auto">
                        <Image src={Creditimage4} alt="Visa" width={30} height={18} className="object-contain"/>
                        <Image src={Creditimage3} alt="Mastercard" width={30} height={18} className="object-contain"/>
                        <Image src={Creditimage2} alt="Card" width={30} height={18} className="object-contain"/>
                        <Image src={Creditimage1} alt="Card" width={30} height={18} className="object-contain"/>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery Option */}
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-green-400 hover:bg-green-50/30 has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={form.payment === 'cod'}
                    onChange={handleChange}
                    className="accent-green-600 w-5 h-5 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      <span className="font-semibold text-gray-900">Cash on Delivery</span>
                    </div>
                  </div>
                </label>
              </div>
              {!user && (
                <div className="mt-3 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="font-semibold text-blue-900">Note:</span> To proceed with Cash on Delivery, please{" "}
                  <button
                    type="button"
                    onClick={() => setShowSignIn(true)}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    sign in
                  </button>{" "}
                  or create an account.
                </div>
              )}
            </form>
          </div>
        </div>
        {/* Right column: discount input, order summary and place order button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-fit flex flex-col justify-between">
          {/* Discount/Coupon input */}
          <form onSubmit={handleApplyCoupon} className="mb-4 flex gap-2">
            <input
              type="text"
              className="border border-gray-200 rounded px-3 py-2 flex-1 focus:border-gray-400"
              placeholder="Discount code or coupon"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            >
              Apply
            </button>
          </form>
          {couponError && <div className="text-red-500 text-xs mb-2">{couponError}</div>}
          <h2 className="font-bold text-lg mb-2 text-gray-900">Order details</h2>
          <div className="flex justify-between text-sm text-gray-900 mb-2">
            <span>Items</span>
            <span>₹ {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-900 mb-2">
            <span>Shipping &amp; handling</span>
            <span>{shipping > 0 ? `₹ ${shipping.toLocaleString()}` : '₹ 0'}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-base text-gray-900 mb-4">
            <span>Total</span>
            <span>₹ {total.toLocaleString()}</span>
          </div>
          <button
            type="submit"
            form="checkout-form"
            className={`relative w-full text-white font-bold py-3 rounded text-lg transition shadow-md hover:shadow-lg ${placingOrder ? 'bg-red-600 animate-pulse cursor-not-allowed opacity-95' : 'bg-red-600 hover:bg-red-700'}`}
            disabled={placingOrder}
            aria-busy={placingOrder}
          >
            {placingOrder ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Placing order...
              </span>
            ) : (
              'Place order'
            )}
            {placingOrder && (
              <span className="absolute left-0 top-0 h-full w-full overflow-hidden rounded opacity-20">
                <span className="block h-full w-1/3 bg-white animate-[shimmer_1.2s_ease_infinite]" />
              </span>
            )}
          </button>
        </div>
      </div>
      <AddressModal 
        open={showAddressModal} 
        setShowAddressModal={(show) => {
          setShowAddressModal(show);
          if (!show) setEditingAddressId(null);
        }} 
        onAddressAdded={(addr) => {
          setForm(f => ({ ...f, addressId: addr._id }));
          dispatch(fetchAddress({ getToken }));
          setEditingAddressId(null);
        }}
        initialAddress={editingAddressId ? addressList.find(a => a._id === editingAddressId) : null}
        isEdit={!!editingAddressId}
        onAddressUpdated={() => {
          dispatch(fetchAddress({ getToken }));
          setEditingAddressId(null);
        }}
      />
      <SignInModal open={showSignIn} onClose={() => setShowSignIn(false)} />
      <PincodeModal 
        open={showPincodeModal} 
        onClose={() => setShowPincodeModal(false)} 
        onPincodeSubmit={handlePincodeSubmit}
      />

      <PrepaidUpsellModal 
        open={showPrepaidModal}
        onClose={() => {
          setShowPrepaidModal(false);
          setTimeout(() => router.push(`/order-success?orderId=${upsellOrderId}`), 0);
        }}
        onNoThanks={() => {
          setShowPrepaidModal(false);
          setTimeout(() => router.push(`/order-success?orderId=${upsellOrderId}`), 0);
        }}
        onPayNow={handlePayNowForExistingOrder}
        loading={payingNow}
      />
      
      {/* Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => setFormError("Failed to load payment system")}
      />
    </div>
  );
}