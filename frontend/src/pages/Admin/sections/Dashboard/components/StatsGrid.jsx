// sections/Dashboard/components/StatsGrid.jsx
import React from 'react';
import StatCard from '../../../components/StatCard';
import './StatsGrid.css';

const StatsGrid = ({ stats }) => {
  return (
    <div className="stats-grid">
      <StatCard
        icon="💰"
        label="Ventas del Día"
        value={`S/ ${stats.totalVentas.toFixed(2)}`}
        trend="up"
        trendValue="+15%"
        color="primary"
      />

      <StatCard
        icon="📦"
        label="Total Productos"
        value={stats.totalProductos}
        color="success"
      />

      <StatCard
        icon="⚠️"
        label="Stock Crítico"
        value={stats.stockCritico}
        trend="down"
        trendValue="-3"
        color="warning"
      />

      <StatCard
        icon="👥"
        label="Usuarios Activos"
        value={stats.usuariosActivos}
        trend="up"
        trendValue="+8"
        color="info"
      />
    </div>
  );
};

export default StatsGrid;

/* 
CSS ESPECIFICACIONES (StatsGrid.css):
- .stats-grid: display grid, grid-template-columns repeat(auto-fit, minmax(250px, 1fr)), gap 20px, margin-bottom 30px
*/