import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/goperdoor-hotel';
  try {
    await mongoose.connect(uri, {
      autoIndex: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Mongo connection error', err.message);
    process.exit(1);
  }
};

export default connectDB;
