// C:\qhatu\backend\src\models\VentaItem.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const VentaItem = sequelize.define('VentaItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  venta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ventas',
      key: 'venta_id'
    }
  },
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'productos',
      key: 'producto_id'
    }
  },
  // Snapshot del producto (datos históricos)
  producto_nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nombre del producto al momento de la venta'
  },
  producto_descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  producto_codigo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  producto_url_imagen: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'producto_url_imagen' // Mapea con el campo de la BD
  },
  // Datos de venta
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  precio_descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'venta_items',
  timestamps: false,
  indexes: [
    {
      name: 'idx_venta_id',
      fields: ['venta_id']
    },
    {
      name: 'idx_producto_id',
      fields: ['producto_id']
    }
  ]
});

// ====================================
// 🔧 MÉTODOS DE INSTANCIA
// ====================================

/**
 * Obtener el precio final (con o sin descuento)
 */
VentaItem.prototype.getPrecioFinal = function() {
  return this.precio_descuento || this.precio_unitario;
};

/**
 * Calcular el ahorro por descuento
 */
VentaItem.prototype.getAhorro = function() {
  if (!this.precio_descuento) return 0;
  return (this.precio_unitario - this.precio_descuento) * this.cantidad;
};

/**
 * Verificar si el item tiene descuento
 */
VentaItem.prototype.tieneDescuento = function() {
  return this.precio_descuento !== null && this.precio_descuento < this.precio_unitario;
};

/**
 * Serializar para API
 */
VentaItem.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Agregar campos calculados
  values.precio_final = this.getPrecioFinal();
  values.ahorro = this.getAhorro();
  values.tiene_descuento = this.tieneDescuento();
  
  return values;
};

export default VentaItem;