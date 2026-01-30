import mongoose from "mongoose";

const LocationHistorySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  city: String,
  state: String,
  country: String,
  latitude: Number,
  longitude: Number,
  deviceType: String,
  browser: String,
  userAgent: String,
  pageUrl: String
}, { _id: false });

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
  // Location tracking
  locations: {
    type: [LocationHistorySchema],
    default: []
  },
  lastLocation: {
    city: String,
    state: String,
    country: String,
    latitude: Number,
    longitude: Number,
    timestamp: Date
  },
  firstVisitLocation: {
    city: String,
    state: String,
    country: String,
    timestamp: Date
  }
  // Add other fields as needed
}, { timestamps: true, _id: false }); // Disable auto ObjectId generation

export default mongoose.models.User || mongoose.model("User", UserSchema);