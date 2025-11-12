// C:\qhatu\backend\src\scripts\seedUsersAllRoles.js

import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script para crear usuarios de prueba de todos los roles
 * Ejecutar: node src/scripts/seedUsersAllRoles.js
 */

const usuarios = [
  {
    email: 'admin@qhatu.com',
    password: 'admin123',
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
    password: 'vendedor123',
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
    password: 'almacen123',
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
    password: 'cliente123',
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
    password: 'cliente123',
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

    // Crear conexión directa a MySQL
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
        // Verificar si el usuario ya existe
        const [existingUser] = await connection.query(
          'SELECT usuario_id FROM usuarios WHERE email = ?',
          [usuario.email]
        );

        if (existingUser.length > 0) {
          console.log(`⚠️  Usuario ${usuario.email} ya existe, omitiendo...`);
          continue;
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(usuario.password, 10);

        // Insertar usuario
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

        // Obtener nombre del rol
        const [rol] = await connection.query(
          'SELECT nombre FROM roles WHERE rol_id = ?',
          [usuario.rol_id]
        );

        console.log(`✓ Usuario creado exitosamente:`);
        console.log(`  ID: ${result.insertId}`);
        console.log(`  Email: ${usuario.email}`);
        console.log(`  Password: ${usuario.password}`);
        console.log(`  Rol: ${rol[0].nombre}`);
        console.log(`  Nombre: ${usuario.nombre_completo}\n`);
      } catch (error) {
        console.error(`✗ Error al crear usuario ${usuario.email}:`, error.message);
      }
    }

    console.log('\n✅ Seed de usuarios completado\n');
    console.log('📋 Credenciales de acceso:');
    console.log('═══════════════════════════════════════════════════');
    console.log('👑 SUPER ADMIN');
    console.log('   Email: admin@qhatu.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('💼 VENDEDOR');
    console.log('   Email: vendedor@qhatu.com');
    console.log('   Password: vendedor123');
    console.log('');
    console.log('📦 ALMACENERO');
    console.log('   Email: almacenero@qhatu.com');
    console.log('   Password: almacen123');
    console.log('');
    console.log('👤 CLIENTE 1');
    console.log('   Email: cliente@qhatu.com');
    console.log('   Password: cliente123');
    console.log('');
    console.log('👤 CLIENTE 2');
    console.log('   Email: cliente2@qhatu.com');
    console.log('   Password: cliente123');
    console.log('═══════════════════════════════════════════════════\n');

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

// Ejecutar seed
seedUsers();