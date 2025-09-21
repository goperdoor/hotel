import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

async function run() {
  await connectDB();
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const existing = await User.findOne({ email, role: 'admin' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }
  await User.create({ email, password, role: 'admin' });
  console.log('Admin created');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
