import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { config } from 'dotenv';

config();

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
    console.log('Conectado para seed');
    const admins = [
    { email: 'admin1@qhatu.com', password: await bcrypt.hash('adminpass1', 10), role: 'admin' },
    { email: 'admin2@qhatu.com', password: await bcrypt.hash('adminpass2', 10), role: 'admin' },
    { email: 'admin3@qhatu.com', password: await bcrypt.hash('adminpass3', 10), role: 'admin' }
    ];
    await User.insertMany(admins);
    console.log('3 Admins creados exitosamente');
    mongoose.disconnect();
})
.catch(err => console.error('Error en seed:', err));