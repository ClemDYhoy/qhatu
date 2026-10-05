// C:\qhatu\backend\src\scripts\seedUsersAllRoles.js

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script para crear usuarios de prueba de todos los roles.
 * Ejecutar: node src/scripts/seedUsersAllRoles.js
 *
 * Las contraseñas NO se hardcodean: se leen de variables de entorno.
 * Requiere SEED_DEFAULT_PASSWORD (mínimo 8 caracteres) y permite
 * override por usuario con SEED_SUPER_ADMIN_PASSWORD, etc.
 */

const defaultPassword = process.env.SEED_DEFAULT_PASSWORD;

if (!defaultPassword || defaultPassword.length < 8) {
  console.error('\n❌ Falta SEED_DEFAULT_PASSWORD (mínimo 8 caracteres) en tu .env.');
  console.error('   Este seed no usa contraseñas por defecto por seguridad.\n');
  process.exit(1);
}

const usuarios = [
  {
    email: 'admin@qhatu.com',
    password: process.env.SEED_SUPER_ADMIN_PASSWORD || defaultPassword,
    nombre_completo: 'Administrador Principal',
    telefono: '962000001',
    direccion: 'Av. Alameda de la República 123',
    distrito: 'Huánuco',
    documento_tipo: 'DNI',
    documento_numero: '70000001',
    rol_id: 1, // super_admin
    estado: 'activo',
    email_verificado: 1
  },
  {
    email: 'vendedor@qhatu.com',
    password: process.env.SEED_VENDEDOR_PASSWORD || defaultPassword,
    nombre_completo: 'María Vendedora',
    telefono: '962000002',
    direccion: 'Jr. Dos de Mayo 456',
    distrito: 'Huánuco',
    documento_tipo: 'DNI',
    documento_numero: '70000002',
    rol_id: 2, // vendedor
    estado: 'activo',
    email_verificado: 1
  },
  {
    email: 'almacenero@qhatu.com',
    password: process.env.SEED_ALMACENERO_PASSWORD || defaultPassword,
    nombre_completo: 'Carlos Almacenero',
    telefono: '962000003',
    direccion: 'Av. 28 de Julio 789',
    distrito: 'Huánuco',
    documento_tipo: 'DNI',
    documento_numero: '70000003',
    rol_id: 3, // almacenero
    estado: 'activo',
    email_verificado: 1
  },
  {
    email: 'cliente@qhatu.com',
    password: process.env.SEED_CLIENTE_PASSWORD || defaultPassword,
    nombre_completo: 'Ana Cliente',
    telefono: '962000004',
    direccion: 'Jr. Progreso 321',
    distrito: 'Huánuco',
    documento_tipo: 'DNI',
    documento_numero: '70000004',
    rol_id: 4, // cliente
    estado: 'activo',
    email_verificado: 1
  },
  {
    email: 'cliente2@qhatu.com',
    password: process.env.SEED_CLIENTE_PASSWORD || defaultPassword,
    nombre_completo: 'Pedro Cliente',
    telefono: '962000005',
    direccion: 'Av. Universitaria 555',
    distrito: 'Amarilis',
    documento_tipo: 'DNI',
    documento_numero: '70000005',
    rol_id: 4, // cliente
    estado: 'activo',
    email_verificado: 1
  }
];

async function seedUsers() {
  let connection;

  try {
    console.log('🔄 Iniciando seed de usuarios...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'qhatu_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Conexión a la base de datos establecida\n');

    for (const usuario of usuarios) {
      try {
        const [existingUser] = await connection.query(
          'SELECT usuario_id FROM usuarios WHERE email = ?',
          [usuario.email]
        );

        if (existingUser.length > 0) {
          console.log(`⚠️  Usuario ${usuario.email} ya existe, omitiendo...`);
          continue;
        }

        const hashedPassword = await bcrypt.hash(usuario.password, 10);

        const [result] = await connection.query(
          `INSERT INTO usuarios 
          (email, password, nombre_completo, telefono, direccion, distrito, 
           documento_tipo, documento_numero, rol_id, estado, email_verificado, 
           creado_en, actualizado_en)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            usuario.email,
            hashedPassword,
            usuario.nombre_completo,
            usuario.telefono,
            usuario.direccion,
            usuario.distrito,
            usuario.documento_tipo,
            usuario.documento_numero,
            usuario.rol_id,
            usuario.estado,
            usuario.email_verificado
          ]
        );

        const [rol] = await connection.query(
          'SELECT nombre FROM roles WHERE rol_id = ?',
          [usuario.rol_id]
        );

        console.log(`✓ Usuario creado: ${usuario.email} (ID ${result.insertId}, rol ${rol[0]?.nombre || usuario.rol_id})`);
      } catch (error) {
        console.error(`✗ Error al crear usuario ${usuario.email}:`, error.message);
      }
    }

    console.log('\n✅ Seed de usuarios completado');
    console.log('   Las contraseñas provienen de las variables SEED_* de tu .env.\n');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error en el seed:', error);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

seedUsers();
