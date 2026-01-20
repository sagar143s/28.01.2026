import mongoose from "mongoose";

const AbandonedCartSchema = new mongoose.Schema({
  storeId: { type: String, required: true },
  userId: String,
  items: Array,
  // Add more fields as needed
}, { timestamps: true });

export default mongoose.models.AbandonedCart || mongoose.model("AbandonedCart", AbandonedCartSchema);
