// sections/AIReports/components/RecommendationsPanel.jsx
import React from 'react';
import AIAlert from '../../../components/AIAlert';
import './RecommendationsPanel.css';

const RecommendationsPanel = () => {
  // Datos simulados - luego vendrán de la IA
  const recommendations = {
    crossSelling: [
      {
        producto: 'Chocolate Suizo',
        relacionados: ['Galletas Oreo', 'Leche Condensada', 'Café Importado'],
        probabilidad: 78
      },
      {
        producto: 'Ramen Picante',
        relacionados: ['Huevos', 'Vegetales Congelados', 'Salsa Picante'],
        probabilidad: 65
      }
    ],
    trending: [
      { categoria: 'Chocolates', aumento: 35, ventas: 145 },
      { categoria: 'Bubble Tea', aumento: 28, ventas: 98 },
      { categoria: 'Snacks', aumento: 22, ventas: 210 }
    ],
    destacados: [
      { nombre: 'Chocolate Belga Premium', ventas: 87, rating: 4.8 },
      { nombre: 'Pocky Fresa', ventas: 76, rating: 4.9 },
      { nombre: 'Ramune Original', ventas: 65, rating: 4.7 }
    ]
  };

  return (
    <div className="recommendations-panel">
      <div className="panel-header">
        <h2>🎯 Recomendaciones Inteligentes</h2>
        <p className="panel-description">
          Sugerencias basadas en patrones de compra y preferencias de clientes
        </p>
      </div>

      {/* Cross-Selling */}
      <div className="recommendation-section">
        <h3 className="section-title">🔗 Oportunidades de Cross-Selling</h3>
        <p className="section-desc">
          Productos que los clientes suelen comprar juntos
        </p>
        
        {recommendations.crossSelling.map((item, index) => (
          <AIAlert
            key={index}
            type="recommendation"
            severity="info"
            title={`${item.producto} - Productos Relacionados`}
            message={`Los clientes que compran este producto también suelen adquirir:`}
            data={{
              'Productos Relacionados': item.relacionados.join(', '),
              'Probabilidad de Compra Conjunta': `${item.probabilidad}%`
            }}
            actions={[
              { label: 'Crear Bundle', variant: 'primary', onClick: () => console.log('Bundle') },
              { label: 'Ver Análisis', variant: 'secondary', onClick: () => console.log('Análisis') }
            ]}
          />
        ))}
      </div>

      {/* Categorías en Tendencia */}
      <div className="recommendation-section">
        <h3 className="section-title">📈 Categorías en Tendencia</h3>
        <p className="section-desc">
          Categorías con mayor aumento de demanda
        </p>
        
        <div className="trending-grid">
          {recommendations.trending.map((item, index) => (
            <div key={index} className="trending-card">
              <div className="trending-header">
                <h4 className="trending-category">{item.categoria}</h4>
                <span className="trending-badge">+{item.aumento}%</span>
              </div>
              <div className="trending-stats">
                <div className="stat-item">
                  <span className="stat-label">Ventas este mes</span>
                  <span className="stat-value">{item.ventas}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Crecimiento</span>
                  <span className="stat-value trend-up">+{item.aumento}%</span>
                </div>
              </div>
              <button className="trending-action">
                🎨 Crear Carrusel Promocional
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Productos Destacados Sugeridos */}
      <div className="recommendation-section">
        <h3 className="section-title">⭐ Productos para Destacar</h3>
        <p className="section-desc">
          Productos con alto rendimiento que deberían tener más visibilidad
        </p>
        
        <div className="featured-grid">
          {recommendations.destacados.map((item, index) => (
            <div key={index} className="featured-card">
              <div className="featured-icon">🏆</div>
              <h4 className="featured-name">{item.nombre}</h4>
              <div className="featured-metrics">
                <div className="metric">
                  <span className="metric-icon">📊</span>
                  <span className="metric-value">{item.ventas} ventas</span>
                </div>
                <div className="metric">
                  <span className="metric-icon">⭐</span>
                  <span className="metric-value">{item.rating}/5.0</span>
                </div>
              </div>
              <button className="featured-action">
                Destacar en Home
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen */}
      <div className="recommendations-summary">
        <h3 className="summary-title">💡 Resumen de Recomendaciones</h3>
        <div className="summary-stats">
          <div className="summary-item">
            <span className="summary-icon">🔗</span>
            <div className="summary-info">
              <span className="summary-value">{recommendations.crossSelling.length}</span>
              <span className="summary-label">Oportunidades de Bundle</span>
            </div>
          </div>
          <div className="summary-item">
            <span className="summary-icon">📈</span>
            <div className="summary-info">
              <span className="summary-value">{recommendations.trending.length}</span>
              <span className="summary-label">Categorías en Tendencia</span>
            </div>
          </div>
          <div className="summary-item">
            <span className="summary-icon">⭐</span>
            <div className="summary-info">
              <span className="summary-value">{recommendations.destacados.length}</span>
              <span className="summary-label">Productos para Destacar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPanel;

/* 
CSS ESPECIFICACIONES (RecommendationsPanel.css):
- .recommendations-panel: display flex, flex-direction column, gap 30px
- .panel-header h2: margin 0 0 8px 0, font-size 24px, color #2c3e50
- .panel-description: margin 0, font-size 14px, color #7f8c8d
- .recommendation-section: margin-bottom 25px
- .section-title: margin 0 0 8px 0, font-size 18px, font-weight 600, color #2c3e50
- .section-desc: margin 0 0 15px 0, font-size 13px, color #7f8c8d
- .trending-grid: display grid, grid-template-columns repeat(3, 1fr), gap 20px
- .trending-card: background white, border 2px solid #ecf0f1, border-radius 10px, padding 20px, transition all 0.3s
- .trending-card:hover: border-color #3498db, transform translateY(-4px), box-shadow 0 6px 20px rgba(0,0,0,0.1)
- .trending-header: display flex, justify-content space-between, align-items center, margin-bottom 15px
- .trending-category: margin 0, font-size 16px, font-weight 600, color #2c3e50
- .trending-badge: background #27ae60, color white, padding 4px 12px, border-radius 12px, font-size 13px, font-weight 600
- .trending-stats: display flex, flex-direction column, gap 10px, margin-bottom 15px
- .stat-item: display flex, justify-content space-between, align-items center
- .stat-label: font-size 13px, color #7f8c8d
- .stat-value: font-size 16px, font-weight 600, color #2c3e50
- .stat-value.trend-up: color #27ae60
- .trending-action: width 100%, padding 10px, background #3498db, color white, border none, border-radius 6px, cursor pointer, font-size 14px, font-weight 600
- .trending-action:hover: background #2980b9
- .featured-grid: display grid, grid-template-columns repeat(3, 1fr), gap 20px
- .featured-card: background linear-gradient(135deg, #667eea 0%, #764ba2 100%), border-radius 12px, padding 25px, text-align center, color white
- .featured-icon: font-size 48px, margin-bottom 15px
- .featured-name: margin 0 0 15px 0, font-size 16px, font-weight 600, color white
- .featured-metrics: display flex, justify-content center, gap 20px, margin-bottom 15px
- .metric: display flex, align-items center, gap 5px, background rgba(255,255,255,0.2), padding 8px 15px, border-radius 20px
- .metric-icon: font-size 16px
- .metric-value: font-size 14px, font-weight 600
- .featured-action: padding 10px 20px, background white, color #667eea, border none, border-radius 6px, cursor pointer, font-size 14px, font-weight 600
- .featured-action:hover: background #f8f9fa
- .recommendations-summary: background #ecf5ff, border-left 4px solid #3498db, padding 20px, border-radius 8px
- .summary-title: margin 0 0 15px 0, font-size 18px, font-weight 600, color #2c3e50
- .summary-stats: display flex, justify-content space-around
- .summary-item: display flex, align-items center, gap 15px
- .summary-icon: font-size 32px
- .summary-info: display flex, flex-direction column
- .summary-value: font-size 28px, font-weight bold, color #2c3e50
- .summary-label: font-size 13px, color #7f8c8d
*/