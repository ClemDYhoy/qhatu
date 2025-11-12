// C:\qhatu\backend\src\models\index.js
import sequelize from '../config/database.js';
import Product from './Product.js';
import Category from './Category.js';
import Carousel from './Carousel.js';
import User from './User.js';
import Role from './Role.js';
import Cart from './Cart.js';
import CartItem from './CartItem.js';
import SessionTracking from './SessionTracking.js';

// ====================================
// 📊 RELACIONES ENTRE MODELOS
// ====================================

// --- 👤 Usuarios y Roles ---
User.belongsTo(Role, {
  foreignKey: 'rol_id',
  as: 'rol',
  targetKey: 'rol_id'
});

Role.hasMany(User, {
  foreignKey: 'rol_id',
  as: 'usuarios'
});

// --- 📦 Productos y Categorías ---
Product.belongsTo(Category, {
  foreignKey: 'categoria_id',
  as: 'categoria'
});

Category.hasMany(Product, {
  foreignKey: 'categoria_id',
  as: 'productos'
});

// --- 🛒 Usuarios y Carritos ---
User.hasOne(Cart, {
  foreignKey: 'usuario_id',
  as: 'carrito'
});

Cart.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// --- 🛍️ Carritos y Items ---
Cart.hasMany(CartItem, {
  foreignKey: 'carrito_id',
  as: 'items',
  onDelete: 'CASCADE'
});

CartItem.belongsTo(Cart, {
  foreignKey: 'carrito_id',
  as: 'carrito'
});

// --- 📦 Items y Productos ---
CartItem.belongsTo(Product, {
  foreignKey: 'producto_id',
  as: 'producto'
});

Product.hasMany(CartItem, {
  foreignKey: 'producto_id',
  as: 'items_carrito'
});

// --- 📊 Usuarios y Sesiones de Tracking ---
User.hasMany(SessionTracking, {
  foreignKey: 'usuario_id',
  as: 'sesiones'
});

SessionTracking.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

// ====================================
// 🔄 FUNCIÓN DE SINCRONIZACIÓN (CONTROLADA)
// ====================================

/**
 * Sincronizar modelos con la base de datos
 * ⚠️ SOLO llamar explícitamente desde server.js
 * 
 * @param {Object} options - Opciones de sincronización
 * @param {boolean} options.force - Eliminar y recrear tablas
 * @param {boolean} options.alter - Modificar tablas existentes
 */
export const syncModels = async (options = {}) => {
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
// 🧪 VERIFICAR ASOCIACIONES
// ====================================

/**
 * Verificar que todas las asociaciones estén configuradas
 * Útil para debugging
 */
export const verifyAssociations = () => {
  console.log('\n🔍 Verificando asociaciones...\n');
  
  const models = {
    User,
    Role,
    Product,
    Category,
    Cart,
    CartItem,
    SessionTracking
  };
  
  Object.entries(models).forEach(([name, model]) => {
    const associations = Object.keys(model.associations);
    console.log(`📋 ${name}:`, associations.length > 0 ? associations.join(', ') : '❌ Sin asociaciones');
  });
  
  console.log('');
};

// ====================================
// 📤 EXPORTACIONES
// ====================================

// Export individual de modelos
export {
  sequelize,
  Product,
  Category,
  Carousel,
  User,
  Role,
  Cart,
  CartItem,
  SessionTracking
};

// Export por defecto (objeto con todos los modelos)
export default {
  sequelize,
  Product,
  Category,
  Carousel,
  User,
  Role,
  Cart,
  CartItem,
  SessionTracking,
  syncModels,
  verifyAssociations
};