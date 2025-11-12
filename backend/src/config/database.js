// src/config/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// ====================================
// 🔧 CONFIGURACIÓN DE SEQUELIZE
// ====================================

const sequelize = new Sequelize(
  process.env.DB_NAME || 'qhatu_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    
    // Logging: solo en desarrollo
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Timezone de Perú
    timezone: '-05:00',
    
    // Pool de conexiones para mejor rendimiento
    pool: {
      max: 10,           // Máximo de conexiones simultáneas
      min: 0,            // Mínimo de conexiones
      acquire: 30000,    // Tiempo máximo (ms) para adquirir conexión
      idle: 10000        // Tiempo máximo (ms) que una conexión puede estar inactiva
    },
    
    // Configuración global de modelos
    define: {
      timestamps: false,        // Desactivar createdAt/updatedAt automáticos
      freezeTableName: true,    // No pluralizar nombres de tablas
      underscored: false        // Usar camelCase en lugar de snake_case
    },
    
    // Retry logic en caso de pérdida de conexión
    retry: {
      max: 3,
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ENOTFOUND/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ]
    }
  }
);

// ====================================
// 🧪 FUNCIÓN PARA PROBAR LA CONEXIÓN
// ====================================

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL exitosa');
    
    // Verificar versión de MySQL
    const [result] = await sequelize.query('SELECT VERSION() as version');
    console.log(`   MySQL versión: ${result[0].version}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:');
    console.error(`   ${error.message}`);
    
    // Mensajes de ayuda según el error
    if (error.original?.code === 'ECONNREFUSED') {
      console.error('\n💡 SOLUCIÓN: Inicia MySQL en XAMPP/WAMP');
    } else if (error.original?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 SOLUCIÓN: Verifica DB_USER y DB_PASSWORD en .env');
    } else if (error.original?.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 SOLUCIÓN: La base de datos no existe. Ejecuta:');
      console.error('   CREATE DATABASE qhatu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    }
    
    return false;
  }
};

// ====================================
// 🔄 FUNCIÓN PARA SINCRONIZAR MODELOS
// ====================================

export const syncDatabase = async (options = {}) => {
  try {
    const mode = options.force ? 'FORCE' : options.alter ? 'ALTER' : 'SAFE';
    console.log(`🔄 Sincronizando modelos (${mode})...`);
    
    await sequelize.sync(options);
    console.log('✅ Modelos sincronizados correctamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:');
    console.error(`   ${error.message}`);
    throw error;
  }
};

// ====================================
// 🧹 FUNCIÓN PARA CERRAR CONEXIÓN
// ====================================

export const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('🔌 Conexión a MySQL cerrada correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error.message);
    throw error;
  }
};

// ====================================
// 📊 FUNCIÓN PARA VERIFICAR TABLAS
// ====================================

export const verifyTables = async () => {
  try {
    const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'qhatu_db'}'
    `);
    
    const tableNames = tables.map(t => t.TABLE_NAME);
    
    const requiredTables = [
      'productos', 'categorias', 'usuarios', 'carritos', 
      'carrito_items', 'ventas', 'venta_items', 'roles', 
      'carruseles', 'banners_descuento', 'sesiones_usuario'
    ];
    
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));
    
    if (missingTables.length > 0) {
      console.warn('⚠️  Faltan tablas en la base de datos:');
      missingTables.forEach(table => console.warn(`   - ${table}`));
      console.warn('\n💡 Ejecuta: mysql -u root qhatu_db < db/qhatu_db(3).sql\n');
      return false;
    }
    
    console.log(`✅ Todas las tablas requeridas presentes (${tableNames.length} tablas)`);
    return true;
  } catch (error) {
    console.error('❌ Error al verificar tablas:', error.message);
    return false;
  }
};

// ====================================
// 📤 EXPORTACIONES
// ====================================

// Export por defecto (para imports como: import sequelize from './database.js')
export default sequelize;

// Export nombrado (para imports como: import { sequelize } from './database.js')
export { sequelize };