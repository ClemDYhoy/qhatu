// C:\qhatu\backend\src\scripts\updateAdminPassword.js

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Actualiza la contraseña del usuario admin.
 * La nueva contraseña se toma de SEED_ADMIN_PASSWORD (o SEED_DEFAULT_PASSWORD).
 */

const newPassword = process.env.SEED_ADMIN_PASSWORD || process.env.SEED_DEFAULT_PASSWORD;

if (!newPassword || newPassword.length < 8) {
  console.error('\n❌ Define SEED_ADMIN_PASSWORD (o SEED_DEFAULT_PASSWORD) con mínimo 8 caracteres.\n');
  process.exit(1);
}

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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

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
      console.log('✓ Admin actualizado exitosamente (email: admin@qhatu.com)');
      console.log('  La contraseña se tomó de las variables SEED_* del .env.\n');
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
