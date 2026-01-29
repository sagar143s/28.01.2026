import mongoose from "mongoose";

const WalletTransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["EARN", "REDEEM"], required: true },
  coins: { type: Number, required: true },
  rupees: { type: Number, required: true },
  orderId: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const WalletSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  coins: { type: Number, default: 0 },
  transactions: { type: [WalletTransactionSchema], default: [] }
}, { timestamps: true });

export default mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);
