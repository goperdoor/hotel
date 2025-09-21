import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Hotel from '../models/Hotel.js';
import { createDefaultMenuForHotel } from '../utils/defaultMenu.js';
import MenuItem from '../models/MenuItem.js';

dotenv.config();

async function run() {
  await connectDB();
  const hotels = await Hotel.find();
  for (const h of hotels) {
    const count = await MenuItem.countDocuments({ hotel: h._id });
    if (count === 0) {
      console.log('Adding default menu to', h.name, h._id.toString());
      await createDefaultMenuForHotel(h._id);
    } else {
      console.log('Skipping (already has menu):', h.name);
    }
  }
  console.log('Menu seed complete');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
