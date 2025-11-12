// src/models/Product.js
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
    allowNull: false,
    validate: { len: [3, 255] }
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0.01 }
  },
  precio_descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0,
      isLessThanPrice(value) {
        if (value && parseFloat(value) >= parseFloat(this.precio)) {
          throw new Error('El descuento debe ser menor al precio original');
        }
      }
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  estado_stock: {
    type: DataTypes.VIRTUAL,
    get() {
      if (this.stock === 0) return 'Agotado';
      if (this.stock <= this.umbral_critico_stock) return 'Crítico';
      if (this.stock <= this.umbral_bajo_stock) return 'Bajo';
      return 'Disponible';
    }
  },
  porcentaje_stock: {
    type: DataTypes.VIRTUAL,
    get() {
      const max = 100;
      return Math.max(0, Math.min(100, (this.stock / max) * 100)).toFixed(2);
    }
  },
  umbral_bajo_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
    validate: { min: 1 }
  },
  umbral_critico_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: { min: 1 }
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  destacado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ventas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  peso: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: { min: 0 }
  },
  unidad_medida: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  url_imagen: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: { isUrl: true }
  }
}, {
  tableName: 'productos',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en',
  hooks: {
    beforeUpdate: (product) => {
      product.actualizado_en = new Date();
    }
  }
});

export default Product;