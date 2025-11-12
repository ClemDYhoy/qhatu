// src/models/Cart.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Cart = sequelize.define('Cart', {
  carrito_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: User, key: 'usuario_id' }
  },
  sesion_temporal: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'enviado', 'cancelado'),
    defaultValue: 'activo'
  },
  subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  descuento_total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  notas_cliente: DataTypes.TEXT
}, {
  tableName: 'carritos',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en'
});

Cart.belongsTo(User, { foreignKey: 'usuario_id' });
User.hasOne(Cart, { foreignKey: 'usuario_id' });

export default Cart;