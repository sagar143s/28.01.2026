'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Loading from '@/components/Loading'
import Link from 'next/link'
import DashboardSidebar from '@/components/DashboardSidebar'
import axios from 'axios'
import toast from 'react-hot-toast'
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function TicketsPage() {
  const [user, setUser] = useState(undefined)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, open, closed

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u ?? null))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (user) {
      fetchTickets()
    } else if (user === null) {
      setLoading(false)
    }
  }, [user])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const token = await auth.currentUser.getIdToken(true)
      const { data } = await axios.get('/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  if (user === undefined) return <Loading />

  if (user === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-800 mb-3">Support Tickets</h1>
        <p className="text-slate-600 mb-6">Please sign in to view your support tickets.</p>
        <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg">Go to Home</Link>
      </div>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="text-blue-600" size={20} />
      case 'in-progress':
        return <Clock className="text-orange-600" size={20} />
      case 'resolved':
        return <CheckCircle className="text-green-600" size={20} />
      case 'closed':
        return <XCircle className="text-gray-600" size={20} />
      default:
        return <MessageSquare className="text-gray-600" size={20} />
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || colors.open}`}>
        {status.replace('-', ' ').toUpperCase()}
      </span>
    )
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[priority] || colors.normal}`}>
        {priority.toUpperCase()}
      </span>
    )
  }

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true
    if (filter === 'open') return ticket.status === 'open' || ticket.status === 'in-progress'
    if (filter === 'closed') return ticket.status === 'closed' || ticket.status === 'resolved'
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-6">
      <DashboardSidebar />
      <main className="md:col-span-3">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Support Tickets</h1>
          <Link
            href="/help"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Create New Ticket
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              filter === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              filter === 'open'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            Open ({tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length})
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              filter === 'closed'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            Closed ({tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length})
          </button>
        </div>

        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
            <MessageSquare className="mx-auto mb-4 text-gray-400" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Tickets Found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't created any support tickets yet." 
                : `No ${filter} tickets found.`}
            </p>
            <Link
              href="/help"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Link
                key={ticket._id}
                href={`/dashboard/tickets/${ticket._id}`}
                className="block bg-white border border-slate-200 rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{ticket.subject}</h3>
                        {getPriorityBadge(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="font-medium text-blue-600">{ticket.category}</span>
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        {ticket.replies && ticket.replies.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
