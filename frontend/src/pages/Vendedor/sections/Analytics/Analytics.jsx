// C:\qhatu\frontend\src\pages\Vendedor\sections\Analytics\Analytics.jsx

import React, { useState, useEffect } from 'react';
import { useAnalytics, useAnalyticsAutoRefresh } from '../../../../hooks/useAnalytics';
import './Analytics.css';

// Icons SVG
const Icons = {
  TrendingUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  DollarSign: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  ShoppingBag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Package: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  RefreshCw: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Award: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  )
};

const Analytics = () => {
  const {
    loading,
    error,
    miRendimiento,
    productosMasVendidos,
    cargarMiRendimiento,
    cargarProductosMasVendidos,
    limpiarError
  } = useAnalytics();

  const [periodo, setPeriodo] = useState('mes');
  const [refrescando, setRefrescando] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, [periodo]);

  // Auto-refresh cada 2 minutos
  useAnalyticsAutoRefresh(() => {
    cargarDatos(true);
  }, 120000, [periodo]);

  const cargarDatos = async (silencioso = false) => {
    if (!silencioso) setRefrescando(true);
    
    await Promise.all([
      cargarMiRendimiento(periodo),
      cargarProductosMasVendidos({ periodo, limite: 5 })
    ]);
    
    setRefrescando(false);
  };

  const handleRefresh = () => {
    cargarDatos();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value || 0);
  };

  return (
    <div className="analytics-section">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <h2 className="analytics-title">
            <span className="title-icon">{Icons.TrendingUp}</span>
            Mis Estadísticas
          </h2>
          <p className="analytics-subtitle">
            Rendimiento y métricas de ventas
          </p>
        </div>

        <div className="header-right">
          {/* Selector de periodo */}
          <select 
            className="periodo-select"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            disabled={loading}
          >
            <option value="hoy">Hoy</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mes</option>
            <option value="anio">Este Año</option>
          </select>

          {/* Botón de refresco */}
          <button
            className={`btn-refresh ${refrescando ? 'spinning' : ''}`}
            onClick={handleRefresh}
            disabled={loading || refrescando}
            title="Actualizar datos"
          >
            {Icons.RefreshCw}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="analytics-alert error">
          <p>{error}</p>
          <button onClick={limpiarError} className="alert-close">✕</button>
        </div>
      )}

      {/* Loading State */}
      {loading && !miRendimiento && (
        <div className="analytics-loading">
          <div className="spinner-large"></div>
          <p>Cargando estadísticas...</p>
        </div>
      )}

      {/* Métricas principales */}
      {miRendimiento && (
        <>
          <div className="stats-grid">
            {/* Total Ventas */}
            <div className="stat-card ventas">
              <div className="stat-icon">{Icons.ShoppingBag}</div>
              <div className="stat-content">
                <span className="stat-label">Total Ventas</span>
                <span className="stat-value">{miRendimiento.total_ventas}</span>
                <span className="stat-period">{periodo}</span>
              </div>
            </div>

            {/* Monto Total */}
            <div className="stat-card ingresos">
              <div className="stat-icon">{Icons.DollarSign}</div>
              <div className="stat-content">
                <span className="stat-label">Ingresos Totales</span>
                <span className="stat-value">{formatCurrency(miRendimiento.monto_total)}</span>
                <span className="stat-period">{periodo}</span>
              </div>
            </div>

            {/* Ticket Promedio */}
            <div className="stat-card ticket">
              <div className="stat-icon">{Icons.TrendingUp}</div>
              <div className="stat-content">
                <span className="stat-label">Ticket Promedio</span>
                <span className="stat-value">{formatCurrency(miRendimiento.ticket_promedio)}</span>
                <span className="stat-detail">
                  {miRendimiento.items_vendidos} items vendidos
                </span>
              </div>
            </div>

            {/* Clientes Únicos */}
            <div className="stat-card clientes">
              <div className="stat-icon">{Icons.Users}</div>
              <div className="stat-content">
                <span className="stat-label">Clientes Únicos</span>
                <span className="stat-value">{miRendimiento.clientes_unicos}</span>
                <span className="stat-detail">atendidos</span>
              </div>
            </div>

            {/* Comisión */}
            <div className="stat-card comision">
              <div className="stat-icon">{Icons.Award}</div>
              <div className="stat-content">
                <span className="stat-label">Tu Comisión (5%)</span>
                <span className="stat-value highlight">{formatCurrency(miRendimiento.comision)}</span>
                <span className="stat-detail">ganancia estimada</span>
              </div>
            </div>

            {/* Items Vendidos */}
            <div className="stat-card items">
              <div className="stat-icon">{Icons.Package}</div>
              <div className="stat-content">
                <span className="stat-label">Items Vendidos</span>
                <span className="stat-value">{miRendimiento.items_vendidos}</span>
                <span className="stat-detail">productos</span>
              </div>
            </div>
          </div>

          {/* Top Productos Vendidos */}
          {productosMasVendidos && productosMasVendidos.length > 0 && (
            <div className="top-products-section">
              <h3 className="section-title">
                <span className="title-icon">{Icons.TrendingUp}</span>
                Top 5 Productos Más Vendidos
              </h3>

              <div className="products-list">
                {productosMasVendidos.map((producto, index) => (
                  <div key={producto.producto_id} className="product-item">
                    <div className="product-rank">#{index + 1}</div>
                    
                    <div className="product-info">
                      <h4 className="product-name">{producto.producto_nombre}</h4>
                      <span className="product-category">{producto.categoria_nombre}</span>
                    </div>

                    <div className="product-stats">
                      <div className="stat">
                        <span className="stat-label">Vendidos:</span>
                        <span className="stat-value">{producto.total_vendido}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Ingresos:</span>
                        <span className="stat-value">{formatCurrency(producto.ingresos_generados)}</span>
                      </div>
                    </div>

                    <div className="product-badge">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !miRendimiento && !error && (
        <div className="analytics-empty">
          <div className="empty-icon">{Icons.TrendingUp}</div>
          <h3>No hay datos disponibles</h3>
          <p>Aún no tienes ventas registradas en este periodo</p>
        </div>
      )}
    </div>
  );
};

export default Analytics;