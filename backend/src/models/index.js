// C:\qhatu\backend\src\models\index.js
import sequelize from '../config/database.js';

// ====================================
// 📦 IMPORTACIÓN DE MODELOS
// ====================================

// Modelos base
import Product from './Product.js';
import Category from './Category.js';
import Carousel from './Carousel.js';

// Usuarios y autenticación
import User from './User.js';
import Role from './Role.js';

// Carrito de compras
import Cart from './Cart.js';
import CartItem from './CartItem.js';

// Sistema de ventas
import Venta from './Venta.js';
import VentaItem from './VentaItem.js';

// Tracking y análisis
import SessionTracking from './SessionTracking.js';

// 🆕 Analytics - Ventas Realizadas
import VentaRealizada from './VentaRealizada.js';
import VentaRealizadaItem from './VentaRealizadaItem.js';

// ====================================
// 🔗 DEFINICIÓN DE RELACIONES
// ====================================

/**
 * Configura todas las asociaciones entre modelos
 * Se ejecuta una sola vez al importar este módulo
 */
const setupAssociations = () => {
  console.log('🔗 Configurando asociaciones de modelos...');

  // ==========================================
  // 👤 USUARIOS Y ROLES
  // ==========================================
  
  User.belongsTo(Role, {
    foreignKey: 'rol_id',
    as: 'rol',
    targetKey: 'rol_id'
  });

  Role.hasMany(User, {
    foreignKey: 'rol_id',
    as: 'usuarios'
  });

  // ==========================================
  // 📦 PRODUCTOS Y CATEGORÍAS
  // ==========================================
  
  Product.belongsTo(Category, {
    foreignKey: 'categoria_id',
    as: 'categoria'
  });

  Category.hasMany(Product, {
    foreignKey: 'categoria_id',
    as: 'productos'
  });

  // ==========================================
  // 🎠 CARRUSELES Y CATEGORÍAS
  // ==========================================
  
  Carousel.belongsTo(Category, {
    foreignKey: 'categoria_id',
    as: 'categoria'
  });

  Category.hasMany(Carousel, {
    foreignKey: 'categoria_id',
    as: 'carruseles'
  });

  // ==========================================
  // 🛒 CARRITOS DE COMPRA
  // ==========================================
  
  // Usuario <-> Carrito (1:1)
  User.hasOne(Cart, {
    foreignKey: 'usuario_id',
    as: 'carrito'
  });

  Cart.belongsTo(User, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  // Carrito <-> Items (1:N)
  Cart.hasMany(CartItem, {
    foreignKey: 'carrito_id',
    as: 'items',
    onDelete: 'CASCADE'
  });

  CartItem.belongsTo(Cart, {
    foreignKey: 'carrito_id',
    as: 'carrito'
  });

  // CartItem <-> Producto (N:1)
  CartItem.belongsTo(Product, {
    foreignKey: 'producto_id',
    as: 'producto'
  });

  Product.hasMany(CartItem, {
    foreignKey: 'producto_id',
    as: 'items_carrito'
  });

  // ==========================================
  // 💰 SISTEMA DE VENTAS
  // ==========================================
  
  // Venta <-> Usuario Cliente (N:1)
  Venta.belongsTo(User, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  User.hasMany(Venta, {
    foreignKey: 'usuario_id',
    as: 'ventas'
  });

  // Venta <-> Usuario Vendedor (N:1)
  Venta.belongsTo(User, {
    foreignKey: 'vendedor_id',
    as: 'vendedor'
  });

  User.hasMany(Venta, {
    foreignKey: 'vendedor_id',
    as: 'ventas_gestionadas'
  });

  // Venta <-> Carrito (1:1)
  Venta.belongsTo(Cart, {
    foreignKey: 'carrito_id',
    as: 'carrito'
  });

  Cart.hasOne(Venta, {
    foreignKey: 'carrito_id',
    as: 'venta'
  });

  // Venta <-> VentaItems (1:N)
  Venta.hasMany(VentaItem, {
    foreignKey: 'venta_id',
    as: 'items',
    onDelete: 'CASCADE'
  });

  VentaItem.belongsTo(Venta, {
    foreignKey: 'venta_id',
    as: 'venta'
  });

  // VentaItem <-> Producto (N:1)
  VentaItem.belongsTo(Product, {
    foreignKey: 'producto_id',
    as: 'producto'
  });

  Product.hasMany(VentaItem, {
    foreignKey: 'producto_id',
    as: 'ventas_items'
  });

  // ==========================================
  // 📊 TRACKING Y ANÁLISIS
  // ==========================================
  
  User.hasMany(SessionTracking, {
    foreignKey: 'usuario_id',
    as: 'sesiones'
  });

  SessionTracking.belongsTo(User, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  // ==========================================
  // 🆕 ANALYTICS - VENTAS REALIZADAS
  // ==========================================
  
  // VentaRealizada <-> Venta Original
  VentaRealizada.belongsTo(Venta, {
    foreignKey: 'venta_id',
    as: 'venta_original'
  });

  Venta.hasOne(VentaRealizada, {
    foreignKey: 'venta_id',
    as: 'analytics'
  });

  // VentaRealizada <-> Usuario Cliente
  VentaRealizada.belongsTo(User, {
    foreignKey: 'cliente_id',
    as: 'cliente'
  });

  User.hasMany(VentaRealizada, {
    foreignKey: 'cliente_id',
    as: 'compras_realizadas'
  });

  // VentaRealizada <-> Usuario Vendedor
  VentaRealizada.belongsTo(User, {
    foreignKey: 'vendedor_id',
    as: 'vendedor'
  });

  User.hasMany(VentaRealizada, {
    foreignKey: 'vendedor_id',
    as: 'ventas_confirmadas'
  });

  // VentaRealizada <-> Items
  VentaRealizada.hasMany(VentaRealizadaItem, {
    foreignKey: 'venta_realizada_id',
    as: 'items',
    onDelete: 'CASCADE'
  });

  VentaRealizadaItem.belongsTo(VentaRealizada, {
    foreignKey: 'venta_realizada_id',
    as: 'venta_realizada'
  });

  // VentaRealizadaItem <-> Producto
  VentaRealizadaItem.belongsTo(Product, {
    foreignKey: 'producto_id',
    as: 'producto'
  });

  Product.hasMany(VentaRealizadaItem, {
    foreignKey: 'producto_id',
    as: 'analytics_items'
  });

  // VentaRealizadaItem <-> Categoría
  VentaRealizadaItem.belongsTo(Category, {
    foreignKey: 'categoria_id',
    as: 'categoria'
  });

  Category.hasMany(VentaRealizadaItem, {
    foreignKey: 'categoria_id',
    as: 'items_vendidos'
  });

  console.log('✅ Asociaciones configuradas exitosamente');
};

// Ejecutar configuración de asociaciones
setupAssociations();

// ====================================
// 🔧 UTILIDADES DE GESTIÓN
// ====================================

/**
 * Sincronizar modelos con la base de datos
 * ⚠️ USAR CON PRECAUCIÓN EN PRODUCCIÓN
 */
export const syncModels = async (options = {}) => {
  try {
    const mode = options.force ? '🔴 FORCE (destruirá datos)' 
               : options.alter ? '🟡 ALTER (modificará estructura)' 
               : '🟢 SAFE (solo verificación)';
    
    console.log(`\n🔄 Sincronizando modelos: ${mode}\n`);
    
    if (options.force) {
      console.warn('⚠️  ADVERTENCIA: Se eliminarán TODOS los datos');
      console.warn('⚠️  Esta operación es IRREVERSIBLE\n');
    }
    
    await sequelize.sync(options);
    
    console.log('✅ Modelos sincronizados correctamente\n');
    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:');
    console.error(`   ${error.message}`);
    if (error.original) {
      console.error(`   SQL Error: ${error.original.message}`);
    }
    throw error;
  }
};

/**
 * Verificar estado de las asociaciones
 */
export const verifyAssociations = () => {
  console.log('\n🔍 Verificando asociaciones de modelos...\n');
  
  const models = {
    User,
    Role,
    Product,
    Category,
    Cart,
    CartItem,
    Venta,
    VentaItem,
    SessionTracking,
    Carousel,
    VentaRealizada,
    VentaRealizadaItem
  };
  
  const report = {};
  
  Object.entries(models).forEach(([name, model]) => {
    const associations = Object.keys(model.associations);
    const count = associations.length;
    
    report[name] = {
      count,
      associations
    };
    
    const status = count > 0 ? '✅' : '❌';
    const list = count > 0 ? associations.join(', ') : 'Sin asociaciones';
    
    console.log(`${status} ${name.padEnd(20)} (${count}): ${list}`);
  });
  
  console.log('\n');
  return report;
};

/**
 * Verificar conexión a la base de datos
 */
export const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    
    const [result] = await sequelize.query('SELECT VERSION() as version, DATABASE() as database');
    const { version, database } = result[0];
    
    return {
      success: true,
      connected: true,
      database,
      version,
      dialect: sequelize.getDialect()
    };
  } catch (error) {
    return {
      success: false,
      connected: false,
      error: error.message
    };
  }
};

/**
 * Obtener estadísticas de la base de datos
 */
export const getDatabaseStats = async () => {
  try {
    const [tables] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS size_mb
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC
    `);

    const totalRows = tables.reduce((sum, table) => sum + (table.TABLE_ROWS || 0), 0);
    const totalSize = tables.reduce((sum, table) => sum + (parseFloat(table.size_mb) || 0), 0);

    return {
      tables: tables.map(t => ({
        name: t.TABLE_NAME,
        rows: t.TABLE_ROWS || 0,
        size: `${t.size_mb} MB`
      })),
      summary: {
        total_tables: tables.length,
        total_rows: totalRows,
        total_size: `${totalSize.toFixed(2)} MB`
      }
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error.message);
    return null;
  }
};

// ====================================
// 📤 EXPORTACIONES
// ====================================

// Exportaciones individuales (recomendado)
export {
  sequelize,
  
  // Modelos principales
  Product,
  Category,
  Carousel,
  
  // Usuarios
  User,
  Role,
  
  // Carrito
  Cart,
  CartItem,
  
  // Ventas
  Venta,
  VentaItem,
  
  // Tracking
  SessionTracking,
  
  // 🆕 Analytics
  VentaRealizada,
  VentaRealizadaItem
};

// Exportación por defecto (objeto con todo)
export default {
  // Instancia de Sequelize
  sequelize,
  
  // Modelos existentes
  Product,
  Category,
  Carousel,
  User,
  Role,
  Cart,
  CartItem,
  Venta,
  VentaItem,
  SessionTracking,
  
  // 🆕 Modelos Analytics
  VentaRealizada,
  VentaRealizadaItem,
  
  // Utilidades
  syncModels,
  verifyAssociations,
  checkConnection,
  getDatabaseStats
};