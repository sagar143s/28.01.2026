import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  storeId: String,
  discountType: String,
  discountValue: Number,
  minOrderValue: Number,
  maxUses: Number,
  usedCount: { type: Number, default: 0 },
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  // Add more fields as needed
}, { timestamps: true });

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
