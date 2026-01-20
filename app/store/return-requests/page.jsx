
'use client'
import { useAuth } from '@/lib/useAuth';

export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react';

import axios from 'axios';
import toast from 'react-hot-toast';
import Loading from '@/components/Loading';
import { RefreshCw, Undo2, X, Image as ImageIcon, Video as VideoIcon, Clock, CheckCircle, XCircle, StarIcon } from 'lucide-react';


export default function StoreReturnRequests() {
    const { getToken } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const fetchRequests = async () => {
        try {
            const token = await getToken(true); // Force refresh token
            if (!token) {
                toast.error('Authentication failed. Please sign in again.');
                setLoading(false);
                return;
            }
            const { data } = await axios.get('/api/store/return-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(data.requests);
        } catch (error) {
            console.error('Fetch requests error:', error);
            toast.error(error?.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const token = await getToken(true); // Force refresh token
            if (!token) {
                toast.error('Authentication failed. Please sign in again.');
                return;
            }
            await axios.put(`/api/store/return-requests/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setRequests(prev =>
                prev.map(req => req.id === id ? {...req, status} : req)
            );
            
            if (selectedRequest?.id === id) {
                setSelectedRequest({...selectedRequest, status});
            }
            
            toast.success('Request status updated successfully!');
        } catch (error) {
            console.error('Update status error:', error);
            toast.error(error?.response?.data?.error || error.message);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    if (loading) return <Loading />;

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            APPROVED: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700',
            COMPLETED: 'bg-blue-100 text-blue-700'
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Return & Replacement Requests</h1>
                <p className="text-gray-600 mt-2">Manage customer return and replacement requests</p>
            </div>

            {requests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl">
                    <p className="text-gray-500 text-lg">No return/replacement requests yet</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{request.user?.name || 'Guest'}</p>
                                            <p className="text-sm text-gray-500">{request.user?.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                            request.type === 'RETURN' 
                                                ? 'bg-red-100 text-red-700' 
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {request.type === 'RETURN' ? <Undo2 size={14} /> : <RefreshCw size={14} />}
                                            {request.type}
                                        </span>
                                        {request.fastProcess && (
                                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                                <Clock size={12} />
                                                FAST
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {request.reason}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setShowModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && selectedRequest && (
                <div 
                    onClick={() => setShowModal(false)} 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">Request Details</h2>
                                    <p className="text-orange-100 text-sm">Order ID: {selectedRequest.orderId.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <button 
                                    onClick={() => setShowModal(false)} 
                                    className="p-2 hover:bg-white/20 rounded-full transition"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div className="bg-gray-50 rounded-xl p-5">
                                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="font-medium">{selectedRequest.user?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium">{selectedRequest.user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="bg-gray-50 rounded-xl p-5">
                                <h3 className="font-semibold text-gray-900 mb-3">Request Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Type</p>
                                        <p className="font-medium">{selectedRequest.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Reason</p>
                                        <p className="font-medium">{selectedRequest.reason}</p>
                                    </div>
                                    {selectedRequest.description && (
                                        <div>
                                            <p className="text-gray-500">Description</p>
                                            <p className="font-medium">{selectedRequest.description}</p>
                                        </div>
                                    )}
                                    {(selectedRequest.productRating || selectedRequest.deliveryRating) && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedRequest.productRating && (
                                                <div>
                                                    <p className="text-gray-500">Product Rating</p>
                                                    <p className="font-medium">{selectedRequest.productRating} / 5</p>
                                                </div>
                                            )}
                                            {selectedRequest.deliveryRating && (
                                                <div>
                                                    <p className="text-gray-500">Delivery Rating</p>
                                                    <p className="font-medium">{selectedRequest.deliveryRating} / 5</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {selectedRequest.reviewText && (
                                        <div>
                                            <p className="text-gray-500">Customer Feedback</p>
                                            <p className="font-medium">{selectedRequest.reviewText}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Images */}
                            {selectedRequest.images && selectedRequest.images.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <ImageIcon size={20} />
                                        Uploaded Images
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {selectedRequest.images.map((img, index) => (
                                            <img 
                                                key={index} 
                                                src={img} 
                                                alt={`Evidence ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Videos */}
                            {selectedRequest.videos && selectedRequest.videos.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <VideoIcon size={20} />
                                        Uploaded Videos
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedRequest.videos.map((video, index) => (
                                            <video 
                                                key={index} 
                                                src={video} 
                                                controls
                                                className="w-full h-48 object-cover rounded-lg border"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selectedRequest.status === 'PENDING' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => updateStatus(selectedRequest.id, 'APPROVED')}
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-medium"
                                    >
                                        <CheckCircle size={20} />
                                        Approve Request
                                    </button>
                                    <button
                                        onClick={() => updateStatus(selectedRequest.id, 'REJECTED')}
                                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-medium"
                                    >
                                        <XCircle size={20} />
                                        Reject Request
                                    </button>
                                </div>
                            )}

                            {selectedRequest.status === 'APPROVED' && (
                                <button
                                    onClick={() => updateStatus(selectedRequest.id, 'COMPLETED')}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-medium"
                                >
                                    <CheckCircle size={20} />
                                    Mark as Completed
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
