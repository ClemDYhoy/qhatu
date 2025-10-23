// C:\qhatu\backend\src\controllers\authController.js
import { User, Role } from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
  try {
    const { nombre, correo, contrasena, telefono } = req.body;

    if (!nombre || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre.trim()) || nombre.trim().length < 2) {
      return res.status(400).json({ error: 'Nombre inválido (solo letras, mínimo 2 caracteres)' });
    }
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      return res.status(400).json({ error: 'Correo inválido' });
    }
    if (telefono && !/^(\+51)?9[1-9]\d{8}$/.test(telefono.trim())) {
      return res.status(400).json({ error: 'Teléfono inválido (formato peruano)' });
    }
    if (!contrasena || contrasena.length < 8) {
      return res.status(400).json({ error: 'Contraseña mínima 8 caracteres' });
    }

    const existingUser = await User.findOne({ where: { correo: correo.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ error: 'Correo ya registrado' });
    }

    // Crear usuario con rol_id como null (asumiendo que la base de datos lo permite)
    const user = await User.create({
      nombre: nombre.trim(),
      correo: correo.toLowerCase().trim(),
      contrasena,
      telefono: telefono ? telefono.trim().replace(/\s/g, '') : null,
      rol_id: null // Explicitamente establecer como null
    });

    const token = jwt.sign({ id_usuario: user.id_usuario }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: null
      }
    });
  } catch (error) {
    console.error('Registro error:', error);
    res.status(500).json({ error: error.message || 'Error interno al registrar' });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    const user = await User.findOne({ where: { correo: correo.toLowerCase().trim() } });
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isMatch = await user.comparePassword(contrasena);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    let role = null;
    if (user.rol_id) {
      const roleData = await Role.findByPk(user.rol_id);
      role = roleData ? roleData.nombre : null;
    }

    const token = jwt.sign({ id_usuario: user.id_usuario, rol: role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Error interno al iniciar sesión' });
  }
};