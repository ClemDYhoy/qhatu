// C:\qhatu\frontend\src\hooks\useAnalytics.js
import { useState, useEffect, useCallback } from 'react';
import analyticsService from '../services/analyticsService';

/**
 * 📊 Hook personalizado para Analytics
 * 
 * Maneja estados de carga, errores y refresco automático
 * de datos de analytics.
 */

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // 📈 KPIs
  // ==========================================

  const [kpis, setKpis] = useState(null);

  const cargarKPIs = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await analyticsService.obtenerKPIs(filtros);
      
      if (resultado.success) {
        setKpis(resultado.data);
        return resultado.data;
      } else {
        throw new Error(resultado.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error cargando KPIs:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // 👤 MI RENDIMIENTO (VENDEDOR)
  // ==========================================

  const [miRendimiento, setMiRendimiento] = useState(null);

  const cargarMiRendimiento = useCallback(async (periodo = 'mes') => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await analyticsService.obtenerMiRendimiento(periodo);
      
      if (resultado.success) {
        setMiRendimiento(resultado.data);
        return resultado.data;
      } else {
        throw new Error(resultado.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error cargando mi rendimiento:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // 👥 CLIENTES
  // ==========================================

  const [clientesVIP, setClientesVIP] = useState([]);
  const [clientesInactivos, setClientesInactivos] = useState([]);

  const cargarClientesVIP = useCallback(async (limite = 20, min_compras = 3) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await analyticsService.obtenerClientesVIP(limite, min_compras);
      
      if (resultado.success) {
        setClientesVIP(resultado.data);
        return resultado.data;
      } else {
        throw new Error(resultado.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error cargando clientes VIP:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarClientesInactivos = useCallback(async (dias = 60) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await analyticsService.obtenerClientesInactivos(dias);
      
      if (resultado.success) {
        setClientesInactivos(resultado.data);
        return resultado.data;
      } else {
        throw new Error(resultado.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error cargando clientes inactivos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // 📦 PRODUCTOS
  // ==========================================

  const [productosMasVendidos, setProductosMasVendidos] = useState([]);

  const cargarProductosMasVendidos = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await analyticsService.obtenerProductosMasVendidos(filtros);
      
      if (resultado.success) {
        setProductosMasVendidos(resultado.data);
        return resultado.data;
      } else {
        throw new Error(resultado.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error cargando productos más vendidos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // 📊 DASHBOARDS
  // ==========================================

  const [dashboardVendedor, setDashboardVendedor] = useState(null);

  const cargarDashboardVendedor = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const resultado = await analyticsService.obtenerDashboardVendedor();
      
      if (resultado.success) {
        setDashboardVendedor(resultado.data);
        return resultado.data;
      } else {
        throw new Error(resultado.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error cargando dashboard vendedor:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // 🔄 REFRESCO AUTOMÁTICO
  // ==========================================

  const refrescar = useCallback(async (tipo = 'miRendimiento', ...args) => {
    switch (tipo) {
      case 'kpis':
        return await cargarKPIs(...args);
      case 'miRendimiento':
        return await cargarMiRendimiento(...args);
      case 'clientesVIP':
        return await cargarClientesVIP(...args);
      case 'clientesInactivos':
        return await cargarClientesInactivos(...args);
      case 'productosMasVendidos':
        return await cargarProductosMasVendidos(...args);
      case 'dashboardVendedor':
        return await cargarDashboardVendedor();
      default:
        console.warn(`Tipo de refresco no reconocido: ${tipo}`);
        return null;
    }
  }, [
    cargarKPIs,
    cargarMiRendimiento,
    cargarClientesVIP,
    cargarClientesInactivos,
    cargarProductosMasVendidos,
    cargarDashboardVendedor
  ]);

  return {
    // Estados
    loading,
    error,
    
    // Datos
    kpis,
    miRendimiento,
    clientesVIP,
    clientesInactivos,
    productosMasVendidos,
    dashboardVendedor,
    
    // Funciones de carga
    cargarKPIs,
    cargarMiRendimiento,
    cargarClientesVIP,
    cargarClientesInactivos,
    cargarProductosMasVendidos,
    cargarDashboardVendedor,
    
    // Utilidades
    refrescar,
    limpiarError: () => setError(null)
  };
};

/**
 * 📊 Hook para auto-refresco de analytics
 * 
 * Actualiza automáticamente los datos cada X segundos
 */
export const useAnalyticsAutoRefresh = (funcion, intervalo = 60000, dependencias = []) => {
  useEffect(() => {
    // Cargar inmediatamente
    funcion();
    
    // Configurar intervalo
    const interval = setInterval(() => {
      funcion();
    }, intervalo);
    
    // Limpiar al desmontar
    return () => clearInterval(interval);
  }, [funcion, intervalo, ...dependencias]);
};

export default useAnalytics;