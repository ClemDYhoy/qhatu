import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { sequelize } from '../config/database.js';

dotenv.config();


const express = require('express');
const router = express.Router();//esto siempre
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models'); // Asegúrate de importar correctamente tu modelo

// 📌 Registro de usuario robusto
router.post('/register', async (req, res) => {
  try {
    let { nombre, correo, contrasena, telefono, rol } = req.body;

    // Normalizar datos
    nombre = nombre?.trim();
    correo = correo?.toLowerCase();
    telefono = telefono?.replace(/\s/g, '');

    // Validar campos obligatorios
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios' });
    }

    // Verificar si ya existe un usuario con el mismo correo o teléfono
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { correo },
          ...(telefono ? [{ telefono }] : [])
        ]
      }
    });

    if (existingUser) {
      if (existingUser.correo === correo) {
        return res.status(400).json({ message: 'Este correo electrónico ya está registrado' });
      }
      if (telefono && existingUser.telefono === telefono) {
        return res.status(400).json({ message: 'Este número de teléfono ya está registrado' });
      }
    }

    // Crear usuario
    const user = await User.create({
      nombre,
      correo,
      contrasena,
      telefono: telefono || null,
      rol: rol || 'cliente'
    });

    // Generar token JWT
    const token = jwt.sign(
      { id_usuario: user.id_usuario, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Respuesta exitosa
    res.status(201).json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ya existe una cuenta con estos datos' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: error.errors.map(e => e.message).join(', ') });
    }
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


// 🔐 Login de usuario
router.post('/login', async (req, res) => {
try {
    const { correo, contrasena } = req.body;
    const user = await User.findOne({ where: { correo } });

    if (!user || !(await user.comparePassword(contrasena))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
    { id_usuario: user.id_usuario, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
    );

    res.json({
    token,
    user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo,
        rol: user.rol
    }
    });
} catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
}
});

// 📧 Recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
try {
    const { correo } = req.body;
    const user = await User.findOne({ where: { correo } });

    if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hora

    await sequelize.query(
    'INSERT INTO tokens_recuperacion (id_usuario, token, fecha_expiracion) VALUES (?, ?, ?)',
    { replacements: [user.id_usuario, token, expires] }
    );

    const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
    });

    await transporter.sendMail({
    from: `"Qhatu Marca" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: 'Recuperar Contraseña - Qhatu Marca',
    text: `Haz clic para restablecer tu contraseña: http://localhost:3000/reset-password/${token}`
    });

    res.json({ message: 'Correo de recuperación enviado' });
} catch (error) {
    res.status(500).json({ error: 'Error al enviar correo de recuperación' });
}
});

// 🔄 Restablecer contraseña
router.post('/reset-password/:token', async (req, res) => {
try {
    const { token } = req.params;
    const { contrasena } = req.body;

    const [results] = await sequelize.query(
    'SELECT * FROM tokens_recuperacion WHERE token = ? AND fecha_expiracion > NOW() AND usado = FALSE',
    { replacements: [token] }
    );

    if (!results.length) {
    return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const user = await User.findByPk(results[0].id_usuario);
    user.contrasena = contrasena;
    await user.save();

    await sequelize.query(
    'UPDATE tokens_recuperacion SET usado = TRUE WHERE token = ?',
    { replacements: [token] }
    );

    res.json({ message: 'Contraseña restablecida correctamente' });
} catch (error) {
    if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Error al restablecer contraseña' });
}
});

export default router;