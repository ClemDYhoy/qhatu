// sections/AIReports/components/PredictionPanel.jsx
import React from 'react';
import AIAlert from '../../../components/AIAlert';
import './PredictionPanel.css';

const PredictionPanel = () => {
  // Datos simulados - luego vendrán de la IA
  const predictions = {
    stockCritico: [
      { nombre: 'Chocolate Suizo', stock: 8, demandaPredicted: 25, dias: 7 },
      { nombre: 'Ramen Picante', stock: 5, demandaPredicted: 18, dias: 7 },
      { nombre: 'Bubble Tea Mango', stock: 7, demandaPredicted: 15, dias: 7 }
    ],
    vencimientos: [
      { nombre: 'Galletas Oreo Edición', dias: 10, stock: 25 },
      { nombre: 'Chocolate Belga', dias: 17, stock: 15 }
    ],
    sobreStock: [
      { nombre: 'Papas BBQ', stock: 150, ventasPromedio: 12, meses: 3 }
    ]
  };

  return (
    <div className="prediction-panel">
      <div className="panel-header">
        <h2>🔮 Predicción de Inventario</h2>
        <p className="panel-description">
          Análisis predictivo basado en patrones de venta y tendencias de demanda
        </p>
      </div>

      {/* Alertas de Stock Crítico */}
      <div className="prediction-section">
        <h3 className="section-title">⚠️ Stock Crítico Predicho (Próximos 7 días)</h3>
        {predictions.stockCritico.map((item, index) => (
          <AIAlert
            key={index}
            type="prediction"
            severity="critical"
            title={`${item.nombre} - Stock Insuficiente`}
            message={`Stock actual: ${item.stock} unidades. Demanda predicha: ${item.demandaPredicted} unidades en ${item.dias} días.`}
            data={{
              'Stock Actual': item.stock,
              'Demanda Predicha': item.demandaPredicted,
              'Déficit Estimado': item.demandaPredicted - item.stock
            }}
            actions={[
              { label: 'Reabastecer Ahora', variant: 'primary', onClick: () => console.log('Reabastecer') },
              { label: 'Ver Detalles', variant: 'secondary', onClick: () => console.log('Detalles') }
            ]}
          />
        ))}
      </div>

      {/* Alertas de Vencimiento */}
      <div className="prediction-section">
        <h3 className="section-title">📅 Productos Próximos a Vencer</h3>
        {predictions.vencimientos.map((item, index) => (
          <AIAlert
            key={index}
            type="prediction"
            severity="warning"
            title={`${item.nombre} - Vence en ${item.dias} días`}
            message={`Se recomienda crear una promoción o ajustar el precio para evitar pérdidas.`}
            data={{
              'Stock Disponible': item.stock,
              'Días para Vencer': item.dias
            }}
            actions={[
              { label: 'Crear Promoción', variant: 'primary', onClick: () => console.log('Promoción') },
              { label: 'Ajustar Precio', variant: 'secondary', onClick: () => console.log('Precio') }
            ]}
          />
        ))}
      </div>

      {/* Alertas de Sobre-Stock */}
      <div className="prediction-section">
        <h3 className="section-title">📦 Productos con Sobre-Stock</h3>
        {predictions.sobreStock.map((item, index) => (
          <AIAlert
            key={index}
            type="prediction"
            severity="info"
            title={`${item.nombre} - Stock Excesivo`}
            message={`Stock actual (${item.stock}) supera las ventas promedio (${item.ventasPromedio}/mes) de los últimos ${item.meses} meses.`}
            data={{
              'Stock Actual': item.stock,
              'Ventas Promedio': `${item.ventasPromedio}/mes`,
              'Meses de Cobertura': Math.floor(item.stock / item.ventasPromedio)
            }}
            actions={[
              { label: 'Crear Oferta', variant: 'primary', onClick: () => console.log('Oferta') }
            ]}
          />
        ))}
      </div>

      {/* Resumen de Predicciones */}
      <div className="predictions-summary">
        <h3 className="summary-title">📊 Resumen de Predicciones</h3>
        <div className="summary-grid">
          <div className="summary-card critical">
            <span className="summary-icon">🔴</span>
            <span className="summary-value">{predictions.stockCritico.length}</span>
            <span className="summary-label">Productos en Riesgo</span>
          </div>
          <div className="summary-card warning">
            <span className="summary-icon">⚠️</span>
            <span className="summary-value">{predictions.vencimientos.length}</span>
            <span className="summary-label">Próximos a Vencer</span>
          </div>
          <div className="summary-card info">
            <span className="summary-icon">📦</span>
            <span className="summary-value">{predictions.sobreStock.length}</span>
            <span className="summary-label">Sobre-Stock</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionPanel;

/* 
CSS ESPECIFICACIONES (PredictionPanel.css):
- .prediction-panel: display flex, flex-direction column, gap 30px
- .panel-header: margin-bottom 10px
- .panel-header h2: margin 0 0 8px 0, font-size 24px, color #2c3e50
- .panel-description: margin 0, font-size 14px, color #7f8c8d, line-height 1.5
- .prediction-section: margin-bottom 25px
- .section-title: margin 0 0 15px 0, font-size 18px, font-weight 600, color #2c3e50, padding-bottom 10px, border-bottom 2px solid #ecf0f1
- .predictions-summary: background linear-gradient(135deg, #667eea 0%, #764ba2 100%), padding 25px, border-radius 12px, color white
- .summary-title: margin 0 0 20px 0, font-size 18px, font-weight 600, color white
- .summary-grid: display grid, grid-template-columns repeat(3, 1fr), gap 20px
- .summary-card: background rgba(255,255,255,0.15), backdrop-filter blur(10px), padding 20px, border-radius 10px, text-align center, display flex, flex-direction column, align-items center, gap 8px
- .summary-icon: font-size 32px
- .summary-value: font-size 36px, font-weight bold, color white
- .summary-label: font-size 13px, color rgba(255,255,255,0.9)
*/