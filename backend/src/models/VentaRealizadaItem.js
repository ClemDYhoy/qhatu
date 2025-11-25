// C:\qhatu\backend\src\models\VentaRealizadaItem.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * 📦 MODELO: Items de Ventas Realizadas
 * 
 * Detalle de productos vendidos en cada venta confirmada.
 * Se llena automáticamente mediante TRIGGER de MySQL.
 * 
 * Incluye snapshot completo del producto al momento de la venta.
 */
const VentaRealizadaItem = sequelize.define('VentaRealizadaItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  venta_realizada_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ventas_realizadas',
      key: 'venta_realizada_id'
    },
    comment: 'Referencia a venta realizada'
  },
  
  // ==================== PRODUCTO ====================
  producto_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'productos',
      key: 'producto_id'
    },
    comment: 'Referencia a producto (puede ser NULL si se elimina)'
  },
  
  producto_nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  
  producto_codigo: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  // ==================== CATEGORÍA ====================
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categorias',
      key: 'categoria_id'
    }
  },
  
  categoria_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  // ==================== CANTIDADES Y PRECIOS ====================
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
    comment: 'Precio original sin descuento'
  },
  
  precio_descuento: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Precio con descuento aplicado'
  },
  
  precio_final: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Precio usado en la venta (con o sin descuento)'
  },
  
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'precio_final * cantidad'
  },
  
  // ==================== DESCUENTO ====================
  descuento_porcentaje: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Porcentaje de descuento aplicado'
  },
  
  descuento_monto: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: 'Monto total ahorrado'
  },
  
  // ==================== SNAPSHOT DE STOCK ====================
  stock_antes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Stock antes de confirmar la venta'
  },
  
  stock_despues: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Stock después de confirmar la venta'
  },
  
  // ==================== TIMESTAMP ====================
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
  
}, {
  tableName: 'ventas_realizadas_items',
  timestamps: false,
  indexes: [
    { name: 'idx_venta', fields: ['venta_realizada_id'] },
    { name: 'idx_producto', fields: ['producto_id', 'fecha_registro'] },
    { name: 'idx_categoria', fields: ['categoria_id', 'fecha_registro'] }
  ]
});

// ====================================
// 🔧 MÉTODOS DE INSTANCIA
// ====================================

/**
 * Calcular porcentaje de descuento
 */
VentaRealizadaItem.prototype.calcularPorcentajeDescuento = function() {
  if (!this.precio_descuento || this.precio_descuento >= this.precio_unitario) {
    return 0;
  }
  
  return (
    ((this.precio_unitario - this.precio_descuento) / this.precio_unitario) * 100
  ).toFixed(2);
};

/**
 * Verificar si tiene descuento
 */
VentaRealizadaItem.prototype.tieneDescuento = function() {
  return this.precio_descuento !== null && 
         this.precio_descuento < this.precio_unitario;
};

/**
 * Calcular ahorro total
 */
VentaRealizadaItem.prototype.calcularAhorro = function() {
  if (!this.tieneDescuento()) return 0;
  return ((this.precio_unitario - this.precio_descuento) * this.cantidad).toFixed(2);
};

/**
 * Obtener variación de stock
 */
VentaRealizadaItem.prototype.getVariacionStock = function() {
  if (this.stock_antes === null || this.stock_despues === null) {
    return null;
  }
  
  return {
    antes: this.stock_antes,
    despues: this.stock_despues,
    diferencia: this.stock_antes - this.stock_despues,
    reduccion_porcentaje: this.stock_antes > 0 
      ? ((this.cantidad / this.stock_antes) * 100).toFixed(2)
      : 0
  };
};

/**
 * Serializar para API
 */
VentaRealizadaItem.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Agregar campos calculados
  values.tiene_descuento = this.tieneDescuento();
  values.ahorro_total = this.calcularAhorro();
  values.porcentaje_descuento_calculado = this.calcularPorcentajeDescuento();
  values.variacion_stock = this.getVariacionStock();
  
  return values;
};

// ====================================
// 🔧 MÉTODOS ESTÁTICOS
// ====================================

/**
 * Obtener productos más vendidos
 */
VentaRealizadaItem.productosMasVendidos = async function(limite = 10, filtros = {}) {
  const { categoria_id, fecha_desde, fecha_hasta } = filtros;
  
  let whereClause = '';
  const replacements = [limite];
  
  if (categoria_id) {
    whereClause += ' AND vri.categoria_id = ?';
    replacements.unshift(categoria_id);
  }
  
  if (fecha_desde && fecha_hasta) {
    whereClause += ' AND vri.fecha_registro BETWEEN ? AND ?';
    replacements.unshift(fecha_desde, fecha_hasta);
  }
  
  const [results] = await sequelize.query(`
    SELECT 
      vri.producto_id,
      vri.producto_nombre,
      vri.categoria_nombre,
      SUM(vri.cantidad) AS total_vendido,
      COUNT(DISTINCT vri.venta_realizada_id) AS veces_vendido,
      SUM(vri.subtotal) AS ingresos_totales,
      AVG(vri.precio_final) AS precio_promedio,
      SUM(vri.descuento_monto) AS descuento_total_aplicado
    FROM ventas_realizadas_items vri
    WHERE 1=1 ${whereClause}
    GROUP BY vri.producto_id
    ORDER BY total_vendido DESC
    LIMIT ?
  `, {
    replacements,
    type: sequelize.QueryTypes.SELECT
  });
  
  return results;
};

/**
 * Obtener categorías más vendidas
 */
VentaRealizadaItem.categoriasMasVendidas = async function(limite = 10) {
  const [results] = await sequelize.query(`
    SELECT 
      vri.categoria_id,
      vri.categoria_nombre,
      COUNT(DISTINCT vri.producto_id) AS productos_diferentes,
      SUM(vri.cantidad) AS unidades_vendidas,
      SUM(vri.subtotal) AS ingresos_totales,
      AVG(vri.precio_final) AS precio_promedio
    FROM ventas_realizadas_items vri
    WHERE vri.categoria_id IS NOT NULL
    GROUP BY vri.categoria_id
    ORDER BY ingresos_totales DESC
    LIMIT ?
  `, {
    replacements: [limite],
    type: sequelize.QueryTypes.SELECT
  });
  
  return results;
};

/**
 * Obtener items de una venta específica
 */
VentaRealizadaItem.obtenerPorVenta = async function(venta_realizada_id) {
  return await VentaRealizadaItem.findAll({
    where: { venta_realizada_id },
    order: [['subtotal', 'DESC']]
  });
};

export default VentaRealizadaItem;