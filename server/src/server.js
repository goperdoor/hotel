import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  try {
    const { default: User } = await import('./models/User.js');
    const admins = await User.find({ role: 'admin' }).select('email');
    const owners = await User.find({ role: 'owner' }).select('email hotel');
    console.log('ADMINS:', admins.map(a => a.email));
    console.log('OWNERS:', owners.map(o => o.email));
  } catch (e) {
    console.warn('Could not list users at startup', e.message);
  }
  app.listen(PORT, () => console.log('Server running on ' + PORT));
});
