// components/StatCard.jsx
import React from 'react';
import './StatCard.css';

const StatCard = ({ 
  icon, 
  label, 
  value, 
  trend, // 'up' | 'down' | null
  trendValue, // Ej: "+15%"
  color // 'primary' | 'success' | 'warning' | 'danger'
}) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      {/* Icono */}
      <div className="stat-icon">
        {icon}
      </div>

      {/* Contenido */}
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
        
        {/* Tendencia (opcional) */}
        {trend && (
          <div className={`stat-trend trend-${trend}`}>
            <span className="trend-icon">
              {trend === 'up' ? '↑' : '↓'}
            </span>
            <span className="trend-value">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

/* 
CSS ESPECIFICACIONES (StatCard.css):
- .stat-card: display flex, padding 20px, border-radius 12px, background white, box-shadow 0 2px 8px rgba(0,0,0,0.1)
- .stat-icon: width 60px, height 60px, border-radius 50%, display flex, align-items center, justify-content center, font-size 24px
- .stat-card-primary .stat-icon: background rgba(52, 152, 219, 0.1), color #3498db
- .stat-card-success .stat-icon: background rgba(46, 204, 113, 0.1), color #2ecc71
- .stat-card-warning .stat-icon: background rgba(241, 196, 15, 0.1), color #f1c40f
- .stat-card-danger .stat-icon: background rgba(231, 76, 60, 0.1), color #e74c3c
- .stat-content: margin-left 15px, flex-grow 1
- .stat-label: font-size 14px, color #7f8c8d, margin-bottom 5px
- .stat-value: font-size 28px, font-weight bold, margin 0
- .stat-trend: display flex, align-items center, margin-top 8px, font-size 14px
- .trend-up: color #2ecc71
- .trend-down: color #e74c3c
- .trend-icon: margin-right 4px
*/