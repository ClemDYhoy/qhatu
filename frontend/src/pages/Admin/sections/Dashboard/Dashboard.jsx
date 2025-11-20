// sections/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import StatsGrid from './components/StatsGrid';
import SalesChart from './components/SalesChart';
import QuickAlerts from './components/QuickAlerts';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVentas: 0,
    totalProductos: 0,
    stockCritico: 0,
    usuariosActivos: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Llamar a API para obtener estadísticas
      // const response = await adminApi.getStats();
      
      // Datos simulados por ahora
      setStats({
        totalVentas: 1250.50,
        totalProductos: 245,
        stockCritico: 12,
        usuariosActivos: 128
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      {/* Header */}
      <div className="section-header">
        <h1>📊 Dashboard General</h1>
        <button className="refresh-btn" onClick={loadDashboardData}>
          🔄 Actualizar
        </button>
      </div>

      {/* Grid de estadísticas */}
      <StatsGrid stats={stats} />

      {/* Gráfico de ventas */}
      <div className="dashboard-row">
        <SalesChart />
      </div>

      {/* Alertas rápidas */}
      <div className="dashboard-row">
        <QuickAlerts />
      </div>
    </div>
  );
};

export default Dashboard;

/* 
CSS ESPECIFICACIONES (Dashboard.css):
- .dashboard-section: padding 30px
- .section-header: display flex, justify-content space-between, align-items center, margin-bottom 30px
- .section-header h1: margin 0, font-size 28px, color #2c3e50
- .refresh-btn: padding 10px 20px, background #3498db, color white, border none, border-radius 6px, cursor pointer, font-size 14px
- .refresh-btn:hover: background #2980b9
- .dashboard-row: margin-bottom 30px
- .dashboard-loading: display flex, flex-direction column, align-items center, justify-content center, min-height 400px
- .spinner: width 40px, height 40px, border 4px solid #f3f3f3, border-top 4px solid #3498db, border-radius 50%, animation spin 1s linear infinite
*/