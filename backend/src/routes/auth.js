import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
const { nombre, email, password, telefono } = req.body;
try {
    let user = await User.findOne({ email });
    if (user) {
    return res.status(400).json({ message: 'Usuario ya existe' });
    }

    user = new User({ nombre, email, password, telefono });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user._id, email, nombre } });
} catch (error) {
    res.status(500).json({ message: 'Error en registro', error: error.message });
}
});

// Login
router.post('/login', async (req, res) => {
const { email, password } = req.body;
try {
    const user = await User.findOne({ email });
    if (!user) {
    return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
    return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email, nombre: user.nombre } });
} catch (error) {
    res.status(500).json({ message: 'Error en login', error: error.message });
}
});

export default router;