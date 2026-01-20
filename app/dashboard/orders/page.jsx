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
          {loadingOrders ? (
            <Loading />
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <p className="text-slate-600">No orders found.</p>
              <Link href="/products" className="inline-block mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg">Shop Now</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const orderId = order._id || order.id
                const isExpanded = expandedOrder === orderId
                const orderItems = order.orderItems || []
                const totalItems = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
                
                return (
                  <div key={orderId} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {/* Order Header */}
                    <div className="px-6 py-4 border-b border-slate-200">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <p className="text-xs text-slate-500">Order #</p>
                            <p className="font-semibold text-slate-800">{order.shortOrderNumber || orderId.substring(0, 8).toUpperCase()}</p>
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
                        {/* Order Reference */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                          <p className="text-slate-600">Full Order ID: <span className="font-mono text-slate-800">{orderId}</span></p>
                        </div>

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
        </main>
      </div>
    )
}