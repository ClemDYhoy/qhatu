// backend/src/services/ml/mlDataService.js

/**
 * 🗄️ SERVICIO DE DATOS PARA MACHINE LEARNING
 * 
 * Maneja todas las consultas a la base de datos para ML.
 * Optimiza queries y cachea resultados automáticamente.
 * 
 * @version 1.0.0
 */

import { Sequelize } from 'sequelize';
import sequelize from '../../config/database.js';
import mlCacheService from './mlCacheService.js';
import mlValidators from './mlValidators.js';

class MLDataService {
  constructor() {
    this.sequelize = sequelize;
  }

  // ====================================
  // 👤 CONSULTAS DE CLIENTES
  // ====================================

  /**
   * Obtener datos completos de un cliente para ML
   */
  async obtenerDatosCliente(usuarioId) {
    try {
      // Validar entrada
      const validUsuarioId = mlValidators.validateUsuarioId(usuarioId);

      // Intentar obtener del caché
      const cacheKey = `cliente_data_${validUsuarioId}`;
      const cached = mlCacheService.get(cacheKey);
      if (cached) return cached;

      // Consultar BD
      const [results] = await this.sequelize.query(`
        SELECT 
          u.usuario_id,
          u.nombre_completo,
          u.email,
          u.telefono,
          COALESCE(mc.total_compras, 0) as totalCompras,
          COALESCE(mc.total_gastado, 0) as gastoTotal,
          COALESCE(mc.ticket_promedio, 0) as ticketPromedio,
          COALESCE(mc.dias_desde_ultima_compra, 999) as diasInactivo,
          COALESCE(mc.frecuencia_compra_dias, 0) as frecuenciaCompra,
          COALESCE(mc.score_fidelidad, 0) as scoreFidelidad,
          mc.ultima_compra,
          mc.primera_compra,
          mc.cliente_vip,
          mc.segmento
        FROM usuarios u
        LEFT JOIN metricas_clientes mc ON u.usuario_id = mc.cliente_id
        WHERE u.usuario_id = ?
        LIMIT 1
      `, {
        replacements: [validUsuarioId],
        type: Sequelize.QueryTypes.SELECT
      });

      const clienteData = results || null;

      // Guardar en caché (5 minutos)
      if (clienteData) {
        mlCacheService.set(cacheKey, clienteData, 5 * 60 * 1000);
      }

      return clienteData;

    } catch (error) {
      console.error('❌ Error obteniendo datos cliente:', error);
      throw new Error(`Error al obtener datos del cliente: ${error.message}`);
    }
  }

  /**
   * Obtener datos de TODOS los clientes para clustering
   */
  async obtenerTodosClientes() {
    try {
      // Intentar obtener del caché
      const cacheKey = 'todos_clientes_ml';
      const cached = mlCacheService.get(cacheKey);
      if (cached) return cached;

      // Consultar BD
      const [results] = await this.sequelize.query(`
        SELECT 
          mc.cliente_id as usuario_id,
          COALESCE(mc.total_compras, 0) as totalCompras,
          COALESCE(mc.total_gastado, 0) as gastoTotal,
          COALESCE(mc.dias_desde_ultima_compra, 999) as diasInactivo,
          COALESCE(mc.ticket_promedio, 0) as ticketPromedio,
          COALESCE(mc.frecuencia_compra_dias, 0) as frecuenciaCompra
        FROM metricas_clientes mc
        WHERE mc.total_compras > 0
        ORDER BY mc.total_gastado DESC
        LIMIT 1000
      `, {
        type: Sequelize.QueryTypes.SELECT
      });

      const clientes = results || [];

      // Guardar en caché (10 minutos)
      mlCacheService.set(cacheKey, clientes, 10 * 60 * 1000);

      return clientes;

    } catch (error) {
      console.error('❌ Error obteniendo todos los clientes:', error);
      throw new Error(`Error al obtener clientes: ${error.message}`);
    }
  }

  /**
   * Obtener historial de compras de un cliente
   */
  async obtenerHistorialCliente(usuarioId) {
    try {
      const validUsuarioId = mlValidators.validateUsuarioId(usuarioId);

      // Intentar obtener del caché
      const cacheKey = `historial_${validUsuarioId}`;
      const cached = mlCacheService.get(cacheKey);
      if (cached) return cached;

      // Consultar BD
      const [results] = await this.sequelize.query(`
        SELECT 
          COUNT(*) as totalVentas,
          SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as ventasConfirmadas,
          SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as ventasCanceladas,
          AVG(CASE WHEN estado = 'confirmada' THEN 1.0 ELSE 0.0 END) as tasaConfirmacion,
          AVG(
            CASE 
              WHEN estado = 'confirmada' AND fecha_confirmacion IS NOT NULL 
              THEN TIMESTAMPDIFF(MINUTE, fecha_venta, fecha_confirmacion)
              ELSE NULL 
            END
          ) as tiempoPromedioConfirmacion,
          AVG(total) as ticketPromedio,
          SUM(total) as gastoTotal,
          MAX(fecha_venta) as ultimaCompra,
          MIN(fecha_venta) as primeraCompra
        FROM ventas
        WHERE usuario_id = ?
        AND estado IN ('confirmada', 'cancelada', 'entregada')
      `, {
        replacements: [validUsuarioId],
        type: Sequelize.QueryTypes.SELECT
      });

      const historial = results[0] || {
        totalVentas: 0,
        ventasConfirmadas: 0,
        ventasCanceladas: 0,
        tasaConfirmacion: 0,
        tiempoPromedioConfirmacion: 0,
        ticketPromedio: 0,
        gastoTotal: 0,
        ultimaCompra: null,
        primeraCompra: null
      };

      // Guardar en caché (5 minutos)
      mlCacheService.set(cacheKey, historial, 5 * 60 * 1000);

      return historial;

    } catch (error) {
      console.error('❌ Error obteniendo historial cliente:', error);
      throw new Error(`Error al obtener historial: ${error.message}`);
    }
  }

  // ====================================
  // 🛍️ CONSULTAS DE PRODUCTOS
  // ====================================

  /**
   * Obtener productos de una venta
   */
  async obtenerProductosVenta(ventaId) {
    try {
      const validVentaId = mlValidators.validateVentaId(ventaId);

      // Intentar obtener del caché
      const cacheKey = `productos_venta_${validVentaId}`;
      const cached = mlCacheService.get(cacheKey);
      if (cached) return cached;

      // Consultar BD
      const [results] = await this.sequelize.query(`
        SELECT 
          vi.item_id,
          vi.producto_id,
          vi.producto_nombre,
          vi.cantidad,
          vi.precio_unitario,
          vi.precio_descuento,
          vi.subtotal,
          p.categoria_id,
          p.precio,
          p.ventas,
          p.destacado,
          p.url_imagen,
          c.nombre as categoria_nombre
        FROM venta_items vi
        LEFT JOIN productos p ON vi.producto_id = p.producto_id
        LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
        WHERE vi.venta_id = ?
        ORDER BY vi.subtotal DESC
      `, {
        replacements: [validVentaId],
        type: Sequelize.QueryTypes.SELECT
      });

      const productos = results || [];

      // Guardar en caché (10 minutos)
      if (productos.length > 0) {
        mlCacheService.set(cacheKey, productos, 10 * 60 * 1000);
      }

      return productos;

    } catch (error) {
      console.error('❌ Error obteniendo productos venta:', error);
      throw new Error(`Error al obtener productos de venta: ${error.message}`);
    }
  }

  /**
   * Obtener TODOS los productos del catálogo
   */
  async obtenerTodosProductos() {
    try {
      // Intentar obtener del caché
      const cacheKey = 'todos_productos_ml';
      const cached = mlCacheService.get(cacheKey);
      if (cached) return cached;

      // Consultar BD
      const [results] = await this.sequelize.query(`
        SELECT 
          p.producto_id,
          p.nombre as producto_nombre,
          p.categoria_id,
          p.precio,
          p.precio_descuento,
          COALESCE(p.ventas, 0) as ventas,
          COALESCE(p.destacado, 0) as destacado,
          p.url_imagen,
          c.nombre as categoria_nombre,
          p.stock
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
        WHERE p.stock > 0
        ORDER BY p.ventas DESC, p.destacado DESC
        LIMIT 500
      `, {
        type: Sequelize.QueryTypes.SELECT
      });

      const productos = results || [];

      // Guardar en caché (10 minutos)
      mlCacheService.set(cacheKey, productos, 10 * 60 * 1000);

      return productos;

    } catch (error) {
      console.error('❌ Error obteniendo todos los productos:', error);
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  /**
   * Obtener valores máximos para normalización
   */
  async obtenerMaximosProductos() {
    try {
      // Intentar obtener del caché
      const cacheKey = 'maximos_productos';
      const cached = mlCacheService.get(cacheKey);
      if (cached) return cached;

      // Consultar BD
      const [results] = await this.sequelize.query(`
        SELECT 
          MAX(precio) as maxPrecio,
          MAX(COALESCE(ventas, 0)) as maxVentas,
          AVG(precio) as avgPrecio,
          AVG(COALESCE(ventas, 0)) as avgVentas
        FROM productos
        WHERE stock > 0
      `, {
        type: Sequelize.QueryTypes.SELECT
      });

      const maximos = results[0] || {
        maxPrecio: 1000,
        maxVentas: 1000,
        avgPrecio: 10,
        avgVentas: 10
      };

      // Guardar en caché (15 minutos)
      mlCacheService.set(cacheKey, maximos, 15 * 60 * 1000);

      return maximos;

    } catch (error) {
      console.error('❌ Error obteniendo máximos productos:', error);
      // Retornar valores por defecto
      return {
        maxPrecio: 1000,
        maxVentas: 1000,
        avgPrecio: 10,
        avgVentas: 10
      };
    }
  }

  /**
   * Obtener productos similares por categoría
   */
  async obtenerProductosSimilaresPorCategoria(categoriaId, excludeProductIds = []) {
    try {
      const validCategoriaId = mlValidators.validateInteger(categoriaId, 'categoriaId');

      // Construir exclusión de productos
      const excludeClause = excludeProductIds.length > 0
        ? `AND p.producto_id NOT IN (${excludeProductIds.join(',')})`
        : '';

      // Consultar BD
      const [results] = await this.sequelize.query(`
        SELECT 
          p.producto_id,
          p.nombre as producto_nombre,
          p.categoria_id,
          p.precio,
          p.precio_descuento,
          COALESCE(p.ventas, 0) as ventas,
          COALESCE(p.destacado, 0) as destacado,
          p.url_imagen,
          c.nombre as categoria_nombre
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
        WHERE p.categoria_id = ?
        AND p.stock > 0
        ${excludeClause}
        ORDER BY p.destacado DESC, p.ventas DESC
        LIMIT 10
      `, {
        replacements: [validCategoriaId],
        type: Sequelize.QueryTypes.SELECT
      });

      return results || [];

    } catch (error) {
      console.error('❌ Error obteniendo productos similares:', error);
      return [];
    }
  }

  // ====================================
  // 📊 CONSULTAS DE VENTAS
  // ====================================

  /**
   * Obtener detalle completo de una venta
   */
  async obtenerDetalleVenta(ventaId) {
    try {
      const validVentaId = mlValidators.validateVentaId(ventaId);

      // Consultar BD
      const [results] = await this.sequelize.query(`
        SELECT 
          v.venta_id,
          v.numero_venta,
          v.usuario_id,
          v.vendedor_id,
          v.cliente_nombre,
          v.cliente_email,
          v.cliente_telefono,
          v.cliente_direccion,
          v.cliente_distrito,
          v.subtotal,
          v.descuento_total,
          v.total,
          v.estado,
          v.metodo_pago,
          v.fecha_venta,
          v.fecha_confirmacion,
          v.notas_venta,
          v.cliente_notas,
          u.nombre_completo as vendedor_nombre
        FROM ventas v
        LEFT JOIN usuarios u ON v.vendedor_id = u.usuario_id
        WHERE v.venta_id = ?
        LIMIT 1
      `, {
        replacements: [validVentaId],
        type: Sequelize.QueryTypes.SELECT
      });

      const venta = results[0] || null;

      if (venta) {
        // Obtener items de la venta
        venta.items = await this.obtenerProductosVenta(validVentaId);
      }

      return venta;

    } catch (error) {
      console.error('❌ Error obteniendo detalle venta:', error);
      throw new Error(`Error al obtener detalle de venta: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de ventas por segmento
   */
  async obtenerEstadisticasPorSegmento() {
    try {
      // Intentar obtener del caché
      const cacheKey = 'estadisticas_segmento';
      const cached = mlCacheService.get(cacheKey);
      if (cached) return cached;

      // Consultar BD
      const [results] = await this.sequelize.query(`
        SELECT 
          mc.segmento,
          COUNT(DISTINCT mc.cliente_id) as totalClientes,
          AVG(mc.total_compras) as promedioCompras,
          AVG(mc.total_gastado) as promedioGasto,
          AVG(mc.ticket_promedio) as promedioTicket,
          SUM(mc.total_gastado) as gastoTotal
        FROM metricas_clientes mc
        WHERE mc.total_compras > 0
        GROUP BY mc.segmento
        ORDER BY 
          CASE mc.segmento
            WHEN 'vip' THEN 1
            WHEN 'frecuente' THEN 2
            WHEN 'regular' THEN 3
            WHEN 'ocasional' THEN 4
            ELSE 5
          END
      `, {
        type: Sequelize.QueryTypes.SELECT
      });

      const estadisticas = results || [];

      // Guardar en caché (15 minutos)
      mlCacheService.set(cacheKey, estadisticas, 15 * 60 * 1000);

      return estadisticas;

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas por segmento:', error);
      return [];
    }
  }

  // ====================================
  // 🔢 CONSULTAS DE AGREGACIÓN
  // ====================================

  /**
   * Calcular percentiles para K-Means
   */
  async calcularPercentiles() {
    try {
      // Intentar obtener del caché
      const cacheKey = 'percentiles_kmeans';
      const cached = mlCacheService.get(cacheKey);
      if (cached) return cached;

      // Consultar BD
      const [results] = await this.sequelize.query(`
        SELECT 
          -- Percentil 25
          (SELECT total_compras FROM metricas_clientes 
           WHERE total_compras > 0 
           ORDER BY total_compras 
           LIMIT 1 OFFSET (SELECT FLOOR(COUNT(*) * 0.25) FROM metricas_clientes WHERE total_compras > 0)
          ) as p25_compras,
          
          -- Percentil 50 (mediana)
          (SELECT total_compras FROM metricas_clientes 
           WHERE total_compras > 0 
           ORDER BY total_compras 
           LIMIT 1 OFFSET (SELECT FLOOR(COUNT(*) * 0.50) FROM metricas_clientes WHERE total_compras > 0)
          ) as p50_compras,
          
          -- Percentil 75
          (SELECT total_compras FROM metricas_clientes 
           WHERE total_compras > 0 
           ORDER BY total_compras 
           LIMIT 1 OFFSET (SELECT FLOOR(COUNT(*) * 0.75) FROM metricas_clientes WHERE total_compras > 0)
          ) as p75_compras,
          
          -- Lo mismo para gastos
          (SELECT total_gastado FROM metricas_clientes 
           WHERE total_compras > 0 
           ORDER BY total_gastado 
           LIMIT 1 OFFSET (SELECT FLOOR(COUNT(*) * 0.25) FROM metricas_clientes WHERE total_compras > 0)
          ) as p25_gastos,
          
          (SELECT total_gastado FROM metricas_clientes 
           WHERE total_compras > 0 
           ORDER BY total_gastado 
           LIMIT 1 OFFSET (SELECT FLOOR(COUNT(*) * 0.50) FROM metricas_clientes WHERE total_compras > 0)
          ) as p50_gastos,
          
          (SELECT total_gastado FROM metricas_clientes 
           WHERE total_compras > 0 
           ORDER BY total_gastado 
           LIMIT 1 OFFSET (SELECT FLOOR(COUNT(*) * 0.75) FROM metricas_clientes WHERE total_compras > 0)
          ) as p75_gastos
      `, {
        type: Sequelize.QueryTypes.SELECT
      });

      const percentiles = results[0] || {
        p25_compras: 2,
        p50_compras: 5,
        p75_compras: 10,
        p25_gastos: 50,
        p50_gastos: 150,
        p75_gastos: 500
      };

      // Guardar en caché (30 minutos)
      mlCacheService.set(cacheKey, percentiles, 30 * 60 * 1000);

      return percentiles;

    } catch (error) {
      console.error('❌ Error calculando percentiles:', error);
      // Retornar valores por defecto
      return {
        p25_compras: 2,
        p50_compras: 5,
        p75_compras: 10,
        p25_gastos: 50,
        p50_gastos: 150,
        p75_gastos: 500
      };
    }
  }

  /**
   * Obtener productos frecuentemente comprados juntos
   */
  async obtenerProductosCompradosJuntos(productoId, limit = 5) {
    try {
      const validProductoId = mlValidators.validateProductoId(productoId);

      // Consultar BD
      const [results] = await this.sequelize.query(`
        SELECT 
          vi2.producto_id,
          vi2.producto_nombre,
          p.precio,
          p.categoria_id,
          c.nombre as categoria_nombre,
          COUNT(*) as frecuencia
        FROM venta_items vi1
        JOIN venta_items vi2 ON vi1.venta_id = vi2.venta_id
        LEFT JOIN productos p ON vi2.producto_id = p.producto_id
        LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
        WHERE vi1.producto_id = ?
        AND vi2.producto_id != ?
        AND p.stock > 0
        GROUP BY vi2.producto_id
        ORDER BY frecuencia DESC
        LIMIT ?
      `, {
        replacements: [validProductoId, validProductoId, limit],
        type: Sequelize.QueryTypes.SELECT
      });

      return results || [];

    } catch (error) {
      console.error('❌ Error obteniendo productos comprados juntos:', error);
      return [];
    }
  }

  // ====================================
  // 🔧 UTILIDADES
  // ====================================

  /**
   * Verificar salud de la conexión a BD
   */
  async healthCheck() {
    try {
      await this.sequelize.authenticate();
      
      // Test query
      const [result] = await this.sequelize.query('SELECT 1 as test');
      
      return {
        status: 'healthy',
        connected: true,
        testQuery: result[0].test === 1,
        database: this.sequelize.config.database,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Limpiar caché relacionado con un usuario
   */
  invalidarCacheUsuario(usuarioId) {
    return mlCacheService.invalidateUser(usuarioId);
  }

  /**
   * Limpiar caché relacionado con una venta
   */
  invalidarCacheVenta(ventaId) {
    return mlCacheService.invalidateVenta(ventaId);
  }

  /**
   * Ejecutar query personalizado (para testing)
   */
  async executeCustomQuery(query, replacements = []) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Custom queries no permitidos en producción');
    }

    try {
      const [results] = await this.sequelize.query(query, {
        replacements,
        type: Sequelize.QueryTypes.SELECT
      });

      return results;
    } catch (error) {
      console.error('❌ Error ejecutando query personalizado:', error);
      throw error;
    }
  }
}

// ====================================
// 📤 EXPORTAR SINGLETON
// ====================================

const mlDataService = new MLDataService();
export default mlDataService;