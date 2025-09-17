import express from 'express';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import carouselRoutes from './routes/carousel.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});