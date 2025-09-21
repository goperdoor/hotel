import MenuItem from '../models/MenuItem.js';

export async function createDefaultMenuForHotel(hotelId) {
  const existing = await MenuItem.findOne({ hotel: hotelId });
  if (existing) return; // already has items
  const items = [
    { name: 'Masala Dosa', type: 'veg', price: 80, prepTimeMinutes: 15 },
    { name: 'Veg Thali', type: 'veg', price: 120, prepTimeMinutes: 20 },
    { name: 'Chicken Biryani', type: 'non-veg', price: 180, prepTimeMinutes: 25 },
    { name: 'Grilled Fish', type: 'non-veg', price: 220, prepTimeMinutes: 30 },
    { name: 'Gulab Jamun', type: 'veg', price: 60, prepTimeMinutes: 10 }
  ];
  await MenuItem.insertMany(items.map(i => ({ ...i, hotel: hotelId, active: true })));
}
