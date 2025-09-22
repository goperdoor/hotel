import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  items: [orderItemSchema],
  orderNumber: { type: Number, index: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'paid', 'cancelled'],
    default: 'pending'
  },
  total: { type: Number, required: true },
  customerName: { type: String },
  customerContact: { type: String },
  tableNumber: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
