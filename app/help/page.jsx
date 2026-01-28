'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

import Loading from '@/components/Loading'
import Link from 'next/link'
import DashboardSidebar from '@/components/DashboardSidebar'
import { Mail, MessageCircle, Phone, HelpCircle } from 'lucide-react'

export default function HelpPage() {
  const router = useRouter()
  const [user, setUser] = useState(undefined)
  const [submitting, setSubmitting] = useState(false)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Order Issue',
    description: '',
    priority: 'normal',
    orderId: ''
  })

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true)
      const token = await auth.currentUser.getIdToken(true)
      const { data } = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  if (user === undefined) return <Loading />

  if (user === null) {
    return (
      <>
        {/* <Navbar /> removed, now global via ClientLayout */}
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-semibold text-slate-800 mb-3">Help & Support</h1>
          <p className="text-slate-600 mb-6">Please sign in to access help and support.</p>
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">Go to Home</Link>
        </div>
        {/* <Footer /> removed, now global via ClientLayout */}
      </>
    )
  }

  return (
    <>
      {/* <Navbar /> removed, now global via ClientLayout */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardSidebar />
        <main className="md:col-span-3">
          <h1 className="text-2xl font-semibold text-slate-800 mb-6">Help & Support</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <Mail className="text-blue-600 mb-3" size={32} />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Email Support</h2>
              <p className="text-slate-600 text-sm mb-4">Get help via email within 24 hours.</p>
              <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                support@quickfynd.com
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <MessageCircle className="text-green-600 mb-3" size={32} />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Live Chat</h2>
              <p className="text-slate-600 text-sm mb-4">Chat with our support team.</p>
              <button 
                onClick={() => {
                  if (window.Tawk_API) {
                    window.Tawk_API.maximize();
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Start Chat
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <Phone className="text-orange-600 mb-3" size={32} />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">Phone Support</h2>
              <p className="text-slate-600 text-sm mb-4">Call us Mon-Fri 9AM-6PM.</p>
              <a href="tel:+1234567890" className="text-blue-600 hover:underline">
                +91 7592875212
              </a>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <HelpCircle className="text-purple-600 mb-3" size={32} />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">FAQ</h2>
              <p className="text-slate-600 text-sm mb-4">Find answers to common questions.</p>
              <Link href="/faq" className="text-blue-600 hover:underline">Browse FAQ</Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Submit a Ticket</h2>
              <Link href="/dashboard/tickets" className="text-sm text-blue-600 hover:underline">
                View My Tickets
              </Link>
            </div>
            <form className="space-y-4" onSubmit={async (e) => {
              e.preventDefault()
              if (!formData.subject || !formData.description) {
                toast.error('Please fill in all required fields')
                return
              }
              try {
                setSubmitting(true)
                const token = await auth.currentUser.getIdToken(true)
                await axios.post('/api/tickets', formData, {
                  headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Ticket submitted successfully!')
                setFormData({ subject: '', category: 'Order Issue', description: '', priority: 'normal', orderId: '' })
                router.push('/dashboard/tickets')
              } catch (error) {
                console.error('Failed to submit ticket:', error)
                toast.error(error?.response?.data?.error || 'Failed to submit ticket')
              } finally {
                setSubmitting(false)
              }
            }}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject *</label>
                <input 
                  type="text" 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option>Order Issue</option>
                  <option>Product Question</option>
                  <option>Payment Issue</option>
                  <option>Account Issue</option>
                  <option>Other</option>
                </select>
              </div>
              
              {/* Order Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Related Order <span className="text-xs text-slate-500">(Optional)</span>
                </label>
                {loadingOrders ? (
                  <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-sm">
                    Loading your orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 text-sm">
                    No orders found
                  </div>
                ) : (
                  <select 
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">Select an order (optional)</option>
                    {orders.map((order) => (
                      <option key={order._id} value={order._id}>
                        Order #{order.orderNumber || order._id.slice(-8)} - ₹{order.total} - {new Date(order.createdAt).toLocaleDateString()} - {order.status}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-slate-500 mt-1">Select an order if your ticket is related to a specific purchase</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority *</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="normal">Normal - Standard support</option>
                  <option value="high">High - Important issue</option>
                  <option value="urgent">Urgent - Critical problem</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea 
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Provide details about your issue..."
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </form>
          </div>
        </main>
      </div>
      {/* <Footer /> removed, now global via ClientLayout */}
    </>
  )
}
