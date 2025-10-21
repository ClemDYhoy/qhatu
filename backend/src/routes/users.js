// src/routes/users.js
import express from 'express';
import { User } from '../models/User.js';
import { superAdminMiddleware } from '../config/middleware/auth.js';
const router = express.Router();

router.get('/', superAdminMiddleware, async (req, res) => {
  const users = await User.findAll({ include: 'roles' });
  res.json(users);
});

router.post('/', superAdminMiddleware, async (req, res) => {
  const { nombre, correo, rol_id, telefono, contrasena } = req.body;
  try {
    const user = await User.create({ nombre, correo, rol_id, telefono, contrasena });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Error al crear usuario' });
  }
});

router.put('/:id', superAdminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol_id, telefono, contrasena, activo } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await user.update({ nombre, correo, rol_id, telefono, contrasena, activo });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', superAdminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    await user.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar usuario' });
  }
});

router.get('/roles', superAdminMiddleware, async (req, res) => {
  const Role = sequelize.define('roles', {
    id_rol: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
  });
  const roles = await Role.findAll();
  res.json(roles);
});

export default router;