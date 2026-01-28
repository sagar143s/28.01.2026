'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Loading from '@/components/Loading'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import DashboardSidebar from '@/components/DashboardSidebar'

export default function DashboardOrdersPage() {
  const [user, setUser] = useState(undefined)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [returnType, setReturnType] = useState('RETURN')
  const [returnReason, setReturnReason] = useState('')
  const [returnDescription, setReturnDescription] = useState('')
  const [submittingReturn, setSubmittingReturn] = useState(false)
  const [returnFiles, setReturnFiles] = useState([])
  const [uploadError, setUploadError] = useState('')

  const orderStatuses = [
    { value: 'ALL', label: 'All Orders', icon: '📦' },
    { value: 'CONFIRMED', label: 'Processing', icon: '⏳' },
    { value: 'SHIPPED', label: 'Shipped', icon: '🚚' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '📍' },
    { value: 'DELIVERED', label: 'Delivered', icon: '✅' },
    { value: 'RETURN_REQUESTED', label: 'Return Requested', icon: '↩️' },
    { value: 'RETURNED', label: 'Returned', icon: '↩️✓' },
    { value: 'CANCELLED', label: 'Cancelled', icon: '❌' }
  ]

  const filteredOrders = selectedStatus === 'ALL' ? orders : orders.filter(order => order.status === selectedStatus)

  const checkScrollPosition = () => {
    const container = document.querySelector('.tabs-wrapper')
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0)
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 1)
    }
  }

  const scrollTabs = (direction) => {
    const container = document.querySelector('.tabs-wrapper')
    if (container) {
      const scrollAmount = 200
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
      setTimeout(checkScrollPosition, 300)
    }
  }

  useEffect(() => {
    checkScrollPosition()
    const container = document.querySelector('.tabs-wrapper')
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      window.addEventListener('resize', checkScrollPosition)
      return () => {
        container.removeEventListener('scroll', checkScrollPosition)
        window.removeEventListener('resize', checkScrollPosition)
      }
    }
  }, [orders])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null))
    return () => unsub()
  }, [])

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return
      try {
        setLoadingOrders(true)
        const token = await auth.currentUser.getIdToken(true)
        const { data } = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const list = Array.isArray(data?.orders) ? data.orders : (Array.isArray(data) ? data : [])
        setOrders(list)
      } catch (err) {
        console.error('[DASHBOARD ORDERS] Fetch error:', err?.response?.data || err.message)
        toast.error(err?.response?.data?.error || 'Failed to load orders')
      } finally {
        setLoadingOrders(false)
      }
    }
    loadOrders()
  }, [user])

  const handleReturnRequest = async () => {
    if (!returnReason.trim()) {
      toast.error('Please select a reason')
      return
    }
    try {
      setSubmittingReturn(true)
      const token = await auth.currentUser.getIdToken(true)
      
      // Upload files if any
      let uploadedUrls = []
      if (returnFiles.length > 0) {
        const formData = new FormData()
        returnFiles.forEach(file => {
          formData.append('files', file)
        })
        
        const uploadRes = await axios.post('/api/upload', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        uploadedUrls = uploadRes.data.urls || []
      }
      
      await axios.post('/api/orders/return-request', {
        orderId: selectedOrder._id,
        itemIndex: 0,
        reason: returnReason,
        type: returnType,
        description: returnDescription,
        images: uploadedUrls
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(`${returnType === 'RETURN' ? 'Return' : 'Replacement'} request submitted successfully!`)
      setShowReturnModal(false)
      setReturnReason('')
      setReturnDescription('')
      setReturnType('RETURN')
      setReturnFiles([])
      setUploadError('')
      // Reload orders
      const { data } = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const list = Array.isArray(data?.orders) ? data.orders : (Array.isArray(data) ? data : [])
      setOrders(list)
    } catch (err) {
      console.error('Return request error:', err)
      toast.error(err?.response?.data?.error || 'Failed to submit request')
    } finally {
      setSubmittingReturn(false)
    }
  }

  if (user === undefined) return <Loading />

  if (user === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-800 mb-3">Dashboard / Orders</h1>
        <p className="text-slate-600 mb-6">Please sign in to view your orders.</p>
        <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">Go to Home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardSidebar />

        <main className="md:col-span-3">
          <h1 className="text-2xl font-semibold text-slate-800 mb-6">My Orders</h1>
          
          {/* Status Filter Tabs */}
          <div className="mb-6 relative">
            <style>{`
              .tabs-wrapper {
                display: block !important;
                width: 100% !important;
                overflow-x: scroll !important;
                overflow-y: hidden !important;
                padding-bottom: 10px !important;
                border-bottom: 1px solid #e2e8f0 !important;
                -webkit-overflow-scrolling: touch !important;
                scroll-behavior: smooth !important;
              }
              .tabs-wrapper::-webkit-scrollbar {
                height: 0px !important;
                display: none !important;
              }
              .tabs-wrapper::-webkit-scrollbar-track {
                background: transparent !important;
              }
              .tabs-wrapper::-webkit-scrollbar-thumb {
                background: transparent !important;
              }
              .tabs-wrapper {
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
              }
              .tabs-inner {
                display: inline-flex !important;
                gap: 0.5rem !important;
                white-space: nowrap !important;
                min-width: max-content !important;
              }
              .scroll-arrow {
                position: absolute;
                top: 10px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: all 0.2s;
              }
              .scroll-arrow:hover {
                background: #f1f5f9;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-color: #cbd5e1;
              }
              .scroll-arrow-left {
                left: -16px;
              }
              .scroll-arrow-right {
                right: -16px;
              }
            `}</style>
            
            {/* Left Arrow */}
            {showLeftArrow && (
              <button 
                onClick={() => scrollTabs('left')}
                className="scroll-arrow scroll-arrow-left hidden md:flex"
                aria-label="Scroll left"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}

            {/* Right Arrow */}
            {showRightArrow && (
              <button 
                onClick={() => scrollTabs('right')}
                className="scroll-arrow scroll-arrow-right hidden md:flex"
                aria-label="Scroll right"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}

            <div className="tabs-wrapper">
              <div className="tabs-inner">
                {orderStatuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition flex items-center gap-2 flex-shrink-0 ${
                      selectedStatus === status.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <span>{status.icon}</span>
                    <span>{status.label}</span>
                    {status.value !== 'ALL' && (
                      <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                        selectedStatus === status.value ? 'bg-blue-800' : 'bg-slate-200'
                      }`}>
                        {orders.filter(o => o.status === status.value).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {loadingOrders ? (
            <Loading />
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <p className="text-slate-600">No orders found.</p>
              <Link href="/products" className="inline-block mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg">Shop Now</Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center">
              <p className="text-slate-600">No orders with status: <strong>{orderStatuses.find(s => s.value === selectedStatus)?.label}</strong></p>
              <button
                onClick={() => setSelectedStatus('ALL')}
                className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View All Orders
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const orderId = order._id || order.id
                const isExpanded = expandedOrder === orderId
                const orderItems = order.orderItems || []
                const totalItems = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
                
                return (
                  <div 
                    key={orderId} 
                    className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                  >
                    {/* Order Header */}
                    <div className="px-6 py-4 border-b border-slate-200">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <p className="text-xs text-slate-500">Order #</p>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-800">{order.shortOrderNumber || orderId.substring(0, 8).toUpperCase()}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigator.clipboard.writeText(orderId)
                                  toast.success('Order ID copied!')
                                }}
                                className="p-1 hover:bg-slate-100 rounded transition"
                                title="Copy full order ID"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Date</p>
                            <p className="text-sm text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Items</p>
                            <p className="text-sm font-semibold text-slate-800">{totalItems}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Total</p>
                            <p className="text-sm font-semibold text-slate-800">₹{(order.total || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Status</p>
                            <span
                              className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                order.status === 'OUT_FOR_DELIVERY' ? 'bg-teal-100 text-teal-700' :
                                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'WAREHOUSE_RECEIVED' ? 'bg-indigo-100 text-indigo-700' :
                                order.status === 'PICKED_UP' ? 'bg-purple-100 text-purple-700' :
                                order.status === 'PICKUP_REQUESTED' ? 'bg-yellow-100 text-yellow-700' :
                                order.status === 'WAITING_FOR_PICKUP' ? 'bg-yellow-50 text-yellow-700' :
                                order.status === 'CONFIRMED' ? 'bg-orange-100 text-orange-700' :
                                order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' :
                                order.status === 'RETURN_REQUESTED' ? 'bg-pink-100 text-pink-700' :
                                order.status === 'RETURNED' ? 'bg-pink-200 text-pink-800' :
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {order.status || 'ORDER_PLACED'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Payment</p>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {order.isPaid ? '✓ Paid' : 'Pending'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {order.trackingUrl && (
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Track Order
                            </a>
                          )}
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                      </div>

                      {/* Product Preview Thumbnails */}
                      {orderItems.length > 0 && (
                        <div className="flex gap-3 items-center">
                          <p className="text-xs text-slate-500 font-medium">Products:</p>
                          <div className="flex gap-2 flex-wrap">
                            {orderItems.slice(0, 4).map((item, idx) => {
                              const product = item.productId || item.product || {}
                              return (
                                <div key={idx} className="relative">
                                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                    {product.images?.[0] ? (
                                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No image</div>
                                    )}
                                  </div>
                                  {item.quantity > 1 && (
                                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                      {item.quantity}
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                            {orderItems.length > 4 && (
                              <div className="w-16 h-16 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                                +{orderItems.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Details (Expandable) */}
                    {isExpanded && (
                      <div className="p-6 space-y-6">
                        {/* Return Request Status Display */}
                        {order.returns && order.returns.length > 0 && (
                          <div className="space-y-3">
                            {order.returns.map((returnReq, idx) => (
                              <div key={idx} className={`border-2 rounded-xl p-4 ${
                                returnReq.status === 'REQUESTED' ? 'bg-yellow-50 border-yellow-300' :
                                returnReq.status === 'APPROVED' ? 'bg-green-50 border-green-300' :
                                returnReq.status === 'REJECTED' ? 'bg-red-50 border-red-300' :
                                'bg-slate-50 border-slate-300'
                              }`}>
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6l6-6"/>
                                      </svg>
                                      {returnReq.type === 'RETURN' ? 'Return' : 'Replacement'} Request
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(returnReq.requestedAt).toLocaleString()}</p>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    returnReq.status === 'REQUESTED' ? 'bg-yellow-200 text-yellow-800' :
                                    returnReq.status === 'APPROVED' ? 'bg-green-200 text-green-800' :
                                    returnReq.status === 'REJECTED' ? 'bg-red-200 text-red-800' :
                                    'bg-slate-200 text-slate-800'
                                  }`}>
                                    {returnReq.status}
                                  </span>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <p className="text-slate-600 font-medium">Reason:</p>
                                    <p className="text-slate-900">{returnReq.reason}</p>
                                  </div>
                                  
                                  {returnReq.description && (
                                    <div>
                                      <p className="text-slate-600 font-medium">Details:</p>
                                      <p className="text-slate-900">{returnReq.description}</p>
                                    </div>
                                  )}

                                  {returnReq.status === 'REJECTED' && returnReq.rejectionReason && (
                                    <div className="mt-3 bg-red-100 border border-red-300 rounded-lg p-3">
                                      <p className="text-red-800 font-semibold mb-1 flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <circle cx="12" cy="12" r="10"/>
                                          <line x1="12" y1="8" x2="12" y2="12"/>
                                          <line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        Rejection Reason:
                                      </p>
                                      <p className="text-red-900 text-sm">{returnReq.rejectionReason}</p>
                                      
                                      <div className="flex gap-2 mt-3">
                                        <a
                                          href="/dashboard/tickets"
                                          className="flex-1 px-3 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-xs font-medium flex items-center justify-center gap-1.5"
                                        >
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <polyline points="14 2 14 8 20 8"/>
                                            <line x1="12" y1="18" x2="12" y2="12"/>
                                            <line x1="9" y1="15" x2="15" y2="15"/>
                                          </svg>
                                          Submit Ticket
                                        </a>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedOrder(order);
                                            setShowReturnModal(true);
                                          }}
                                          className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-xs font-medium"
                                        >
                                          Submit New Request
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {returnReq.status === 'APPROVED' && (
                                    <div className="mt-2 bg-green-100 border border-green-300 rounded-lg p-3">
                                      <p className="text-green-800 font-medium text-sm">✓ Your request has been approved! We'll contact you shortly with next steps.</p>
                                    </div>
                                  )}

                                  {returnReq.status === 'REQUESTED' && (
                                    <div className="mt-2 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                                      <p className="text-yellow-800 font-medium text-sm">⏳ Your request is under review. We'll update you soon.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Return/Replacement Button */}
                        {(order.status === 'DELIVERED' || order.status === 'OUT_FOR_DELIVERY') && !order.returns?.some(r => r.status === 'REQUESTED' || r.status === 'APPROVED') && (
                          <div className="flex justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedOrder(order)
                                setShowReturnModal(true)
                              }}
                              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6l6-6"/>
                              </svg>
                              Return/Replace Item
                            </button>
                          </div>
                        )}
                        
                        {/* Payment & Summary - Moved to top */}
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-lg p-5">
                          <h3 className="text-sm font-semibold text-slate-800 mb-4">Payment Summary</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Subtotal:</span>
                              <span className="font-medium text-slate-800">₹{((order.total || 0) - (order.shippingFee || 0)).toFixed(2)}</span>
                            </div>
                            {order.shippingFee > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Shipping:</span>
                                <span className="font-medium text-slate-800">₹{(order.shippingFee || 0).toFixed(2)}</span>
                              </div>
                            )}
                            {order.isCouponUsed && (
                              <div className="flex justify-between text-sm">
                                <span className="text-green-600">Discount Applied:</span>
                                <span className="font-medium text-green-600">-₹{(order.coupon?.discount || 0).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold text-slate-800 pt-3 border-t border-slate-300">
                              <span>Total Amount:</span>
                              <span className="text-lg">₹{(order.total || 0).toFixed(2)}</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-300">
                              <p className="text-xs text-slate-600 mb-2">Payment Method & Status</p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-800">{order.paymentMethod || 'Not specified'}</span>
                                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {order.isPaid ? '✓ PAID' : '⏳ PENDING'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Products */}
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800 mb-3">Order Items ({totalItems})</h3>
                          <div className="space-y-3">
                            {orderItems.map((item, idx) => {
                              const product = item.productId || item.product || {}
                              return (
                                <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                                  <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                                    {product.images?.[0] ? (
                                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-800 text-sm mb-1">{product.name || 'Product'}</h4>
                                    {product.sku && <p className="text-xs text-slate-500 mb-2">SKU: {product.sku}</p>}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <p className="text-xs text-slate-500">Quantity</p>
                                        <p className="font-medium text-slate-800">{item.quantity}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Unit Price</p>
                                        <p className="font-medium text-slate-800">₹{(item.price || 0).toFixed(2)}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-slate-500 mb-1">Line Total</p>
                                    <p className="font-bold text-slate-800 text-lg">₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Tracking Information */}
                        {(order.trackingId || order.trackingUrl || order.courier) && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Tracking Information
                            </h3>
                            <div className="space-y-2 text-sm">
                              {order.courier && (
                                <div className="flex">
                                  <span className="text-slate-600 w-24 font-medium">Courier:</span>
                                  <span className="font-semibold text-slate-800">{order.courier}</span>
                                </div>
                              )}
                              {order.trackingId && (
                                <div className="flex">
                                  <span className="text-slate-600 w-24 font-medium">Tracking ID:</span>
                                  <span className="font-mono font-semibold text-slate-800">{order.trackingId}</span>
                                </div>
                              )}
                              {order.delhivery?.expected_delivery_date && (
                                <div className="flex">
                                  <span className="text-slate-600 w-24 font-medium">Expected:</span>
                                  <span className="font-semibold text-green-700">{new Date(order.delhivery.expected_delivery_date).toLocaleDateString()}</span>
                                </div>
                              )}
                              {order.delhivery?.current_status && (
                                <div className="flex">
                                  <span className="text-slate-600 w-24 font-medium">Status:</span>
                                  <span className="font-semibold text-blue-700">{order.delhivery.current_status}</span>
                                </div>
                              )}
                              {order.delhivery?.current_status_location && (
                                <div className="flex">
                                  <span className="text-slate-600 w-24 font-medium">Location:</span>
                                  <span className="font-semibold text-slate-800">{order.delhivery.current_status_location}</span>
                                </div>
                              )}
                              {order.trackingUrl && (
                                <div className="flex gap-3 mt-3 pt-3 border-t border-blue-200">
                                  <a 
                                    href={order.trackingUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Track Your Order
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Delhivery Live Updates Timeline */}
                            {order.delhivery?.events && order.delhivery.events.length > 0 && (
                              <div className="border-t border-blue-200 mt-4 pt-4">
                                <p className="text-xs font-semibold text-slate-600 mb-3">📦 Shipment Timeline</p>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                  {order.delhivery.events.slice(0, 8).map((event, idx) => (
                                    <div key={idx} className="text-xs border-l-2 border-blue-400 pl-3 py-2 bg-white rounded-r px-2">
                                      <div className="font-semibold text-slate-800">{event.status || 'Update'}</div>
                                      {event.location && <div className="text-slate-600 text-xs mt-0.5">📍 {event.location}</div>}
                                      <div className="text-slate-500 text-xs mt-1">{new Date(event.time).toLocaleString()}</div>
                                      {event.remarks && <div className="text-slate-600 italic text-xs mt-1">💬 {event.remarks}</div>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Shipping Address */}
                        {(order.shippingAddress || order.addressId) && (
                          <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">Shipping Address</h3>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 space-y-1">
                              {order.shippingAddress ? (
                                <>
                                  <p className="font-bold text-slate-800">{order.shippingAddress.name}</p>
                                  <p>{order.shippingAddress.street}</p>
                                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                                  <p>{order.shippingAddress.country}</p>
                                  {order.shippingAddress.phone && <p className="font-medium text-slate-800 mt-2">📞 {order.shippingAddress.phone}</p>}
                                </>
                              ) : order.addressId && (
                                <p>Address ID: {order.addressId.toString()}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Return/Replacement Modal */}
          {showReturnModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowReturnModal(false)}>
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-800">Return/Replacement Request</h2>
                  <button onClick={() => setShowReturnModal(false)} className="text-slate-400 hover:text-slate-600">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Request Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="RETURN"
                          checked={returnType === 'RETURN'}
                          onChange={(e) => setReturnType(e.target.value)}
                          className="mr-2"
                        />
                        <span>Return</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="REPLACEMENT"
                          checked={returnType === 'REPLACEMENT'}
                          onChange={(e) => setReturnType(e.target.value)}
                          className="mr-2"
                        />
                        <span>Replacement</span>
                      </label>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Reason *</label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a reason</option>
                      <option value="Defective Product">Defective Product</option>
                      <option value="Wrong Item Received">Wrong Item Received</option>
                      <option value="Product Not As Described">Product Not As Described</option>
                      <option value="Damaged During Shipping">Damaged During Shipping</option>
                      <option value="Changed Mind">Changed Mind</option>
                      <option value="Quality Issues">Quality Issues</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Additional Details</label>
                    <textarea
                      value={returnDescription}
                      onChange={(e) => setReturnDescription(e.target.value)}
                      placeholder="Please provide more details about your request..."
                      rows="4"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Upload Images/Videos (Optional)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files)
                          setUploadError('')
                          
                          // Validate files
                          const validFiles = []
                          for (const file of files) {
                            if (file.type.startsWith('video/') && file.size > 5 * 1024 * 1024) {
                              setUploadError('Video files must be less than 5MB')
                              continue
                            }
                            if (file.type.startsWith('image/') && file.size > 10 * 1024 * 1024) {
                              setUploadError('Image files must be less than 10MB')
                              continue
                            }
                            validFiles.push(file)
                          }
                          
                          setReturnFiles(prev => [...prev, ...validFiles])
                        }}
                        className="w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100 file:cursor-pointer"
                      />
                      <p className="text-xs text-slate-500 mt-2">Images (max 10MB) or Videos (max 5MB)</p>
                      {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
                    </div>
                    
                    {/* Preview uploaded files */}
                    {returnFiles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {returnFiles.map((file, idx) => (
                          <div key={idx} className="relative group">
                            {file.type.startsWith('image/') ? (
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`Upload ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-slate-100 rounded-lg border-2 border-slate-200 flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                </svg>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setReturnFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                              ×
                            </button>
                            <p className="text-xs text-slate-600 mt-1 truncate w-20">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowReturnModal(false)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                      disabled={submittingReturn}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReturnRequest}
                      disabled={submittingReturn}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReturn ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    )
}