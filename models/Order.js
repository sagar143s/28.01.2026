import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  quantity: Number,
  // Add more fields as needed
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  storeId: { type: String, required: true },
  userId: String,
  addressId: String,
  total: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  status: { type: String, default: "ORDER_PLACED", index: true },
  paymentMethod: String,
  paymentStatus: String,
  isPaid: { type: Boolean, default: false },
  isCouponUsed: { type: Boolean, default: false },
  coupon: Object,
  isGuest: { type: Boolean, default: false },
  guestName: String,
  guestEmail: String,
  guestPhone: String,
  alternatePhone: String,
  alternatePhoneCode: String,
  shippingAddress: Object,
  trackingId: { type: String, index: true },
  courier: String,
  trackingUrl: String,
  shortOrderNumber: { type: Number, index: true },
  orderItems: [OrderItemSchema],
  items: Array,
  cancelReason: String,
  returnReason: String,
  notes: String,
  coinsRedeemed: { type: Number, default: 0 },
  walletDiscount: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  rewardsCredited: { type: Boolean, default: false },
  // Return & Replacement
  returns: [{
    itemIndex: Number,
    reason: String,
    type: { type: String, enum: ['RETURN', 'REPLACEMENT'], default: 'RETURN' },
    status: { type: String, enum: ['REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'], default: 'REQUESTED' },
    description: String,
    images: [String],
    requestedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    rejectionReason: String,
    sellerNotes: String,
  }],
  // Add more fields as needed
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
