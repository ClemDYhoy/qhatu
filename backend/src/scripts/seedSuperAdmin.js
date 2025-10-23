// C:\qhatu\backend\src\scripts\seedSuperAdmin.js
import { sequelize } from '../config/database.js'; // Importar sequelize desde database.js
import { User, Role } from '../models/User.js'; // Importar User y Role desde User.js
import bcrypt from 'bcrypt';

async function seedSuperAdmin() {
  try {
    await sequelize.sync(); // Sincronizar la base de datos
    const [superAdminRole] = await Role.findOrCreate({
      where: { nombre: 'SuperAdmin' },
      defaults: { display_name: 'Super Administrador' }
    });

    const hashedPassword = await bcrypt.hash('Super123!', 12);
    const [user, created] = await User.findOrCreate({
      where: { correo: 'superadmin@qhatu.com' },
      defaults: {
        nombre: 'Super Admin',
        correo: 'superadmin@qhatu.com',
        contrasena: hashedPassword,
        telefono: '+51999999999',
        rol_id: superAdminRole.id_rol,
        activo: true
      }
    });

    if (created) {
      console.log('SuperAdmin creado: superadmin@qhatu.com / Super123!');
    } else {
      console.log('SuperAdmin ya existe, actualizando rol si es necesario');
      if (!user.rol_id) {
        user.rol_id = superAdminRole.id_rol;
        await user.save();
        console.log('Rol SuperAdmin asignado');
      }
    }
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
}

seedSuperAdmin();