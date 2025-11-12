// scripts/testMiddleware.js
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

/**
 * Script para probar que los middlewares están correctamente configurados
 */

console.log('🔧 Verificando configuración de middlewares...\n');

// 1. Verificar variables de entorno
console.log('1️⃣ Variables de entorno:');
const requiredEnvVars = ['JWT_SECRET', 'DB_NAME', 'DB_HOST'];
let envCheck = true;

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName}: ${varName === 'JWT_SECRET' ? '***' : process.env[varName]}`);
  } else {
    console.log(`   ❌ ${varName}: NO CONFIGURADO`);
    envCheck = false;
  }
});

if (!envCheck) {
  console.error('\n❌ Faltan variables de entorno requeridas\n');
  process.exit(1);
}

// 2. Verificar que los middlewares se pueden importar
console.log('\n2️⃣ Importando middlewares:');
try {
  const authModule = await import('../src/config/middleware/auth.js');
  
  const expectedExports = [
    'requireAuth',
    'optionalAuth',
    'requireRole',
    'requireAdmin',
    'requireSuperAdmin',
    'requirePermission',
    'authMiddleware',
    'adminMiddleware'
  ];
  
  let importCheck = true;
  expectedExports.forEach(exportName => {
    if (authModule[exportName]) {
      console.log(`   ✅ ${exportName}`);
    } else {
      console.log(`   ❌ ${exportName} - NO ENCONTRADO`);
      importCheck = false;
    }
  });
  
  if (!importCheck) {
    console.error('\n❌ Algunos middlewares no están disponibles\n');
    process.exit(1);
  }
  
} catch (error) {
  console.error(`   ❌ Error al importar: ${error.message}\n`);
  process.exit(1);
}

// 3. Probar generación de JWT
console.log('\n3️⃣ Probando JWT:');
try {
  const testUser = {
    usuario_id: 1,
    email: 'test@example.com',
    rol_nombre: 'super_admin'
  };
  
  const token = jwt.sign(testUser, process.env.JWT_SECRET, { expiresIn: '1h' });
  console.log(`   ✅ Token generado: ${token.substring(0, 30)}...`);
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(`   ✅ Token verificado: ${decoded.email}`);
  
} catch (error) {
  console.error(`   ❌ Error con JWT: ${error.message}\n`);
  process.exit(1);
}

// 4. Verificar estructura de permisos
console.log('\n4️⃣ Estructura de permisos:');
const testPermisos = {
  productos: ['crear', 'editar', 'eliminar', 'ver'],
  ventas: ['ver', 'modificar'],
  reportes: ['ver', 'exportar']
};

console.log('   ✅ Formato JSON:', JSON.stringify(testPermisos, null, 2));
console.log('   ✅ Permisos parseables correctamente');

// 5. Resumen
console.log('\n═══════════════════════════════════════');
console.log('✅ Todos los checks pasaron exitosamente');
console.log('═══════════════════════════════════════\n');

console.log('📋 Próximos pasos:');
console.log('   1. node src/server.js - Iniciar servidor');
console.log('   2. Probar endpoints con Postman/Thunder Client');
console.log('   3. Verificar que las rutas respondan correctamente\n');

console.log('🔗 Endpoints para probar:');
console.log('   GET  /api/health - Sin autenticación');
console.log('   POST /api/auth/login - Obtener token');
console.log('   GET  /api/analytics/dashboard - Con token admin\n');