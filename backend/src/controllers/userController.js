// C:\qhatu\backend\src\controllers\userController.js
import { User, Role } from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, as: 'role' }],
      where: { activo: true }
    });
    res.json(users.map(user => ({
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      telefono: user.telefono,
      rol: user.role ? user.role.nombre : null,
      activo: user.activo
    })));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const assignRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rol } = req.body;

    if (!rol) return res.status(400).json({ error: 'Rol requerido' });

    const role = await Role.findOne({ where: { nombre: rol } });
    if (!role) return res.status(400).json({ error: 'Rol no encontrado' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    user.rol_id = role.id_rol;
    await user.save();

    res.json({ message: 'Rol asignado exitosamente', user: { id_usuario: user.id_usuario, rol: rol } });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ error: 'Error al asignar rol' });
  }
};