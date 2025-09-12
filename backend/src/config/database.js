import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('Error de conexión:', err);
    process.exit(1);
  }
};

export default connectDB;