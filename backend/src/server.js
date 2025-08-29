// C:\qhatu\backend\src\server.js
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import carouselRoutes from './routes/carousel.js';

connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' })); // Puerto Vite default

app.use('/api/auth', authRoutes);
app.use('/api/carousel', carouselRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server corriendo en puerto ${PORT}`));