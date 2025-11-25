// C:\qhatu\frontend\src\pages\Vendedor\sections\SalesPending\SalesPending.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { obtenerVentasPendientes } from '../../../../services/ventasService';
import SaleCard from './components/SaleCard';
import './SalesPending.css';

const SalesPending = ({ loadStats }) => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [refrescando, setRefrescando] = useState(false);

  // Cargar ventas pendientes
  const cargarVentas = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    setError(null);

    try {
      const filtros = {};
      
      // Filtrar por estado
      if (filtroEstado !== 'todas') {
        filtros.estado = filtroEstado;
      }

      const response = await obtenerVentasPendientes(filtros);

      if (response.success) {
        setVentas(response.data || []);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      console.error('Error cargando ventas:', err);
      setError(err.message || 'Error al cargar ventas');
    } finally {
      setLoading(false);
      setRefrescando(false);
    }
  }, [filtroEstado]);

  // Cargar al montar y cuando cambie el filtro
  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      cargarVentas(true); // Silencioso
    }, 30000);

    return () => clearInterval(interval);
  }, [cargarVentas]);

  // Manejar confirmación de venta
  const handleVentaConfirmada = async () => {
    console.log('✅ Venta confirmada, actualizando lista...');
    
    // Recargar ventas
    await cargarVentas();
    
    // Actualizar estadísticas del dashboard principal
    if (loadStats && typeof loadStats === 'function') {
      await loadStats();
    }
  };

  // Refrescar manualmente
  const handleRefresh = () => {
    setRefrescando(true);
    cargarVentas();
  };

  // Filtrar ventas
  const ventasFiltradas = ventas.filter(venta => {
    if (filtroEstado === 'todas') return true;
    return venta.estado === filtroEstado;
  });

  // Contar por estado
  const contarPorEstado = (estado) => {
    return ventas.filter(v => v.estado === estado).length;
  };

  return (
    <div className="sales-pending-container">
      {/* Header */}
      <div className="sales-header">
        <div className="header-left">
          <h2 className="sales-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Ventas Pendientes
          </h2>
          <p className="sales-subtitle">
            {ventasFiltradas.length} {ventasFiltradas.length === 1 ? 'venta' : 'ventas'}
          </p>
        </div>

        <div className="header-right">
          <button
            className={`btn-refresh ${refrescando ? 'spinning' : ''}`}
            onClick={handleRefresh}
            disabled={loading || refrescando}
            title="Actualizar ventas"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filtroEstado === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('todas')}
          >
            Todas
            <span className="tab-count">{ventas.length}</span>
          </button>

          <button
            className={`filter-tab ${filtroEstado === 'pendiente' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('pendiente')}
          >
            Pendientes
            <span className="tab-count pending">{contarPorEstado('pendiente')}</span>
          </button>

          <button
            className={`filter-tab ${filtroEstado === 'confirmada' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('confirmada')}
          >
            Confirmadas
            <span className="tab-count confirmed">{contarPorEstado('confirmada')}</span>
          </button>

          <button
            className={`filter-tab ${filtroEstado === 'procesando' ? 'active' : ''}`}
            onClick={() => setFiltroEstado('procesando')}
          >
            Procesando
            <span className="tab-count processing">{contarPorEstado('procesando')}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{error}</p>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Loading State */}
      {loading && ventas.length === 0 && (
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Cargando ventas pendientes...</p>
        </div>
      )}

      {/* Lista de Ventas */}
      {!loading && ventasFiltradas.length > 0 && (
        <div className="sales-grid">
          {ventasFiltradas.map((venta) => (
            <SaleCard
              key={venta.venta_id}
              venta={venta}
              onConfirm={handleVentaConfirmada}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && ventasFiltradas.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <h3>No hay ventas {filtroEstado !== 'todas' ? filtroEstado + 's' : ''}</h3>
          <p>
            {filtroEstado === 'pendiente' 
              ? '¡Genial! Todas las ventas están confirmadas'
              : 'No hay ventas en este estado'}
          </p>
        </div>
      )}

      {/* Stats Footer */}
      {ventas.length > 0 && (
        <div className="sales-footer">
          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-label">Total Ventas:</span>
              <span className="stat-value">{ventas.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pendientes:</span>
              <span className="stat-value pending">{contarPorEstado('pendiente')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Confirmadas:</span>
              <span className="stat-value confirmed">{contarPorEstado('confirmada')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPending;