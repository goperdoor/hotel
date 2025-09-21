import Hotel from '../models/Hotel.js';
import User from '../models/User.js';
import { createDefaultMenuForHotel } from '../utils/defaultMenu.js';

export async function createHotel(req, res) {
  try {
    const { name, type, location, rating, email, password, active, image } = req.body;
  const hotel = await Hotel.create({ name, type, location, rating, email, active, image });
  const ownerUser = await User.create({ email, password, role: 'owner', hotel: hotel._id });
  // create default menu asynchronously (do not block response)
  createDefaultMenuForHotel(hotel._id).catch(()=>{});
  res.status(201).json({ hotelId: hotel._id, ownerId: ownerUser._id });
  } catch (e) {
    res.status(400).json({ message: 'Cannot create hotel', error: e.message });
  }
}

export async function listHotels(req, res) {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching hotels' });
  }
}

export async function updateHotel(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;
    const hotel = await Hotel.findByIdAndUpdate(id, data, { new: true });
    if (!hotel) return res.status(404).json({ message: 'Not found' });
    res.json(hotel);
  } catch (e) {
    res.status(400).json({ message: 'Cannot update hotel' });
  }
}

export async function toggleHotelActive(req, res) {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ message: 'Not found' });
    hotel.active = !hotel.active;
    await hotel.save();
    res.json({ id: hotel._id, active: hotel.active });
  } catch (e) {
    res.status(400).json({ message: 'Cannot toggle' });
  }
}

export async function deleteHotel(req, res) {
  try {
    const { id } = req.params;
    await Hotel.findByIdAndDelete(id);
    await User.deleteMany({ hotel: id, role: 'owner' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ message: 'Cannot delete hotel' });
  }
}

export async function publicActiveHotels(req, res) {
  try {
    const { search } = req.query;
    const filter = { active: true };
    if (search) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { location: regex }];
    }
    const hotels = await Hotel.find(filter);
    res.json(hotels);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching' });
  }
}

export async function getHotel(req, res) {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);
    if (!hotel || !hotel.active) return res.status(404).json({ message: 'Not found' });
    res.json(hotel);
  } catch (e) {
    res.status(404).json({ message: 'Not found' });
  }
}
