
'use client'
import { useAuth } from '@/lib/useAuth';

export const dynamic = 'force-dynamic'
import Loading from "@/components/Loading"

import axios from "axios"
import { Calendar, Mail, Package, Search, ShoppingBag, TrendingUp, User, X } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"


export default function CustomersPage() {
    const { getToken } = useAuth()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'

    const [loading, setLoading] = useState(true)
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [customerDetails, setCustomerDetails] = useState(null)
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const fetchCustomers = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/customers', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setCustomers(data.customers)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setLoading(false)
    }

    const fetchCustomerDetails = async (customerId) => {
        setDetailsLoading(true)
        try {
            const token = await getToken()
            const { data } = await axios.get(`/api/store/customers/${customerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setCustomerDetails(data.customer)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        setDetailsLoading(false)
    }

    const handleCustomerClick = (customer) => {
        setSelectedCustomer(customer)
        fetchCustomerDetails(customer._id || customer.id)
    }

    const closeDetails = () => {
        setSelectedCustomer(null)
        setCustomerDetails(null)
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    // Filter customers based on search query
    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <Loading />

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 -m-8 p-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
                        <p className="text-slate-600 mt-1">Manage and track your customer relationships</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4">
                        <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{customers.length}</p>
                        <p className="text-xs text-slate-500 mt-1">Total Customers</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mt-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Customers Grid */}
            {filteredCustomers.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={40} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No customers yet</h3>
                    <p className="text-slate-500">Your customers will appear here once they place their first order</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredCustomers.map((customer) => (
                        <div
                            key={customer._id || customer.id}
                            onClick={() => handleCustomerClick(customer)}
                            className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                        >
                            {/* Customer Header */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative">
                                    {customer.image && customer.image !== '/placeholder.png' ? (
                                        <Image
                                            src={customer.image}
                                            alt={customer.name}
                                            width={56}
                                            height={56}
                                            className="rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-500 transition-all"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold ring-2 ring-slate-100 group-hover:ring-blue-500 transition-all">
                                            {customer.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{customer.name}</h3>
                                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                        <Mail size={11} />
                                        {customer.email}
                                    </p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Package size={14} className="text-blue-600" />
                                        <p className="text-xs font-medium text-blue-900">Orders</p>
                                    </div>
                                    <p className="text-xl font-bold text-blue-600">{customer.totalOrders}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                                    <div className="flex items-center gap-1 mb-1">
                                        <TrendingUp size={14} className="text-green-600" />
                                        <p className="text-xs font-medium text-green-900">Spent</p>
                                    </div>
                                    <p className="text-xl font-bold text-green-600">{currency}{Math.round(customer.totalSpent)}</p>
                                </div>
                            </div>

                            {/* Recent Orders Preview */}
                            {customer.orders && customer.orders.length > 0 && (
                                <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs font-semibold text-slate-700 mb-2">Recent Order</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-600 truncate">
                                                Order #{(customer.orders[0].id || customer.orders[0]._id || '').toString().slice(-8).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {new Date(customer.orders[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900">{currency}{Math.round(customer.orders[0].total)}</p>
                                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                                                customer.orders[0].status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                customer.orders[0].status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                                                customer.orders[0].status === 'ORDER_PLACED' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {customer.orders[0].status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Calendar size={12} />
                                    Last order: {new Date(customer.lastOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
                        {/* Modal Header */}
                        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                            <button
                                onClick={closeDetails}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                            
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    {selectedCustomer.image && selectedCustomer.image !== '/placeholder.png' ? (
                                        <Image
                                            src={selectedCustomer.image}
                                            alt={selectedCustomer.name}
                                            width={80}
                                            height={80}
                                            className="rounded-full object-cover ring-4 ring-white/30"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white/30">
                                            {selectedCustomer.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-white"></div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">
                                        {selectedCustomer.isGuest ? 'Guest Checkout' : selectedCustomer.name}
                                    </h2>
                                    <p className="text-blue-100 flex items-center gap-2">
                                        <Mail size={16} />
                                        {selectedCustomer.isGuest ? 'No email (Guest)' : selectedCustomer.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {detailsLoading ? (
                                <div className="text-center py-12">
                                    <Loading />
                                </div>
                            ) : customerDetails ? (
                                <>
                                    {/* Statistics Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                                                <ShoppingBag size={20} className="text-white" />
                                            </div>
                                            <p className="text-sm text-blue-600 font-medium mb-1">Total Orders</p>
                                            <p className="text-3xl font-bold text-blue-900">{customerDetails.totalOrders}</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
                                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                                                <TrendingUp size={20} className="text-white" />
                                            </div>
                                            <p className="text-sm text-green-600 font-medium mb-1">Total Spent</p>
                                            <p className="text-3xl font-bold text-green-900">{currency}{Math.round(customerDetails.totalSpent)}</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                                                <Package size={20} className="text-white" />
                                            </div>
                                            <p className="text-sm text-purple-600 font-medium mb-1">Avg Order</p>
                                            <p className="text-3xl font-bold text-purple-900">{currency}{customerDetails.averageOrderValue}</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mb-3">
                                                <Calendar size={20} className="text-white" />
                                            </div>
                                            <p className="text-sm text-orange-600 font-medium mb-1">Member Since</p>
                                            <p className="text-lg font-bold text-orange-900">
                                                {customerDetails.firstOrderDate ? new Date(customerDetails.firstOrderDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Abandoned Cart Alert */}
                                    {customerDetails.abandonedCart && (
                                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-xl p-5 mb-8 shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <ShoppingBag size={20} className="text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-yellow-900 mb-1">Abandoned Cart Alert</h3>
                                                    <p className="text-sm text-yellow-700 mb-2">
                                                        This customer has items worth <span className="font-bold">{currency}{Math.round(customerDetails.abandonedCart.total)}</span> in their cart
                                                    </p>
                                                    <p className="text-xs text-yellow-600">
                                                        Last updated: {new Date(customerDetails.abandonedCart.lastUpdated).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Order History */}
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                                            Order History
                                        </h3>
                                        
                                        {customerDetails.orders.length === 0 ? (
                                            <div className="text-center py-12 bg-slate-50 rounded-xl">
                                                <Package size={48} className="mx-auto text-slate-300 mb-3" />
                                                <p className="text-slate-500">No orders yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {customerDetails.orders.map((order) => (
                                                    <div
                                                        key={order._id || order.id}
                                                        className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all"
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                                    <p className="font-semibold text-slate-900">Order #{(order._id || order.id || '').toString().slice(-8).toUpperCase()}</p>
                                                                </div>
                                                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                                                    <Calendar size={14} />
                                                                    {new Date(order.createdAt).toLocaleString('en-US', { 
                                                                        month: 'short', 
                                                                        day: 'numeric', 
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xl font-bold text-slate-900 mb-2">{currency}{Math.round(order.total)}</p>
                                                                <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${
                                                                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-slate-100 text-slate-700'
                                                                }`}>
                                                                    {order.status.toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Order Items */}
                                                        <div className="bg-slate-50 rounded-lg p-4 mt-3">
                                                            <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">Items Ordered</p>
                                                            <div className="space-y-2">
                                                                {JSON.parse(order.items || '[]').map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                                                            <span className="text-sm text-slate-700">{item.name}</span>
                                                                            <span className="text-xs text-slate-500">× {item.quantity}</span>
                                                                        </div>
                                                                        <span className="text-sm font-semibold text-slate-900">{currency}{Math.round(item.price * item.quantity)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
