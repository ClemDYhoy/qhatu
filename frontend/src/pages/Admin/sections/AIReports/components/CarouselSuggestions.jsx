// sections/AIReports/components/CarouselSuggestions.jsx
import React, { useState } from 'react';
import './CarouselSuggestions.css';

const CarouselSuggestions = () => {
  // Datos simulados - luego vendrán de la IA
  const [suggestions] = useState([
    {
      id: 1,
      tipo: 'Promoción por Tendencia',
      titulo: '¡Chocolates Más Vendidos! 🍫',
      descripcion: 'Basado en el aumento del 35% en ventas de chocolates',
      categoria: 'Chocolates',
      productos: ['Chocolate Suizo', 'Chocolate Belga', 'Pocky Chocolate'],
      razonamiento: 'La categoría Chocolates ha mostrado un crecimiento del 35% en las últimas 2 semanas. Se recomienda destacar estos productos.',
      impactoEstimado: '+28% conversiones',
      prioridad: 'Alta',
      estado: 'pendiente'
    },
    {
      id: 2,
      tipo: 'Liquidación por Vencimiento',
      titulo: '¡Ofertas Especiales! 🎁',
      descripcion: 'Productos próximos a vencer con descuento',
      categoria: 'Galletas',
      productos: ['Galletas Oreo Edición', 'Galletas Choco Chip'],
      razonamiento: 'Hay productos con menos de 15 días para vencer. Una promoción ayudará a evitar pérdidas.',
      impactoEstimado: 'Evitar S/ 450 en pérdidas',
      prioridad: 'Crítica',
      estado: 'pendiente'
    },
    {
      id: 3,
      tipo: 'Cross-Selling',
      titulo: 'Combo Perfecto: Ramen + Extras 🍜',
      descripcion: 'Bundle de productos complementarios',
      categoria: 'Ramen y Fideos',
      productos: ['Ramen Picante', 'Huevos', 'Vegetales'],
      razonamiento: 'El 78% de clientes que compran ramen también adquieren estos productos. Bundle sugerido con 15% descuento.',
      impactoEstimado: '+22% ticket promedio',
      prioridad: 'Media',
      estado: 'pendiente'
    }
  ]);

  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const handleApprove = (id) => {
    console.log('Aprobar carrusel:', id);
    // TODO: Implementar aprobación
  };

  const handleReject = (id) => {
    console.log('Rechazar carrusel:', id);
    // TODO: Implementar rechazo
  };

  const handleEdit = (suggestion) => {
    setSelectedSuggestion(suggestion);
    console.log('Editar carrusel:', suggestion);
    // TODO: Abrir modal de edición
  };

  const getPriorityClass = (prioridad) => {
    switch(prioridad) {
      case 'Crítica': return 'critical';
      case 'Alta': return 'high';
      case 'Media': return 'medium';
      default: return 'low';
    }
  };

  return (
    <div className="carousel-suggestions-panel">
      <div className="panel-header">
        <h2>🎨 Carruseles Sugeridos por IA</h2>
        <p className="panel-description">
          Sugerencias automáticas de carruseles basadas en análisis de inventario y tendencias
        </p>
      </div>

      <div className="suggestions-stats">
        <div className="stat-item">
          <span className="stat-icon">📋</span>
          <span className="stat-value">{suggestions.length}</span>
          <span className="stat-label">Sugerencias Pendientes</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">
            {suggestions.filter(s => s.prioridad === 'Crítica' || s.prioridad === 'Alta').length}
          </span>
          <span className="stat-label">Alta Prioridad</span>
        </div>
      </div>

      {/* Lista de Sugerencias */}
      <div className="suggestions-list">
        {suggestions.map(suggestion => (
          <div key={suggestion.id} className={`suggestion-card priority-${getPriorityClass(suggestion.prioridad)}`}>
            {/* Header */}
            <div className="suggestion-header">
              <div className="suggestion-title-section">
                <span className="suggestion-type">{suggestion.tipo}</span>
                <h3 className="suggestion-title">{suggestion.titulo}</h3>
                <p className="suggestion-desc">{suggestion.descripcion}</p>
              </div>
              <span className={`priority-badge ${getPriorityClass(suggestion.prioridad)}`}>
                {suggestion.prioridad}
              </span>
            </div>

            {/* Detalles */}
            <div className="suggestion-details">
              <div className="detail-row">
                <span className="detail-label">📂 Categoría:</span>
                <span className="detail-value">{suggestion.categoria}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">📦 Productos:</span>
                <span className="detail-value">{suggestion.productos.join(', ')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">📈 Impacto Estimado:</span>
                <span className="detail-value impact">{suggestion.impactoEstimado}</span>
              </div>
            </div>

            {/* Razonamiento de la IA */}
            <div className="suggestion-reasoning">
              <h4 className="reasoning-title">🤖 Razonamiento de la IA:</h4>
              <p className="reasoning-text">{suggestion.razonamiento}</p>
            </div>

            {/* Vista Previa */}
            <div className="suggestion-preview">
              <h4 className="preview-title">👁️ Vista Previa del Carrusel</h4>
              <div className="preview-box">
                <div className="preview-content">
                  <h3>{suggestion.titulo}</h3>
                  <p>{suggestion.descripcion}</p>
                  <div className="preview-products">
                    {suggestion.productos.map((prod, idx) => (
                      <span key={idx} className="preview-product">
                        📦 {prod}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="suggestion-actions">
              <button 
                className="action-btn approve"
                onClick={() => handleApprove(suggestion.id)}
              >
                ✅ Aprobar y Activar
              </button>
              <button 
                className="action-btn edit"
                onClick={() => handleEdit(suggestion)}
              >
                ✏️ Editar
              </button>
              <button 
                className="action-btn reject"
                onClick={() => handleReject(suggestion.id)}
              >
                ❌ Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Información Adicional */}
      <div className="ai-info-box">
        <span className="info-icon">💡</span>
        <div className="info-content">
          <h4 className="info-title">Sobre las Sugerencias Automáticas</h4>
          <p className="info-text">
            La IA analiza continuamente el inventario, tendencias de venta y comportamiento de clientes 
            para generar sugerencias de carruseles optimizados. Puedes aprobar, editar o rechazar cada sugerencia.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarouselSuggestions;

/* 
CSS ESPECIFICACIONES (CarouselSuggestions.css):
- .carousel-suggestions-panel: display flex, flex-direction column, gap 30px
- .panel-header h2: margin 0 0 8px 0, font-size 24px, color #2c3e50
- .panel-description: margin 0, font-size 14px, color #7f8c8d
- .suggestions-stats: display grid, grid-template-columns repeat(2, 1fr), gap 20px, margin-bottom 20px
- .stat-item: background white, border 2px solid #ecf0f1, border-radius 10px, padding 20px, display flex, flex-direction column, align-items center, gap 8px
- .stat-icon: font-size 32px
- .stat-value: font-size 32px, font-weight bold, color #2c3e50
- .stat-label: font-size 13px, color #7f8c8d, text-align center
- .suggestions-list: display flex, flex-direction column, gap 25px
- .suggestion-card: background white, border 2px solid, border-radius 12px, padding 25px, transition all 0.3s
- .suggestion-card.priority-critical: border-color #e74c3c, background #fff5f5
- .suggestion-card.priority-high: border-color #f39c12, background #fffbf0
- .suggestion-card.priority-medium: border-color #3498db, background #ecf5ff
- .suggestion-header: display flex, justify-content space-between, align-items flex-start, margin-bottom 20px
- .suggestion-type: display inline-block, background #ecf0f1, color #2c3e50, padding 4px 12px, border-radius 12px, font-size 11px, font-weight 600, text-transform uppercase, margin-bottom 8px
- .suggestion-title: margin 0 0 8px 0, font-size 20px, font-weight 600, color #2c3e50
- .suggestion-desc: margin 0, font-size 14px, color #7f8c8d
- .priority-badge: padding 6px 16px, border-radius 20px, font-size 13px, font-weight 600, color white
- .priority-badge.critical: background #e74c3c
- .priority-badge.high: background #f39c12
- .priority-badge.medium: background #3498db
- .suggestion-details: background rgba(0,0,0,0.02), padding 15px, border-radius 8px, margin-bottom 15px
- .detail-row: display flex, justify-content space-between, padding 8px 0, border-bottom 1px solid rgba(0,0,0,0.05)
- .detail-row:last-child: border-bottom none
- .detail-label: font-size 13px, color #7f8c8d, font-weight 600
- .detail-value: font-size 13px, color #2c3e50, text-align right
- .detail-value.impact: color #27ae60, font-weight 600
- .suggestion-reasoning: background #e8f4f8, border-left 4px solid #3498db, padding 15px, border-radius 6px, margin-bottom 15px
- .reasoning-title: margin 0 0 8px 0, font-size 14px, font-weight 600, color #2c3e50
- .reasoning-text: margin 0, font-size 13px, color #555, line-height 1.6
- .suggestion-preview: margin-bottom 15px
- .preview-title: margin 0 0 10px 0, font-size 14px, font-weight 600, color #2c3e50
- .preview-box: background linear-gradient(135deg, #667eea 0%, #764ba2 100%), border-radius 10px, padding 30px, color white
- .preview-content h3: margin 0 0 8px 0, font-size 22px, font-weight bold
- .preview-content p: margin 0 0 15px 0, font-size 14px, opacity 0.9
- .preview-products: display flex, gap 10px, flex-wrap wrap
- .preview-product: background rgba(255,255,255,0.2), padding 6px 12px, border-radius 6px, font-size 13px
- .suggestion-actions: display grid, grid-template-columns 2fr 1fr 1fr, gap 10px
- .action-btn: padding 12px 20px, border none, border-radius 6px, cursor pointer, font-size 14px, font-weight 600, transition all 0.3s
- .action-btn.approve: background #27ae60, color white
- .action-btn.approve:hover: background #229954
- .action-btn.edit: background #3498db, color white
- .action-btn.edit:hover: background #2980b9
- .action-btn.reject: background #e74c3c, color white
- .action-btn.reject:hover: background #c0392b
- .ai-info-box: background #e8f4f8, border-left 4px solid #3498db, padding 20px, border-radius 8px, display flex, gap 15px, align-items flex-start
- .info-icon: font-size 32px
- .info-content: flex-grow 1
- .info-title: margin 0 0 8px 0, font-size 16px, font-weight 600, color #2c3e50
- .info-text: margin 0, font-size 13px, color #555, line-height 1.6
*/