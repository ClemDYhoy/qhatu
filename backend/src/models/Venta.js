// C:\qhatu\backend\src\models\Venta.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Venta = sequelize.define('Venta', {
  venta_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_venta: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'QH-0001, QH-0002, etc.'
  },
  carrito_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'carritos',
      key: 'carrito_id'
    }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'usuario_id'
    }
  },
  vendedor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'usuario_id'
    }
  },
  cliente_nombre: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cliente_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cliente_telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  cliente_direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cliente_distrito: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cliente_notas: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cliente_notas'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  descuento_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM(
      'pendiente',
      'confirmada',
      'procesando',
      'en_preparacion',
      'lista_entrega',
      'en_camino',
      'enviada',
      'entregada',
      'cancelada'
    ),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  metodo_pago: {
    type: DataTypes.ENUM('whatsapp_pago', 'yape', 'plin', 'transferencia', 'efectivo'),
    defaultValue: 'whatsapp_pago'
  },
  comprobante_pago: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  notas_venta: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notas_vendedor: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notas_entrega: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pdf_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  enviado_whatsapp: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'enviado_whatsapp'
  },
  fecha_envio_whatsapp: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'fecha_envio_whatsapp'
  },
  mensaje_whatsapp: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'mensaje_whatsapp'
  },
  fecha_venta: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'fecha_venta'
  },
  fecha_confirmacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_entrega: {
    type: DataTypes.DATE,
    allowNull: true
  },
  fecha_cancelacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualizado_en: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'actualizado_en'
  }
}, {
  tableName: 'ventas',
  timestamps: false,
  hooks: {
    beforeUpdate: (venta) => {
      venta.actualizado_en = new Date();
    }
  }
});

// Método de instancia: obtener estado legible
Venta.prototype.getEstadoLabel = function() {
  const labels = {
    pendiente: '⏳ Pendiente',
    confirmada: '✅ Confirmada',
    procesando: '📦 Procesando',
    en_preparacion: '🔨 En Preparación',
    lista_entrega: '📋 Lista para Entrega',
    en_camino: '🚚 En Camino',
    enviada: '✈️ Enviada',
    entregada: '✅ Entregada',
    cancelada: '❌ Cancelada'
  };
  return labels[this.estado] || this.estado;
};

export default Venta;