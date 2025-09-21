import MenuItem from '../models/MenuItem.js';

export async function createMenuItem(req, res) {
  try {
    const { name, type, price, prepTimeMinutes, image } = req.body;
    const item = await MenuItem.create({ hotel: req.user.hotel, name, type, price, prepTimeMinutes, image });
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ message: 'Cannot create item' });
  }
}

export async function listMenuItems(req, res) {
  try {
    const hotelId = req.params.hotelId || req.user?.hotel;
    const isPublic = Boolean(req.params.hotelId); // public route supplies :hotelId
    const filter = { hotel: hotelId };
    if (isPublic) filter.active = true; // only active for public
    const items = await MenuItem.find(filter);
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching menu' });
  }
}

export async function updateMenuItem(req, res) {
  try {
    const { id } = req.params;
    const item = await MenuItem.findOneAndUpdate({ _id: id, hotel: req.user.hotel }, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(400).json({ message: 'Cannot update item' });
  }
}

export async function toggleMenuItem(req, res) {
  try {
    const { id } = req.params;
    const item = await MenuItem.findOne({ _id: id, hotel: req.user.hotel });
    if (!item) return res.status(404).json({ message: 'Not found' });
    item.active = !item.active;
    await item.save();
    res.json({ id: item._id, active: item.active });
  } catch (e) {
    res.status(400).json({ message: 'Cannot toggle item' });
  }
}

export async function deleteMenuItem(req, res) {
  try {
    const { id } = req.params;
    await MenuItem.findOneAndDelete({ _id: id, hotel: req.user.hotel });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ message: 'Cannot delete item' });
  }
}
