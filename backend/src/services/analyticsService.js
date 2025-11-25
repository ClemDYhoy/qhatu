// C:\qhatu\backend\src\services\analyticsService.js
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import VentaRealizada from '../models/VentaRealizada.js';
import VentaRealizadaItem from '../models/VentaRealizadaItem.js';

/**
 * 📊 SERVICIO DE ANALYTICS
 * 
 * Maneja todas las consultas de análisis de ventas realizadas.
 * Proporciona métricas, KPIs y datos para los dashboards.
 */
const AnalyticsService = {

  // ==========================================
  // 📈 MÉTRICAS GENERALES
  // ==========================================

  /**
   * Obtener KPIs principales del sistema
   */
  obtenerKPIsPrincipales: async (filtros = {}) => {
    try {
      const { fecha_desde, fecha_hasta, vendedor_id } = filtros;
      
      let whereClause = '1=1';
      const replacements = [];
      
      if (fecha_desde && fecha_hasta) {
        whereClause += ' AND fecha_venta BETWEEN ? AND ?';
        replacements.push(fecha_desde, fecha_hasta);
      }
      
      if (vendedor_id) {
        whereClause += ' AND vendedor_id = ?';
        replacements.push(vendedor_id);
      }
      
      const [result] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_ventas,
          SUM(total) as ingresos_totales,
          AVG(total) as ticket_promedio,
          SUM(cantidad_items) as items_vendidos,
          SUM(descuento_total) as descuentos_aplicados,
          COUNT(DISTINCT cliente_id) as clientes_unicos,
          COUNT(DISTINCT vendedor_id) as vendedores_activos,
          MIN(total) as venta_minima,
          MAX(total) as venta_maxima
        FROM ventas_realizadas
        WHERE ${whereClause}
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });
      
      return {
        success: true,
        data: {
          total_ventas: parseInt(result.total_ventas) || 0,
          ingresos_totales: parseFloat(result.ingresos_totales || 0).toFixed(2),
          ticket_promedio: parseFloat(result.ticket_promedio || 0).toFixed(2),
          items_vendidos: parseInt(result.items_vendidos) || 0,
          descuentos_aplicados: parseFloat(result.descuentos_aplicados || 0).toFixed(2),
          clientes_unicos: parseInt(result.clientes_unicos) || 0,
          vendedores_activos: parseInt(result.vendedores_activos) || 0,
          venta_minima: parseFloat(result.venta_minima || 0).toFixed(2),
          venta_maxima: parseFloat(result.venta_maxima || 0).toFixed(2)
        }
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerKPIsPrincipales:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // ==========================================
  // 👤 ANÁLISIS DE VENDEDORES
  // ==========================================

  /**
   * Obtener rendimiento de vendedores
   */
  obtenerRendimientoVendedores: async (filtros = {}) => {
    try {
      const { periodo = 'mes', limite = 10 } = filtros;
      
      let whereClause = '1=1';
      
      if (periodo === 'hoy') {
        whereClause += ' AND DATE(fecha_venta) = CURDATE()';
      } else if (periodo === 'semana') {
        whereClause += ' AND fecha_venta >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (periodo === 'mes') {
        whereClause += ' AND fecha_venta >= DATE_FORMAT(NOW(), "%Y-%m-01")';
      } else if (periodo === 'anio') {
        whereClause += ' AND YEAR(fecha_venta) = YEAR(NOW())';
      }
      
      const [results] = await sequelize.query(`
        SELECT 
          vendedor_id,
          vendedor_nombre,
          COUNT(*) as total_ventas,
          SUM(total) as monto_vendido,
          AVG(total) as ticket_promedio,
          SUM(cantidad_items) as items_vendidos,
          COUNT(DISTINCT cliente_id) as clientes_atendidos,
          SUM(descuento_total) as descuentos_aplicados,
          MIN(fecha_venta) as primera_venta,
          MAX(fecha_venta) as ultima_venta
        FROM ventas_realizadas
        WHERE ${whereClause}
        GROUP BY vendedor_id, vendedor_nombre
        ORDER BY monto_vendido DESC
        LIMIT ?
      `, {
        replacements: [limite],
        type: sequelize.QueryTypes.SELECT
      });
      
      // Calcular comisiones (5% por defecto)
      const vendedores = results.map(v => ({
        ...v,
        monto_vendido: parseFloat(v.monto_vendido).toFixed(2),
        ticket_promedio: parseFloat(v.ticket_promedio).toFixed(2),
        comision: (parseFloat(v.monto_vendido) * 0.05).toFixed(2),
        porcentaje_comision: 5
      }));
      
      return {
        success: true,
        data: vendedores,
        meta: {
          periodo,
          total_registros: vendedores.length
        }
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerRendimientoVendedores:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Obtener estadísticas de un vendedor específico
   */
  obtenerEstadisticasVendedor: async (vendedor_id, periodo = 'mes') => {
    try {
      let whereClause = 'vendedor_id = ?';
      const replacements = [vendedor_id];
      
      if (periodo === 'hoy') {
        whereClause += ' AND DATE(fecha_venta) = CURDATE()';
      } else if (periodo === 'semana') {
        whereClause += ' AND fecha_venta >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (periodo === 'mes') {
        whereClause += ' AND fecha_venta >= DATE_FORMAT(NOW(), "%Y-%m-01")';
      }
      
      const [stats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_ventas,
          SUM(total) as monto_total,
          AVG(total) as ticket_promedio,
          SUM(cantidad_items) as items_vendidos,
          COUNT(DISTINCT cliente_id) as clientes_unicos,
          MIN(fecha_venta) as primera_venta,
          MAX(fecha_venta) as ultima_venta
        FROM ventas_realizadas
        WHERE ${whereClause}
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });
      
      const result = stats || {};
      
      return {
        success: true,
        data: {
          total_ventas: parseInt(result.total_ventas) || 0,
          monto_total: parseFloat(result.monto_total || 0).toFixed(2),
          ticket_promedio: parseFloat(result.ticket_promedio || 0).toFixed(2),
          items_vendidos: parseInt(result.items_vendidos) || 0,
          clientes_unicos: parseInt(result.clientes_unicos) || 0,
          comision: (parseFloat(result.monto_total || 0) * 0.05).toFixed(2),
          periodo
        }
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerEstadisticasVendedor:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // ==========================================
  // 👥 ANÁLISIS DE CLIENTES
  // ==========================================

  /**
   * Obtener clientes más valiosos (VIP)
   */
  obtenerClientesVIP: async (filtros = {}) => {
    try {
      const { limite = 20, min_compras = 3 } = filtros;
      
      const [results] = await sequelize.query(`
        SELECT 
          vr.cliente_id,
          vr.cliente_nombre,
          vr.cliente_email,
          vr.cliente_telefono,
          COUNT(*) as total_compras,
          SUM(vr.total) as gasto_total,
          AVG(vr.total) as ticket_promedio,
          SUM(vr.cantidad_items) as items_comprados,
          MIN(vr.fecha_venta) as primera_compra,
          MAX(vr.fecha_venta) as ultima_compra,
          DATEDIFF(NOW(), MAX(vr.fecha_venta)) as dias_sin_comprar
        FROM ventas_realizadas vr
        WHERE vr.cliente_id IS NOT NULL
        GROUP BY vr.cliente_id
        HAVING total_compras >= ?
        ORDER BY gasto_total DESC
        LIMIT ?
      `, {
        replacements: [min_compras, limite],
        type: sequelize.QueryTypes.SELECT
      });
      
      const clientes = results.map(c => ({
        ...c,
        gasto_total: parseFloat(c.gasto_total).toFixed(2),
        ticket_promedio: parseFloat(c.ticket_promedio).toFixed(2),
        segmento: c.total_compras >= 10 ? 'VIP' : 
                  c.total_compras >= 5 ? 'Frecuente' : 'Regular',
        riesgo_perdida: c.dias_sin_comprar > 90 ? 'alto' :
                        c.dias_sin_comprar > 60 ? 'medio' : 'bajo'
      }));
      
      return {
        success: true,
        data: clientes,
        meta: {
          total: clientes.length,
          min_compras
        }
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerClientesVIP:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Obtener clientes inactivos (para reactivación)
   */
  obtenerClientesInactivos: async (dias_inactividad = 60) => {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          vr.cliente_id,
          vr.cliente_nombre,
          vr.cliente_telefono,
          COUNT(*) as total_compras_historial,
          SUM(vr.total) as gasto_total_historial,
          MAX(vr.fecha_venta) as ultima_compra,
          DATEDIFF(NOW(), MAX(vr.fecha_venta)) as dias_sin_comprar
        FROM ventas_realizadas vr
        WHERE vr.cliente_id IS NOT NULL
        GROUP BY vr.cliente_id
        HAVING dias_sin_comprar >= ?
        ORDER BY gasto_total_historial DESC
      `, {
        replacements: [dias_inactividad],
        type: sequelize.QueryTypes.SELECT
      });
      
      const clientes = results.map(c => ({
        ...c,
        gasto_total_historial: parseFloat(c.gasto_total_historial).toFixed(2),
        prioridad_reactivacion: c.gasto_total_historial > 500 ? 'alta' :
                                 c.gasto_total_historial > 200 ? 'media' : 'baja'
      }));
      
      return {
        success: true,
        data: clientes,
        meta: {
          dias_inactividad,
          total: clientes.length
        }
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerClientesInactivos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // ==========================================
  // 📦 ANÁLISIS DE PRODUCTOS
  // ==========================================

  /**
   * Obtener productos más vendidos
   */
  obtenerProductosMasVendidos: async (filtros = {}) => {
    try {
      const { limite = 20, categoria_id, periodo = 'mes' } = filtros;
      
      let whereClause = '1=1';
      const replacements = [];
      
      if (periodo === 'hoy') {
        whereClause += ' AND DATE(vri.fecha_registro) = CURDATE()';
      } else if (periodo === 'semana') {
        whereClause += ' AND vri.fecha_registro >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (periodo === 'mes') {
        whereClause += ' AND vri.fecha_registro >= DATE_FORMAT(NOW(), "%Y-%m-01")';
      }
      
      if (categoria_id) {
        whereClause += ' AND vri.categoria_id = ?';
        replacements.push(categoria_id);
      }
      
      replacements.push(limite);
      
      const [results] = await sequelize.query(`
        SELECT 
          vri.producto_id,
          vri.producto_nombre,
          vri.categoria_nombre,
          SUM(vri.cantidad) AS total_vendido,
          COUNT(DISTINCT vri.venta_realizada_id) AS veces_vendido,
          SUM(vri.subtotal) AS ingresos_generados,
          AVG(vri.precio_final) AS precio_promedio,
          SUM(vri.descuento_monto) AS descuentos_aplicados,
          MIN(vri.fecha_registro) as primera_venta,
          MAX(vri.fecha_registro) as ultima_venta
        FROM ventas_realizadas_items vri
        WHERE ${whereClause}
        GROUP BY vri.producto_id
        ORDER BY total_vendido DESC
        LIMIT ?
      `, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });
      
      const productos = results.map(p => ({
        ...p,
        ingresos_generados: parseFloat(p.ingresos_generados).toFixed(2),
        precio_promedio: parseFloat(p.precio_promedio).toFixed(2),
        descuentos_aplicados: parseFloat(p.descuentos_aplicados).toFixed(2)
      }));
      
      return {
        success: true,
        data: productos,
        meta: {
          periodo,
          categoria_id: categoria_id || 'todas',
          total: productos.length
        }
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerProductosMasVendidos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Obtener rendimiento por categoría
   */
  obtenerRendimientoCategorias: async (periodo = 'mes') => {
    try {
      let whereClause = '1=1';
      
      if (periodo === 'hoy') {
        whereClause += ' AND DATE(vri.fecha_registro) = CURDATE()';
      } else if (periodo === 'semana') {
        whereClause += ' AND vri.fecha_registro >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (periodo === 'mes') {
        whereClause += ' AND vri.fecha_registro >= DATE_FORMAT(NOW(), "%Y-%m-01")';
      }
      
      const [results] = await sequelize.query(`
        SELECT 
          vri.categoria_id,
          vri.categoria_nombre,
          COUNT(DISTINCT vri.producto_id) AS productos_vendidos,
          SUM(vri.cantidad) AS unidades_vendidas,
          SUM(vri.subtotal) AS ingresos_totales,
          AVG(vri.precio_final) AS precio_promedio,
          COUNT(DISTINCT vri.venta_realizada_id) AS numero_ventas
        FROM ventas_realizadas_items vri
        WHERE ${whereClause} AND vri.categoria_id IS NOT NULL
        GROUP BY vri.categoria_id
        ORDER BY ingresos_totales DESC
      `, {
        type: sequelize.QueryTypes.SELECT
      });
      
      const categorias = results.map(c => ({
        ...c,
        ingresos_totales: parseFloat(c.ingresos_totales).toFixed(2),
        precio_promedio: parseFloat(c.precio_promedio).toFixed(2)
      }));
      
      return {
        success: true,
        data: categorias,
        meta: {
          periodo,
          total: categorias.length
        }
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerRendimientoCategorias:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // ==========================================
  // 📅 ANÁLISIS TEMPORAL
  // ==========================================

  /**
   * Obtener ventas por día de la semana
   */
  obtenerVentasPorDiaSemana: async (periodo = 'mes') => {
    try {
      let whereClause = '1=1';
      
      if (periodo === 'semana') {
        whereClause += ' AND fecha_venta >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      } else if (periodo === 'mes') {
        whereClause += ' AND fecha_venta >= DATE_FORMAT(NOW(), "%Y-%m-01")';
      }
      
      const [results] = await sequelize.query(`
        SELECT 
          dia_semana,
          CASE dia_semana
            WHEN 1 THEN 'Lunes'
            WHEN 2 THEN 'Martes'
            WHEN 3 THEN 'Miércoles'
            WHEN 4 THEN 'Jueves'
            WHEN 5 THEN 'Viernes'
            WHEN 6 THEN 'Sábado'
            WHEN 7 THEN 'Domingo'
          END as dia_nombre,
          COUNT(*) as total_ventas,
          SUM(total) as ingresos,
          AVG(total) as ticket_promedio,
          SUM(cantidad_items) as items_vendidos
        FROM ventas_realizadas
        WHERE ${whereClause}
        GROUP BY dia_semana
        ORDER BY dia_semana
      `, {
        type: sequelize.QueryTypes.SELECT
      });
      
      const dias = results.map(d => ({
        ...d,
        ingresos: parseFloat(d.ingresos).toFixed(2),
        ticket_promedio: parseFloat(d.ticket_promedio).toFixed(2)
      }));
      
      return {
        success: true,
        data: dias,
        meta: { periodo }
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerVentasPorDiaSemana:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Obtener ventas por hora del día
   */
  obtenerVentasPorHora: async (periodo = 'semana') => {
    try {
      let whereClause = '1=1';
      
      if (periodo === 'hoy') {
        whereClause += ' AND DATE(fecha_venta) = CURDATE()';
      } else if (periodo === 'semana') {
        whereClause += ' AND fecha_venta >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
      }
      
      const [results] = await sequelize.query(`
        SELECT 
          HOUR(hora_venta) as hora,
          COUNT(*) as total_ventas,
          SUM(total) as ingresos,
          AVG(total) as ticket_promedio
        FROM ventas_realizadas
        WHERE ${whereClause}
        GROUP BY hora
        ORDER BY hora
      `, {
        type: sequelize.QueryTypes.SELECT
      });
      
      const horas = results.map(h => ({
        ...h,
        hora_formateada: `${h.hora.toString().padStart(2, '0')}:00`,
        ingresos: parseFloat(h.ingresos).toFixed(2),
        ticket_promedio: parseFloat(h.ticket_promedio).toFixed(2)
      }));
      
      return {
        success: true,
        data: horas,
        meta: { periodo }
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerVentasPorHora:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // ==========================================
  // 📊 REPORTES AVANZADOS
  // ==========================================

  /**
   * Obtener comparativa de periodos
   */
  obtenerComparativaPeriodos: async () => {
    try {
      const [results] = await sequelize.query(`
        SELECT 
          'Hoy' as periodo,
          COUNT(*) as ventas,
          SUM(total) as ingresos
        FROM ventas_realizadas
        WHERE DATE(fecha_venta) = CURDATE()
        
        UNION ALL
        
        SELECT 
          'Ayer' as periodo,
          COUNT(*) as ventas,
          SUM(total) as ingresos
        FROM ventas_realizadas
        WHERE DATE(fecha_venta) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        
        UNION ALL
        
        SELECT 
          'Esta Semana' as periodo,
          COUNT(*) as ventas,
          SUM(total) as ingresos
        FROM ventas_realizadas
        WHERE YEARWEEK(fecha_venta) = YEARWEEK(NOW())
        
        UNION ALL
        
        SELECT 
          'Este Mes' as periodo,
          COUNT(*) as ventas,
          SUM(total) as ingresos
        FROM ventas_realizadas
        WHERE YEAR(fecha_venta) = YEAR(NOW()) 
          AND MONTH(fecha_venta) = MONTH(NOW())
      `, {
        type: sequelize.QueryTypes.SELECT
      });
      
      const comparativa = results.map(r => ({
        ...r,
        ingresos: parseFloat(r.ingresos || 0).toFixed(2)
      }));
      
      return {
        success: true,
        data: comparativa
      };
      
    } catch (error) {
      console.error('❌ Error en obtenerComparativaPeriodos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default AnalyticsService;