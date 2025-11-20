// sections/Dashboard/components/SalesChart.jsx
import React from 'react';
import './SalesChart.css';

const SalesChart = () => {
  // Datos simulados - luego se obtendrán de la API
  const salesData = [
    { day: 'Lun', sales: 150 },
    { day: 'Mar', sales: 200 },
    { day: 'Mié', sales: 180 },
    { day: 'Jue', sales: 220 },
    { day: 'Vie', sales: 300 },
    { day: 'Sáb', sales: 350 },
    { day: 'Dom', sales: 280 }
  ];

  const maxSales = Math.max(...salesData.map(d => d.sales));

  return (
    <div className="sales-chart-container">
      <div className="chart-header">
        <h3>📈 Ventas de los Últimos 7 Días</h3>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-color"></span>
            Ventas (S/)
          </span>
        </div>
      </div>

      <div className="chart-content">
        {salesData.map((item, index) => {
          const height = (item.sales / maxSales) * 100;
          return (
            <div key={index} className="chart-bar-wrapper">
              <div className="chart-bar-container">
                <div 
                  className="chart-bar" 
                  style={{ height: `${height}%` }}
                  title={`S/ ${item.sales}`}
                >
                  <span className="bar-value">S/ {item.sales}</span>
                </div>
              </div>
              <span className="chart-label">{item.day}</span>
            </div>
          );
        })}
      </div>

      <div className="chart-footer">
        <p>Total Semanal: <strong>S/ {salesData.reduce((sum, d) => sum + d.sales, 0)}</strong></p>
        <p>Promedio Diario: <strong>S/ {(salesData.reduce((sum, d) => sum + d.sales, 0) / 7).toFixed(2)}</strong></p>
      </div>
    </div>
  );
};

export default SalesChart;

/* 
CSS ESPECIFICACIONES (SalesChart.css):
- .sales-chart-container: background white, border-radius 12px, padding 20px, box-shadow 0 2px 8px rgba(0,0,0,0.1)
- .chart-header: display flex, justify-content space-between, align-items center, margin-bottom 20px
- .chart-header h3: margin 0, font-size 18px, color #2c3e50
- .chart-legend: display flex, gap 15px
- .legend-item: display flex, align-items center, font-size 14px, color #7f8c8d
- .legend-color: width 12px, height 12px, background #3498db, border-radius 2px, margin-right 5px
- .chart-content: display flex, justify-content space-around, align-items flex-end, height 250px, padding 20px 0, border-bottom 2px solid #ecf0f1
- .chart-bar-wrapper: display flex, flex-direction column, align-items center, flex 1
- .chart-bar-container: width 100%, height 200px, display flex, align-items flex-end, justify-content center
- .chart-bar: width 60%, background linear-gradient(to top, #3498db, #5dade2), border-radius 6px 6px 0 0, position relative, transition height 0.3s ease, display flex, align-items flex-start, justify-content center, padding-top 8px
- .chart-bar:hover: opacity 0.8
- .bar-value: font-size 12px, font-weight 600, color white
- .chart-label: margin-top 10px, font-size 13px, color #7f8c8d, font-weight 500
- .chart-footer: display flex, justify-content space-around, margin-top 20px, padding-top 20px, border-top 1px solid #ecf0f1
- .chart-footer p: margin 0, font-size 14px, color #7f8c8d
- .chart-footer strong: color #2c3e50
*/