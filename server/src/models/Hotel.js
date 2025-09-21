import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['veg', 'non-veg'], required: true },
  location: { type: String, required: true },
  rating: { type: Number, default: 0 },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Hotel', hotelSchema);
