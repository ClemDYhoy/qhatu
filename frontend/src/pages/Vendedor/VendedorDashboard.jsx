// C:\qhatu\frontend\src\pages\Vendedor\VendedorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/api';

import Sidebar from './sections/Sidebar';
import NavBar from './sections/NavBar';
import SalesPending from './sections/SalesPending/SalesPending';
import Historial from './sections/Historial/Historial';
import InventarioAlertas from './sections/InventarioAlertas/InventarioAlertas';
import IAAsistente from './sections/IAAsistente/IAAsistente';

import './VendedorDashboard.css';

const VendedorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('inicio'); // ← Nueva sección inicio

  const [stats, setStats] = useState({
    carritosHoy: 0,
    ventasHoy: 0,
    totalVentas: 0,
    comision: 0,
  });

  // Verificación de autenticación y rol
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return navigate('/login');
    if (currentUser.rol_nombre !== 'vendedor') return navigate('/');

    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  // Cargar estadísticas con refresco automático
  const loadStats = async () => {
    try {
      const response = await api.get('/analytics/vendedor-stats');
      setStats(response.data || stats);
    } catch (error) {
      console.error('Error cargando stats:', error);
      // No rompemos la UI si falla
    }
  };

  useEffect(() => {
    if (user) {
      loadStats();
      const interval = setInterval(loadStats, 120000); // Cada 2 minutos
      return () => clearInterval(interval);
    }
  }, [user]);

  // Componente de Inicio (overview)
  const DashboardOverview = () => (
    <div className="dashboard-overview">
      <h1 className="overview-title">
        ¡Hola, {user?.nombre?.split(' ')[0] || 'Vendedor'}! 👋
      </h1>
      <p className="overview-subtitle">Resumen de tu día</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div>
            <p className="stat-label">Carritos Hoy</p>
            <p className="stat-value">{stats.carritosHoy}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div>
            <p className="stat-label">Ventas del Día</p>
            <p className="stat-value">{stats.ventasHoy}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div>
            <p className="stat-label">Total Ventas Mes</p>
            <p className="stat-value">S/ {stats.totalVentas.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div>
            <p className="stat-label">Comisión Acumulada</p>
            <p className="stat-value">S/ {stats.comision.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Acciones rápidas</h2>
        <div className="actions-grid">
          <button
            onClick={() => setActiveSection('ventas-pendientes')}
            className="action-btn primary"
          >
            <span>📦</span> Ver Ventas Pendientes
          </button>
          <button
            onClick={() => setActiveSection('ia-asistente')}
            className="action-btn secondary"
          >
            <span>🤖</span> Asistente IA
          </button>
          <button
            onClick={() => setActiveSection('inventario')}
            className="action-btn"
          >
            <span>⚠️</span> Alertas Inventario
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return <DashboardOverview />;
      case 'ventas-pendientes':
        return <SalesPending loadStats={loadStats} />; // ← Para refrescar al confirmar venta
      case 'historial':
        return <Historial />;
      case 'inventario':
        return <InventarioAlertas />;
      case 'ia-asistente':
        return <IAAsistente />;
      default:
        return <DashboardOverview />;
    }
  };

  if (loading) {
    return (
      <div className="vendedor-loading">
        <div className="spinner"></div>
        <p>Cargando tu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="vendedor-dashboard-container">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
      />

      <div className="vendedor-main-content">
        <NavBar user={user} stats={stats} />

        <main className="vendedor-content-area">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default VendedorDashboard;