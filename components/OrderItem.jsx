'use client'
import Image from "next/image";
import { DotIcon, Download, Printer, RefreshCw, Undo2 } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";
import { downloadInvoice, printInvoice } from "@/lib/generateInvoice";
import Link from "next/link";

const OrderItem = ({ order }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹';
    const [ratingModal, setRatingModal] = useState(null);

    const { ratings } = useSelector(state => state.rating);
    
    // Check if order is delivered and within 7 days
    const isDelivered = order.status === 'DELIVERED';
    const deliveredDate = order.updatedAt ? new Date(order.updatedAt) : null;
    const daysSinceDelivery = deliveredDate ? Math.floor((new Date() - deliveredDate) / (1000 * 60 * 60 * 24)) : 999;
    const withinReturnWindow = isDelivered && daysSinceDelivery <= 7;
    
    // Check if any product in the order allows return or replacement
    const hasReturnableProduct = order.orderItems?.some(item => item.product?.allowReturn);
    const hasReplaceableProduct = order.orderItems?.some(item => item.product?.allowReplacement);
    const canReturnReplace = withinReturnWindow && (hasReturnableProduct || hasReplaceableProduct);

    return (
        <>
            <tr className="text-sm">
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                                    <Image
                                        className="h-14 w-auto"
                                        src={item.product.images[0]}
                                        alt="product_img"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <div className="flex flex-col justify-center text-sm">
                                    <p className="font-medium text-slate-600 text-base">{item.product.name}</p>
                                    <p>{currency}{item.price} Qty : {item.quantity} </p>
                                    <p className="mb-1">{new Date(order.createdAt).toDateString()}</p>
                                    <div>
                                        {ratings.find(rating => order.id === rating.orderId && item.product._id === rating.productId)
                                            ? <Rating value={ratings.find(rating => order.id === rating.orderId && item.product.id === rating.productId).rating} />
                                            : <button onClick={() => setRatingModal({ orderId: order.id, productId: item.product._id })} className={`text-green-500 hover:bg-green-50 transition ${order.status !== "DELIVERED" && 'hidden'}`}>Rate Product</button>
                                        }</div>
                                    {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </td>

                <td className="text-center max-md:hidden">{currency}{order.total}</td>

                <td className="text-left max-md:hidden">
                    <p>{order.address.name}, {order.address.street},</p>
                    <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country},</p>
                    <p>{order.address.phone}</p>
                </td>

                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div
                        className={`flex items-center justify-center gap-1 rounded-full p-1 ${order.status === 'confirmed'
                            ? 'text-yellow-500 bg-yellow-100'
                            : order.status === 'delivered'
                                ? 'text-green-500 bg-green-100'
                                : 'text-slate-500 bg-slate-100'
                            }`}
                    >
                        <DotIcon size={10} className="scale-250" />
                        {order.status.split('_').join(' ').toLowerCase()}
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => downloadInvoice(order)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs"
                                title="Download Invoice"
                            >
                                <Download size={14} />
                                Download
                            </button>
                            <button
                                onClick={() => printInvoice(order)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition text-xs"
                                title="Print Invoice"
                            >
                                <Printer size={14} />
                                Print
                            </button>
                        </div>
                        {canReturnReplace && (
                            <Link 
                                href={`/return-request?orderId=${order.id}`}
                                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-xs"
                            >
                                <RefreshCw size={14} />
                                Return/Replace
                            </Link>
                        )}
                    </div>
                </td>
            </tr>
            {/* Mobile */}
            <tr className="md:hidden">
                <td colSpan={5}>
                    <p>{order.address.name}, {order.address.street}</p>
                    <p>{order.address.city}, {order.address.state}, {order.address.zip}, {order.address.country}</p>
                    <p>{order.address.phone}</p>
                    <br />
                    <div className="flex flex-col gap-2">
                        <span className='text-center px-6 py-1.5 rounded bg-green-100 text-green-700' >
                            {order.status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 justify-center">
                                <button
                                    onClick={() => downloadInvoice(order)}
                                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
                                >
                                    <Download size={16} />
                                    Download
                                </button>
                                <button
                                    onClick={() => printInvoice(order)}
                                    className="flex items-center gap-1 px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition text-sm"
                                >
                                    <Printer size={16} />
                                    Print
                                </button>
                            </div>
                            {canReturnReplace && (
                                <Link 
                                    href={`/return-request?orderId=${order.id}`}
                                    className="flex items-center justify-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-sm"
                                >
                                    <RefreshCw size={16} />
                                    Return/Replace
                                </Link>
                            )}
                        </div>
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-300 w-6/7 mx-auto" />
                </td>
            </tr>
        </>
    )
}

export default OrderItem