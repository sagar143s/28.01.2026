'use client'
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import { useAuth } from '@/lib/useAuth';

export default function OrderSuccess() {
  return (
    <Suspense>
      <OrderSuccessContent />
    </Suspense>
  );

}



function OrderSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, getToken } = useAuth();

  useEffect(() => {
    const fetchOrder = async (orderId) => {
      try {
        let fetchOptions = {};
        // Try to add token if user is logged in, but don't wait
        if (user && getToken) {
          try {
            const token = await getToken();
            fetchOptions.headers = {
              Authorization: `Bearer ${token}`,
            };
          } catch (e) {
            // Continue without token
          }
        }
        const res = await fetch(`/api/orders?orderId=${orderId}`, fetchOptions);
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else if (data.order) {
          setOrders([data.order]);
        } else {
          setOrders(null);
        }
      } catch (err) {
        setOrders(null);
      } finally {
        setLoading(false);
      }
    };

    const orderId = params.get('orderId');
    console.log('OrderSuccessContent: orderId from params:', orderId);
    if (!orderId) {
      console.error('OrderSuccessContent: orderId missing, redirecting to home.');
      router.replace('/');
      return;
    }
    // Fetch immediately without waiting for auth
    fetchOrder(orderId);
    // eslint-disable-next-line
  }, [params, router, user, getToken]);

  // Use first order for summary
  const order = orders && orders.length > 0 ? orders[0] : null;
  // Use stored shortOrderNumber from database (same as dashboard shows)
  // This ensures consistency between customer view and seller dashboard
  function getOrderNumber(orderObj) {
    if (!orderObj) return '';
    // Use the shortOrderNumber field that was stored in database during order creation
    // This matches what the dashboard and seller see
    return String(orderObj.shortOrderNumber || orderObj._id.slice(0, 8));
  }
  // Calculate totals
  const products = order ? order.orderItems : [];
  const subtotal = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // Use shippingFee from order if available
  const shipping = typeof order?.shippingFee === 'number' ? order.shippingFee : 0;
  const discount = order?.coupon?.discount ? (order.coupon.discountType === 'percentage' ? (order.coupon.discount / 100 * subtotal) : Math.min(order.coupon.discount, subtotal)) : 0;
  const total = subtotal + shipping - discount;
  const orderDate = order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
  const currency = order?.currency || '₹';

  // Meta Pixel Purchase event
  useEffect(() => {
    if (order && typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: total,
        currency: currency
      });
    }
  }, [order, total, currency]);

  // Render logic moved inside returned JSX to avoid early returns
  return (
    <>
      {loading ? (
        <Loading />
      ) : !orders || orders.length === 0 ? (
        <div className='p-8 text-center text-red-600'>Order not found or failed.</div>
      ) : (
        <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8'>
          <div className='max-w-2xl w-full bg-white rounded-xl shadow p-8'>
            <div className='text-center mb-8'>
              <div className='flex flex-col items-center gap-2'>
                <span className='text-green-600 text-2xl'>✔️</span>
                <h2 className='text-2xl font-bold text-green-700'>Thank you</h2>
                <p className='text-gray-500'>Your order has been received.</p>
              </div>
            </div>
            <div className='bg-gray-100 rounded-lg py-6 mb-8 text-center'>
              <div className='text-sm text-gray-500 mb-2'>Order no.</div>
              <div className='text-3xl font-bold text-red-600 mb-2'>
                {getOrderNumber(order)}
              </div>
              <button className='text-xs text-gray-400 hover:text-gray-600' onClick={() => navigator.clipboard.writeText(getOrderNumber(order))}>Copy order number</button>
            </div>
            <div className='flex flex-col md:flex-row justify-between items-center bg-gray-50 rounded-lg p-4 mb-8 gap-4'>
              <div className='text-sm'>
                <div><span className='font-semibold'>Order no.:</span> {getOrderNumber(order)}</div>
                <div><span className='font-semibold'>Order date:</span> {orderDate}</div>
              </div>
              <div className='text-sm'>
                <div><span className='font-semibold'>Total:</span> {currency} {total.toLocaleString()}</div>
                <div><span className='font-semibold'>Payment method:</span> {order?.paymentMethod || 'COD'}</div>
              </div>
            </div>
            <div className='bg-gray-50 rounded-lg p-4'>
              <div className='mb-4 text-lg font-semibold'>Order summary</div>
              <table className='w-full text-sm mb-4'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-2'>Product</th>
                    <th className='text-right py-2'>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item, idx) => {
                    const p = typeof item.productId === 'object' ? item.productId : null;
                    const key = (p && p._id) || (typeof item.productId === 'string' ? item.productId : idx);
                    const name = p?.name || item.name || 'Product';
                    const image = Array.isArray(p?.images) && p.images[0] ? p.images[0] : null;
                    return (
                      <tr key={key} className='border-b'>
                        <td className='py-2 flex items-center gap-3'>
                          {image && (
                            <img src={image} alt={name} className='w-12 h-12 rounded object-cover border' />
                          )}
                          <span className='truncate max-w-[240px]'>{name} {item.quantity > 1 ? `× ${item.quantity}` : ''}</span>
                        </td>
                        <td className='py-2 text-right'>{currency} {(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className='grid grid-cols-2 gap-2 text-sm mb-2'>
                <div className='text-gray-600'>Items</div>
                <div className='text-right'>{currency} {subtotal.toLocaleString()}</div>
                <div className='text-gray-600'>Discount</div>
                <div className='text-right'>-{currency} {discount ? discount.toLocaleString() : '0'}</div>
                <div className='text-gray-600'>Shipping &amp; handling</div>
                <div className='text-right'>{currency} {shipping.toLocaleString()}</div>
                <div className='font-semibold text-gray-900'>Total</div>
                <div className='font-semibold text-right'>{currency} {total.toLocaleString()}</div>
              </div>
            </div>
            {order?.shippingAddress && (
              <div className='bg-white rounded-lg shadow border border-gray-100 p-4 mt-6'>
                <div className='font-semibold text-gray-900 mb-2'>Shipping address</div>
                <div className='text-sm text-gray-700 space-y-1'>
                  <div className='font-medium'>{order.shippingAddress.name}</div>
                  <div>{order.shippingAddress.street}</div>
                  <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
                  <div>{order.shippingAddress.country}</div>
                  {order.shippingAddress.phone && (
                    <div>Phone: {(order.shippingAddress.phoneCode || '+91')} {order.shippingAddress.phone}</div>
                  )}
                  {order.shippingAddress.alternatePhone && (
                    <div className='text-gray-600'>Alternate: {(order.shippingAddress.alternatePhoneCode || order.shippingAddress.phoneCode || '+91')} {order.shippingAddress.alternatePhone}</div>
                  )}
                </div>
              </div>
            )}
            {!user && (
              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8 text-center'>
                <div className='text-yellow-800 font-semibold mb-2'>
                  Please sign in to view your order history and track details.<br />
                  Guests can track their order using the order ID only.
                </div>
              </div>
            )}
            <div className='text-center mt-4'>
              <button className='bg-orange-500 text-white px-6 py-2 rounded-lg font-bold' onClick={() => router.push('/')}>Continue Shopping</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
