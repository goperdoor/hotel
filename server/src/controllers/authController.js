import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role, hotel: user.hotel }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
}

export async function adminLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    const user = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
    if (!user) {
      console.warn('ADMIN LOGIN: user not found for email', email);
      return res.status(400).json({ message: 'Admin not found' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      console.warn('ADMIN LOGIN: bad password for email', email);
      return res.status(400).json({ message: 'Incorrect password' });
    }
    return res.json({ token: signToken(user) });
  } catch (e) {
    console.error('ADMIN LOGIN ERROR', e);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function ownerLogin(req, res) {
  const { email, password, hotelEmail } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  try {
    let hotel = null;
    if (hotelEmail) {
      hotel = await Hotel.findOne({ email: hotelEmail.toLowerCase() });
      if (!hotel) {
        console.warn('OWNER LOGIN: hotel not found for', hotelEmail);
        return res.status(400).json({ message: 'Hotel not found' });
      }
    }
    const query = { email: email.toLowerCase(), role: 'owner' };
    if (hotel) query.hotel = hotel._id;
    const user = await User.findOne(query);
    if (!user) {
      console.warn('OWNER LOGIN: owner user not found for email', email, 'hotel constraint?', !!hotel);
      return res.status(400).json({ message: 'Owner not found' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      console.warn('OWNER LOGIN: bad password for owner', email);
      return res.status(400).json({ message: 'Incorrect password' });
    }
    return res.json({ token: signToken(user) });
  } catch (e) {
    console.error('OWNER LOGIN ERROR', e);
    return res.status(500).json({ message: 'Server error' });
  }
}
