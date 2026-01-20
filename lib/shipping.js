// lib/shipping.js
import axios from 'axios';

export async function fetchShippingSettings() {
  try {
    // Add cache busting query parameter to force fresh data
    const { data } = await axios.get('/api/shipping', {
      params: { t: new Date().getTime() }
    });
    return data.setting;
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
    return null;
  }
}

export function calculateShipping({ cartItems, shippingSetting, paymentMethod = 'CARD' }) {
  // If no shipping settings or shipping is disabled, return 0
  if (!shippingSetting || !shippingSetting.enabled) return 0;
  
  let shippingFee = 0;
  
  if (shippingSetting.shippingType === 'FLAT_RATE') {
    // Free shipping if subtotal exceeds freeShippingMin
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (shippingSetting.freeShippingMin && subtotal >= shippingSetting.freeShippingMin) {
      shippingFee = 0;
    } else {
      shippingFee = shippingSetting.flatRate || 0;
    }
  } else if (shippingSetting.shippingType === 'PER_ITEM') {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    let fee = (shippingSetting.perItemFee || 0) * totalItems;
    if (shippingSetting.maxItemFee) fee = Math.min(fee, shippingSetting.maxItemFee);
    shippingFee = fee;
  }
  
  // Add COD fee if payment method is COD and COD is enabled
  if (paymentMethod === 'COD' && shippingSetting.enableCOD && shippingSetting.codFee) {
    shippingFee += shippingSetting.codFee;
  }
  
  return shippingFee;
}
