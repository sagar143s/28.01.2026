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
    alternatePhone: '',
    alternatePhoneCode: '+91',
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
  const [showAlternatePhone, setShowAlternatePhone] = useState(false);

  // Wallet / Coins
  const [walletInfo, setWalletInfo] = useState({ coins: 0, rupeesValue: 0 });
  const [walletLoading, setWalletLoading] = useState(false);
  const [redeemCoins, setRedeemCoins] = useState(0);

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

  // Fetch wallet balance for logged-in users
  useEffect(() => {
    const loadWallet = async () => {
      if (!user || !getToken) {
        setWalletInfo({ coins: 0, rupeesValue: 0 });
        setRedeemCoins(0);
        return;
      }
      try {
        setWalletLoading(true);
        const token = await getToken();
        const res = await fetch('/api/wallet', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setWalletInfo({ coins: data.coins || 0, rupeesValue: data.rupeesValue || 0 });
        }
      } catch (e) {
        // ignore wallet errors on checkout
      } finally {
        setWalletLoading(false);
      }
    };
    loadWallet();
  }, [user, getToken]);

  // Check if Razorpay is already loaded (in case script loaded before state update)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setRazorpayLoaded(true);
    }
  }, []);

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
  const maxRedeemableCoins = Math.min(Math.floor(walletInfo.coins || 0), Math.floor(total / 0.5));
  const safeRedeemCoins = Math.min(Math.floor(redeemCoins || 0), maxRedeemableCoins);
  const walletDiscount = Number((safeRedeemCoins * 0.5).toFixed(2));
  const totalAfterWallet = Math.max(0, Number((total - walletDiscount).toFixed(2)));

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
      setForm(f => ({ ...f, country: value, state: '', district: '', alternatePhoneCode: f.alternatePhoneCode || f.phoneCode }));
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
    // Check if Razorpay is available (script might have loaded but state not updated)
    if (typeof window !== 'undefined' && window.Razorpay && !razorpayLoaded) {
      setRazorpayLoaded(true);
    }

    if (!razorpayLoaded && !window.Razorpay) {
      setFormError("Payment system is still loading. Please wait a moment and try again.");
      return false;
    }

    if (!window.Razorpay) {
      setFormError("Payment system failed to load. Please refresh the page and try again.");
      setPlacingOrder(false);
      return false;
    }

    try {
      // Step 1: Create Razorpay order on backend
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(totalAfterWallet), // Ensure it's a whole number
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
        amount: Math.round(totalAfterWallet * 100), // Amount in paise
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

    if (form.alternatePhone && !/^[0-9]{7,15}$/.test(form.alternatePhone)) {
      setFormError("Alternate number must be 7-15 digits.");
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
          if (safeRedeemCoins > 0) {
            payload.coinsToRedeem = safeRedeemCoins;
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
            phoneCode: form.phoneCode,
            alternatePhone: form.alternatePhone || '',
            alternatePhoneCode: form.alternatePhone ? form.alternatePhoneCode || form.phoneCode : '',
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
        if (safeRedeemCoins > 0) {
          payload.coinsToRedeem = safeRedeemCoins;
        }
        // Only add addressId if it exists
        if (addressId || (addressList[0] && addressList[0]._id)) {
          payload.addressId = addressId || addressList[0]._id;
        } else if (form.street && form.city && form.state && form.country) {
          // User is logged in but has no saved address - include address in payload
          payload.addressData = {
            name: form.name || user.displayName || '',
            email: form.email || user.email || '',
            phone: form.phone || '',
            phoneCode: form.phoneCode,
            alternatePhone: form.alternatePhone || '',
            alternatePhoneCode: form.alternatePhone ? form.alternatePhoneCode || form.phoneCode : '',
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
        const orderTotal = data.total || totalAfterWallet;
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
            onLoad={() => {
              console.log('Razorpay script loaded successfully');
              setRazorpayLoaded(true);
            }}
            onError={(e) => {
              console.error('Failed to load Razorpay script:', e);
              setFormError('Payment system failed to load. Please check your internet connection and refresh.');
            }}
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
    <>
      <div className="py-10 bg-white md:pb-0 pb-32">
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
                <div className="space-y-3 mb-6">
                  {addressList.map((address) => {
                    const isSelected = form.addressId === address._id;
                    return (
                      <div 
                        key={address._id}
                        className={`border-2 rounded-lg p-4 flex justify-between items-start cursor-pointer transition ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                        onClick={() => setForm(f => ({ ...f, addressId: address._id }))}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                            </div>
                            <div className="font-bold text-gray-900">{address.name}</div>
                          </div>
                          <div className="ml-7">
                            <div className="text-gray-800 text-sm">{address.street}</div>
                            <div className="text-gray-700 text-sm">{address.city}, {address.district || ''} {address.state}</div>
                            <div className="text-gray-700 text-sm">{address.country} {address.zip ? `- ${address.zip}` : ''}</div>
                            <div className="text-orange-600 text-sm font-semibold mt-1">{address.phoneCode || '+91'} {address.phone}</div>
                            {address.alternatePhone && (
                              <div className="text-gray-600 text-xs font-semibold">Alternate: {(address.alternatePhoneCode || address.phoneCode || '+91')} {address.alternatePhone}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button 
                            type="button" 
                            className="text-blue-600 text-xs font-semibold hover:underline whitespace-nowrap" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddressId(address._id);
                              setShowAddressModal(true);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            type="button" 
                            className="text-red-600 text-xs font-semibold hover:underline whitespace-nowrap" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address._id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <button 
                    type="button" 
                    className="w-full border-2 border-dashed border-blue-400 rounded-lg p-4 text-blue-600 font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
                    onClick={() => {
                      setEditingAddressId(null);
                      setShowAddressModal(true);
                    }}
                  >
                    <span className="text-xl">+</span> Add New Address
                  </button>
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
                  {/* Alternate phone checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAlternatePhone}
                      onChange={(e) => {
                        setShowAlternatePhone(e.target.checked);
                        if (!e.target.checked) {
                          setForm(f => ({ ...f, alternatePhone: '', alternatePhoneCode: f.phoneCode }));
                        }
                      }}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Add alternate phone number (optional)</span>
                  </label>
                  {/* Alternate phone input - only show when checkbox is ticked */}
                  {showAlternatePhone && (
                    <>
                      <div className="flex gap-2">
                        <select
                          className="border border-gray-200 bg-white rounded px-2 py-2 focus:border-gray-400"
                          name="alternatePhoneCode"
                          value={form.alternatePhoneCode}
                          onChange={handleChange}
                          style={{ maxWidth: '110px' }}
                        >
                          {countryCodes.map((c) => (
                            <option key={c.code} value={c.code}>{c.code}</option>
                          ))}
                        </select>
                        <input
                          className="border border-gray-200 bg-white rounded px-4 py-2 flex-1 focus:border-gray-400"
                          type="tel"
                          name="alternatePhone"
                          placeholder="Alternate phone (optional)"
                          value={form.alternatePhone || ''}
                          onChange={handleChange}
                          pattern="[0-9]{7,15}"
                          title="Alternate number must be 7-15 digits"
                        />
                      </div>
                      {form.alternatePhone && !/^[0-9]{7,15}$/.test(form.alternatePhone) && (
                        <div className="text-red-500 text-sm">Alternate number must be 7-15 digits</div>
                      )}
                    </>
                  )}
                  {/* Email (optional) */}
                  <input
                    className="border border-gray-200 bg-white rounded px-4 py-2 focus:border-gray-400"
                    type="email"
                    name="email"
                    placeholder="Email address "
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
                {(() => {
                  // Get maxCODAmount with proper default
                  const maxCODAmount = shippingSetting?.maxCODAmount || 0;
                  
                  // Check if COD is available
                  const isCODDisabled = shippingSetting?.enableCOD === false || 
                    (maxCODAmount > 0 && subtotal > maxCODAmount);
                  
                  // Debug log
                  console.log('COD Check:', {
                    subtotal,
                    maxCODAmount,
                    enableCOD: shippingSetting?.enableCOD,
                    shippingSetting: JSON.stringify(shippingSetting),
                    isCODDisabled,
                    comparison: maxCODAmount > 0 ? subtotal > maxCODAmount : false
                  });
                  
                  return (
                    <label className={`flex items-start gap-3 p-4 border-2 rounded-lg transition-all ${
                      isCODDisabled 
                        ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-50' 
                        : 'cursor-pointer hover:border-green-400 hover:bg-green-50/30 has-[:checked]:border-green-500 has-[:checked]:bg-green-50'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={form.payment === 'cod' && !isCODDisabled}
                        onChange={handleChange}
                        disabled={isCODDisabled}
                        className="accent-green-600 w-5 h-5 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                          </svg>
                          <span className="font-semibold text-gray-900">Cash on Delivery</span>
                        </div>
                        {isCODDisabled && maxCODAmount > 0 && subtotal > maxCODAmount && (
                          <p className="text-xs text-red-600 mt-1">Not available for orders above ₹{maxCODAmount}</p>
                        )}
                      </div>
                    </label>
                  );
                })()}
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
          
          {/* Order Details */}
          <h2 className="font-bold text-lg mb-2 text-gray-900">Order details</h2>
          <div className="flex justify-between text-sm text-gray-900 mb-2">
            <span>Items</span>
            <span>₹ {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-900 mb-2">
            <span>Shipping &amp; handling</span>
            <span>{shipping > 0 ? `₹ ${shipping.toLocaleString()}` : '₹ 0'}</span>
          </div>
          {user && (
            <div className="mb-3 rounded-lg border border-purple-100 bg-purple-50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-purple-800">Wallet Coins</span>
                <span className="text-purple-800">
                  {walletLoading ? 'Loading...' : `${walletInfo.coins} coins`}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={maxRedeemableCoins}
                  value={redeemCoins}
                  onChange={(e) => setRedeemCoins(Math.max(0, Math.min(Number(e.target.value || 0), maxRedeemableCoins)))}
                  className="w-28 rounded border border-purple-200 bg-white px-2 py-1 text-sm"
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={() => setRedeemCoins(maxRedeemableCoins)}
                  className="text-xs font-semibold text-purple-700 hover:underline"
                >
                  Use max
                </button>
              </div>
              <div className="mt-2 text-xs text-purple-700">
                10 coins = ₹5. Max usable now: {maxRedeemableCoins} coins
              </div>
            </div>
          )}
          {safeRedeemCoins > 0 && (
            <div className="flex justify-between text-sm text-purple-800 mb-2">
              <span>Wallet discount</span>
              <span>-₹ {walletDiscount.toLocaleString()}</span>
            </div>
          )}
          <hr className="my-2" />
          
          {/* Total - Desktop Only */}
          <div className="hidden md:flex justify-between font-bold text-base text-gray-900 mb-4">
            <span>Total</span>
            <span>₹ {totalAfterWallet.toLocaleString()}</span>
          </div>
          
          {/* Place Order Button - Desktop Only */}
          <button
            type="submit"
            form="checkout-form"
            className={`hidden md:block relative w-full text-white font-bold py-3 rounded text-lg transition shadow-md hover:shadow-lg ${placingOrder ? 'bg-red-600 cursor-not-allowed opacity-95 animate-bounce' : 'bg-red-600 hover:bg-red-700'}`}
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

      {/* Sticky Footer - Only Total and Place Order on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 shadow-lg z-40 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Total - Sticky on Mobile */}
          <div className="flex justify-between font-bold text-base text-gray-900 mb-4">
            <span>Total</span>
            <span>₹ {totalAfterWallet.toLocaleString()}</span>
          </div>
          
          {/* Address validation message */}
          {!form.addressId && !(form.name && form.phone && form.pincode && form.city && form.state && form.street) && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm p-3 rounded mb-3">
              Please fill the address to continue
            </div>
          )}
          
          <button
            type="submit"
            form="checkout-form"
            className={`relative w-full text-white font-bold py-3 rounded text-lg transition shadow-md hover:shadow-lg ${
              (!form.addressId && !(form.name && form.phone && form.pincode && form.city && form.state && form.street)) || placingOrder 
                ? 'bg-gray-400 cursor-not-allowed opacity-75' 
                : form.payment === 'cod' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : form.payment === 'card'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-red-600 hover:bg-red-700'
            } ${placingOrder ? 'animate-bounce' : ''}`}
            disabled={(!form.addressId && !(form.name && form.phone && form.pincode && form.city && form.state && form.street)) || placingOrder}
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
            ) : form.payment === 'card' ? (
              'Pay by Card'
            ) : form.payment === 'cod' ? (
              'Pay by COD'
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
    </>
  );
}