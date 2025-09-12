import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
// import carouselRoutes from './routes/carousel.js'; // Comentado para evitar error
// import productRoutes from './routes/products.js'; // Comentado por si acaso

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
// app.use('/api/carousel', carouselRoutes); // Comentado
// app.use('/api/products', productRoutes); // Comentado

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Qhatu API is running' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});