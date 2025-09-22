import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Counter from '../models/Counter.js';

export async function createOrder(req, res) {
  try {
    const { hotelId, items, customerName, customerContact, tableNumber } = req.body;
    if (!items || !items.length) return res.status(400).json({ message: 'No items' });
    if (!tableNumber || String(tableNumber).trim() === '') return res.status(400).json({ message: 'Table number required' });
    const normalizedTable = String(tableNumber).trim();
    const menuItems = await MenuItem.find({ _id: { $in: items.map(i => i.item) }, hotel: hotelId, active: true });
    const total = items.reduce((sum, i) => {
      const found = menuItems.find(m => m._id.toString() === i.item);
      return sum + (found ? found.price * i.quantity : 0);
    }, 0);
    // global sequence for all orders
    const counter = await Counter.findOneAndUpdate(
      { key: 'order_global' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    const orderNumber = counter.seq; // sequential integer
    const order = await Order.create({ hotel: hotelId, items, total, customerName, customerContact, tableNumber: normalizedTable, orderNumber });
    res.status(201).json(order);
  } catch (e) {
    res.status(400).json({ message: 'Cannot create order' });
  }
}

export async function listOrdersForOwner(req, res) {
  try {
    const orders = await Order.find({ hotel: req.user.hotel })
      .sort('-createdAt')
      .populate('items.item');
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
  const allowed = ['accepted', 'preparing', 'ready', 'completed', 'paid', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findOneAndUpdate({ _id: id, hotel: req.user.hotel }, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  } catch (e) {
    res.status(400).json({ message: 'Cannot update order' });
  }
}

export async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.item');
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  } catch (e) {
    res.status(404).json({ message: 'Not found' });
  }
}

export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Order.findOneAndDelete({ _id: id, hotel: req.user.hotel });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ message: 'Cannot delete order' });
  }
}

export async function getOrderByNumber(req, res) {
  try {
    const { number } = req.params;
    const parsed = Number(number);
    if (Number.isNaN(parsed)) return res.status(400).json({ message: 'Invalid number' });
    const order = await Order.findOne({ orderNumber: parsed }).populate('items.item');
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  } catch (e) {
    res.status(400).json({ message: 'Cannot lookup order' });
  }
}
