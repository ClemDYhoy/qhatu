// C:\qhatu\frontend\src\pages\Vendedor\sections\DashboardOverview\DashboardOverview.jsx
import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../../../hooks/useAnalytics';
import { obtenerVentasPendientes } from '../../../../services/ventasService';
import './DashboardOverview.css';

const DashboardOverview = ({ setActiveSection }) => {
  const {
    loading,
    miRendimiento,
    cargarMiRendimiento
  } = useAnalytics();

  const [ventasPendientes, setVentasPendientes] = useState([]);
  const [loadingVentas, setLoadingVentas] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    // Cargar estadísticas del día
    await cargarMiRendimiento('hoy');
    
    // Cargar ventas pendientes
    setLoadingVentas(true);
    const response = await obtenerVentasPendientes({ estado: 'pendiente', limite: 5 });
    if (response.success) {
      setVentasPendientes(response.data);
    }
    setLoadingVentas(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value || 0);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días!';
    if (hour < 18) return '¡Buenas tardes!';
    return '¡Buenas noches!';
  };

  return (
    <div className="dashboard-overview">
      {/* Header de Bienvenida */}
      <div className="welcome-header">
        <h1 className="welcome-title">{getGreeting()}</h1>
        <p className="welcome-subtitle">
          Aquí está tu resumen de ventas del día
        </p>
      </div>

      {/* Estadísticas Rápidas del Día */}
      {loading ? (
        <div className="loading-stats">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      ) : miRendimiento ? (
        <div className="quick-stats-grid">
          <div className="quick-stat-card ventas-hoy">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Ventas Hoy</span>
              <span className="stat-value">{miRendimiento.total_ventas}</span>
            </div>
          </div>

          <div className="quick-stat-card ingresos-hoy">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Ingresos Hoy</span>
              <span className="stat-value">{formatCurrency(miRendimiento.monto_total)}</span>
            </div>
          </div>

          <div className="quick-stat-card ticket-promedio">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Ticket Promedio</span>
              <span className="stat-value">{formatCurrency(miRendimiento.ticket_promedio)}</span>
            </div>
          </div>

          <div className="quick-stat-card comision-hoy">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Tu Comisión Hoy</span>
              <span className="stat-value highlight">{formatCurrency(miRendimiento.comision)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-stats">
          <p>No hay ventas registradas hoy</p>
        </div>
      )}

      {/* Ventas Pendientes */}
      <div className="pending-sales-section">
        <div className="section-header">
          <h2 className="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Ventas Pendientes de Atención
          </h2>
          {ventasPendientes.length > 0 && (
            <span className="pending-count">{ventasPendientes.length}</span>
          )}
        </div>

        {loadingVentas ? (
          <div className="loading-ventas">
            <div className="spinner-small"></div>
            <p>Cargando ventas pendientes...</p>
          </div>
        ) : ventasPendientes.length > 0 ? (
          <div className="pending-sales-list">
            {ventasPendientes.map((venta) => (
              <div key={venta.venta_id} className="pending-sale-item">
                <div className="sale-header">
                  <span className="sale-number">{venta.numero_venta}</span>
                  <span className="sale-badge new">Nueva</span>
                </div>
                
                <div className="sale-info">
                  <div className="customer-info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>{venta.cliente_nombre}</span>
                  </div>
                  
                  <div className="sale-total">
                    <span className="total-label">Total:</span>
                    <span className="total-amount">{formatCurrency(venta.total)}</span>
                  </div>
                </div>

                <div className="sale-time">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{new Date(venta.fecha_venta).toLocaleString('es-PE')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-pending-sales">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p>No hay ventas pendientes</p>
            <span>¡Todas las ventas están atendidas!</span>
          </div>
        )}
      </div>

      {/* Acciones Rápidas */}
      <div className="quick-actions-section">
        <h2 className="section-title">Acciones Rápidas</h2>
        
        <div className="quick-actions-grid">
          <button className="action-card primary" onClick={() => setActiveSection('ventas-pendientes')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
              </svg>
            </div>
            <div className="action-content">
              <h3>Ver Ventas Pendientes</h3>
              <p>Confirmar y gestionar pedidos</p>
            </div>
          </button>

          <button className="action-card success" onClick={() => setActiveSection('analytics')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="action-content">
              <h3>Ver Estadísticas</h3>
              <p>Análisis de rendimiento</p>
            </div>
          </button>

          <button className="action-card warning" onClick={() => setActiveSection('inventario')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="action-content">
              <h3>Alertas de Inventario</h3>
              <p>Productos por vencer</p>
            </div>
          </button>

          <button className="action-card info" onClick={() => setActiveSection('ia-asistente')}>
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className="action-content">
              <h3>Asistente IA</h3>
              <p>Recomendaciones inteligentes</p>
            </div>
          </button>
        </div>
      </div>

      {/* Consejos del Día */}
      <div className="tips-section">
        <div className="tip-card">
          <div className="tip-icon">💡</div>
          <div className="tip-content">
            <h3>Consejo del día</h3>
            <p>
              Revisa las ventas pendientes regularmente para confirmarlas rápido y 
              mantener contentos a tus clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;