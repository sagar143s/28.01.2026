import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Firebase UID as string
  name: String,
  email: { type: String, unique: true, sparse: true },
  phone: String,
  image: String,
  cart: {
    type: Map,
    of: Number,
    default: {}
  },
  // Add other fields as needed
}, { timestamps: true, _id: false }); // Disable auto ObjectId generation

export default mongoose.models.User || mongoose.model("User", UserSchema);