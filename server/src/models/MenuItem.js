import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['veg', 'non-veg'], required: true },
  price: { type: Number, required: true },
  prepTimeMinutes: { type: Number, default: 10 },
  image: { type: String },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);
