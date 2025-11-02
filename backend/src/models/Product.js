import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  producto_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  precio_descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  estado_stock: {
    type: DataTypes.ENUM('Habido', 'Agotado'),
    allowNull: true
  },
  porcentaje_stock: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  umbral_bajo_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  umbral_critico_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categorias',
      key: 'categoria_id'
    }
  },
  destacado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ventas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  peso: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  unidad_medida: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  url_imagen: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  creado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  actualizado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'productos',
  timestamps: false
});

export default Product;