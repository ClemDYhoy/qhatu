// src/models/CartItem.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Cart from './Cart.js';
import Product from './Product.js';

const CartItem = sequelize.define('CartItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  carrito_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Cart, key: 'carrito_id' }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Product, key: 'producto_id' }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precio_descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'carrito_items',
  timestamps: true,
  createdAt: 'agregado_en',
  updatedAt: false
});

Cart.hasMany(CartItem, { foreignKey: 'carrito_id', onDelete: 'CASCADE' });
CartItem.belongsTo(Cart, { foreignKey: 'carrito_id' });
CartItem.belongsTo(Product, { foreignKey: 'producto_id' });

export default CartItem;