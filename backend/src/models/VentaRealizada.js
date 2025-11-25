// C:\qhatu\backend\src\models\VentaRealizada.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * 📊 MODELO: Ventas Realizadas
 * 
 * Este modelo representa ventas CONFIRMADAS que se usan para análisis.
 * Se llena automáticamente mediante un TRIGGER de MySQL cuando una venta
 * pasa de estado 'pendiente' a 'confirmada'.
 * 
 * NO insertar manualmente - el trigger lo hace automáticamente.
 */
const VentaRealizada = sequelize.define('VentaRealizada', {
  venta_realizada_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único de la venta realizada'
  },
  
  // ==================== REFERENCIAS ====================
  venta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'ventas',
      key: 'venta_id'
    },
    comment: 'Referencia a la venta original'
  },
  
  numero_venta: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: 'QH-0001, QH-0002, etc'
  },
  
  // ==================== INFORMACIÓN DEL CLIENTE ====================
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'usuario_id'
    },
    comment: 'ID del cliente si está registrado'
  },
  
  cliente_nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  
  cliente_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  cliente_telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  cliente_documento: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  cliente_tipo: {
    type: DataTypes.ENUM('registrado', 'invitado'),
    defaultValue: 'invitado',
    comment: 'Tipo de cliente para segmentación'
  },
  
  // ==================== INFORMACIÓN DEL VENDEDOR ====================
  vendedor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'usuario_id'
    },
    comment: 'Vendedor que confirmó la venta'
  },
  
  vendedor_nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  
  // ==================== FINANCIERO ====================
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  
  descuento_total: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  
  metodo_pago: {
    type: DataTypes.ENUM('whatsapp_pago', 'yape', 'plin', 'transferencia', 'efectivo'),
    defaultValue: 'whatsapp_pago'
  },
  
  // ==================== PRODUCTOS (RESUMEN) ====================
  cantidad_productos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total de productos diferentes'
  },
  
  cantidad_items: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total de unidades vendidas'
  },
  
  // ==================== MÉTRICAS DE VENTA ====================
  margen_beneficio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Beneficio calculado si hay costo de productos'
  },
  
  comision_vendedor: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Comisión del vendedor (calculable)'
  },
  
  // ==================== TEMPORAL (ANÁLISIS) ====================
  hora_venta: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Hora exacta de la venta'
  },
  
  dia_semana: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '1=Lunes, 7=Domingo'
  },
  
  mes: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '1-12'
  },
  
  anio: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  
  trimestre: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '1-4'
  },
  
  // ==================== UBICACIÓN ====================
  ciudad: {
    type: DataTypes.STRING(100),
    defaultValue: 'Huánuco'
  },
  
  distrito: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  departamento: {
    type: DataTypes.STRING(100),
    defaultValue: 'Huánuco'
  },
  
  // ==================== TIMESTAMPS ====================
  fecha_venta: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha original de creación'
  },
  
  fecha_confirmacion: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha en que se confirmó'
  },
  
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha de inserción en esta tabla'
  }
  
}, {
  tableName: 'ventas_realizadas',
  timestamps: false,
  indexes: [
    { name: 'idx_fecha_venta', fields: ['fecha_venta'] },
    { name: 'idx_vendedor', fields: ['vendedor_id', 'fecha_venta'] },
    { name: 'idx_cliente', fields: ['cliente_id', 'fecha_venta'] },
    { name: 'idx_periodo', fields: ['anio', 'mes', 'dia_semana'] },
    { name: 'idx_metodo_pago', fields: ['metodo_pago'] },
    { name: 'idx_total', fields: ['total'] },
    { name: 'unique_venta', fields: ['venta_id'], unique: true }
  ]
});

// ====================================
// 🔧 MÉTODOS DE INSTANCIA
// ====================================

/**
 * Calcular comisión del vendedor (5% por defecto)
 */
VentaRealizada.prototype.calcularComision = function(porcentaje = 0.05) {
  return (parseFloat(this.total) * porcentaje).toFixed(2);
};

/**
 * Obtener periodo legible
 */
VentaRealizada.prototype.getPeriodo = function() {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return {
    mes: meses[this.mes - 1],
    anio: this.anio,
    trimestre: `Q${this.trimestre}`,
    periodo_completo: `${meses[this.mes - 1]} ${this.anio}`
  };
};

/**
 * Obtener día de la semana legible
 */
VentaRealizada.prototype.getDiaSemana = function() {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[this.dia_semana - 1] || 'Desconocido';
};

/**
 * Verificar si es cliente frecuente
 */
VentaRealizada.prototype.esClienteFrecuente = async function() {
  if (!this.cliente_id) return false;
  
  const count = await VentaRealizada.count({
    where: { cliente_id: this.cliente_id }
  });
  
  return count >= 5;
};

/**
 * Serializar para API con datos calculados
 */
VentaRealizada.prototype.toJSON = function() {
  const values = { ...this.get() };
  
  // Agregar campos calculados
  values.comision_calculada = this.calcularComision();
  values.periodo = this.getPeriodo();
  values.dia_semana_nombre = this.getDiaSemana();
  values.ticket_promedio = (parseFloat(this.total) / this.cantidad_productos).toFixed(2);
  
  return values;
};

// ====================================
// 🔧 MÉTODOS ESTÁTICOS (QUERIES)
// ====================================

/**
 * Obtener ventas de un periodo específico
 */
VentaRealizada.obtenerPorPeriodo = async function(anio, mes = null) {
  const where = { anio };
  if (mes !== null) where.mes = mes;
  
  return await VentaRealizada.findAll({
    where,
    order: [['fecha_venta', 'DESC']]
  });
};

/**
 * Obtener ventas de un vendedor
 */
VentaRealizada.obtenerPorVendedor = async function(vendedor_id, limite = 100) {
  return await VentaRealizada.findAll({
    where: { vendedor_id },
    order: [['fecha_venta', 'DESC']],
    limit: limite
  });
};

/**
 * Obtener estadísticas rápidas
 */
VentaRealizada.obtenerEstadisticas = async function(filtros = {}) {
  const { vendedor_id, mes, anio } = filtros;
  
  const where = {};
  if (vendedor_id) where.vendedor_id = vendedor_id;
  if (mes) where.mes = mes;
  if (anio) where.anio = anio;
  
  const ventas = await VentaRealizada.findAll({ where });
  
  const total_ventas = ventas.length;
  const total_ingresos = ventas.reduce((sum, v) => sum + parseFloat(v.total), 0);
  const total_items = ventas.reduce((sum, v) => sum + v.cantidad_items, 0);
  const ticket_promedio = total_ventas > 0 ? total_ingresos / total_ventas : 0;
  
  return {
    total_ventas,
    total_ingresos: total_ingresos.toFixed(2),
    total_items,
    ticket_promedio: ticket_promedio.toFixed(2),
    clientes_unicos: new Set(ventas.map(v => v.cliente_id).filter(Boolean)).size
  };
};

export default VentaRealizada;