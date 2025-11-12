// C:\qhatu\backend\src\scripts\updateAdminPassword.js

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updateAdminPassword() {
  let connection;
  
  try {
    console.log('🔄 Actualizando contraseña del admin...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'qhatu_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Conexión establecida\n');

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Actualizar admin
    const [result] = await connection.query(
      `UPDATE usuarios 
       SET password = ?, 
           nombre_completo = 'Administrador Principal',
           telefono = '962000001',
           direccion = 'Av. Alameda de la República 123',
           distrito = 'Huánuco',
           documento_tipo = 'DNI',
           documento_numero = '70000001',
           estado = 'activo',
           email_verificado = 1,
           actualizado_en = NOW()
       WHERE email = 'admin@qhatu.com'`,
      [hashedPassword]
    );

    if (result.affectedRows > 0) {
      console.log('✓ Admin actualizado exitosamente');
      console.log('  Email: admin@qhatu.com');
      console.log('  Password: admin123\n');
    } else {
      console.log('⚠️  No se encontró el usuario admin@qhatu.com\n');
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

updateAdminPassword();