'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import Loading from '@/components/Loading';

export default function PromotionalEmailsPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ sent: 0, failed: 0, pending: 0 });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadHistory(page);
  }, [page, statusFilter]);

  const loadHistory = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const token = await getToken();
      const statusQuery = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const { data } = await axios.get(
        `/api/store/email-history?page=${pageNumber}&limit=20&type=promotional${statusQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHistory(data.history || []);
      setStats(data.stats || { sent: 0, failed: 0, pending: 0 });
      setTotal(data.pagination?.total || 0);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error loading promotional email history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="w-full space-y-6 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Promotional Email Status</h2>
          <p className="text-gray-600 text-sm mt-1">Daily promotional email delivery status and history</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <button
            onClick={() => loadHistory(page)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={CheckCircle} title="Sent" value={stats.sent} color="green" />
        <StatCard icon={AlertCircle} title="Failed" value={stats.failed} color="red" />
        <StatCard icon={Clock} title="Pending" value={stats.pending} color="orange" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Email History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Recipient</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Error</th>
              </tr>
            </thead>
            <tbody>
              {history.map((email, idx) => (
                <tr key={email._id || idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">{email.recipientEmail}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {email.subject}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={email.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {new Date(email.sentAt || email.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {email.errorMessage || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {history.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No promotional email history found
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => loadHistory(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => loadHistory(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: IconComponent, title, value, color }) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]} space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {IconComponent && <IconComponent className="w-5 h-5" />}
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}
