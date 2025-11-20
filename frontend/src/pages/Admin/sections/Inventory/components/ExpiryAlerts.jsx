// sections/Inventory/components/ExpiryAlerts.jsx
import React from 'react';
import './ExpiryAlerts.css';

const ExpiryAlerts = () => {
  // Datos simulados - luego vendrán de la IA de Predicción
  const expiringProducts = [
    {
      producto_id: 1,
      nombre: 'Chocolate Belga Premium',
      categoria: 'Chocolates',
      fecha_vencimiento: '2025-12-05',
      dias_restantes: 17,
      stock: 15
    },
    {
      producto_id: 2,
      nombre: 'Leche de Coco Importada',
      categoria: 'Bebidas',
      fecha_vencimiento: '2025-12-10',
      dias_restantes: 22,
      stock: 8
    },
    {
      producto_id: 3,
      nombre: 'Galletas Oreo Edición Especial',
      categoria: 'Galletas',
      fecha_vencimiento: '2025-11-28',
      dias_restantes: 10,
      stock: 25
    }
  ];

  const getSeverityClass = (days) => {
    if (days <= 15) return 'critical';
    if (days <= 30) return 'warning';
    return 'normal';
  };

  const getSeverityLabel = (days) => {
    if (days <= 15) return 'Urgente';
    if (days <= 30) return 'Próximo';
    return 'Normal';
  };

  return (
    <div className="expiry-alerts-container">
      <div className="alerts-header">
        <h3>📅 Productos Próximos a Vencer</h3>
        <span className="alerts-count">
          {expiringProducts.length} productos
        </span>
      </div>

      <div className="expiry-info">
        <p className="info-text">
          🤖 <strong>Predicción de IA:</strong> Estos productos están próximos a vencer.
          Se recomienda crear promociones o ajustar precios.
        </p>
      </div>

      {expiringProducts.length > 0 ? (
        <div className="expiry-list">
          {expiringProducts.map(product => {
            const severity = getSeverityClass(product.dias_restantes);
            return (
              <div key={product.producto_id} className={`expiry-item ${severity}`}>
                <div className="expiry-item-header">
                  <div className="product-info">
                    <h4 className="product-name">{product.nombre}</h4>
                    <span className="product-category">{product.categoria}</span>
                  </div>
                  <span className={`severity-badge ${severity}`}>
                    {getSeverityLabel(product.dias_restantes)}
                  </span>
                </div>

                <div className="expiry-item-details">
                  <div className="detail-item">
                    <span className="detail-label">Vence en:</span>
                    <span className={`detail-value ${severity}`}>
                      {product.dias_restantes} días
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha:</span>
                    <span className="detail-value">
                      {new Date(product.fecha_vencimiento).toLocaleDateString('es-PE')}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Stock:</span>
                    <span className="detail-value">{product.stock} unidades</span>
                  </div>
                </div>

                <div className="expiry-item-actions">
                  <button className="action-btn primary">
                    🎯 Crear Promoción
                  </button>
                  <button className="action-btn secondary">
                    📝 Ver Detalles
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-alerts">
          <span className="no-alerts-icon">✅</span>
          <p>No hay productos próximos a vencer</p>
          <span className="no-alerts-subtitle">
            Todos los productos están dentro del rango seguro
          </span>
        </div>
      )}
    </div>
  );
};

export default ExpiryAlerts;

/* 
CSS ESPECIFICACIONES (ExpiryAlerts.css):
- .expiry-alerts-container: background white, border-radius 12px, padding 20px, box-shadow 0 2px 8px rgba(0,0,0,0.1)
- .alerts-header: display flex, justify-content space-between, align-items center, margin-bottom 20px, padding-bottom 15px, border-bottom 2px solid #ecf0f1
- .alerts-header h3: margin 0, font-size 18px, color #2c3e50
- .alerts-count: background #f39c12, color white, padding 4px 12px, border-radius 12px, font-size 13px, font-weight 600
- .expiry-info: background #e8f4f8, border-left 4px solid #3498db, padding 12px 15px, border-radius 6px, margin-bottom 20px
- .info-text: margin 0, font-size 13px, color #2c3e50, line-height 1.6
- .expiry-list: display flex, flex-direction column, gap 15px
- .expiry-item: background #f8f9fa, border-radius 10px, padding 15px, border-left 4px solid
- .expiry-item.critical: background #fff5f5, border-color #e74c3c
- .expiry-item.warning: background #fffbf0, border-color #f39c12
- .expiry-item-header: display flex, justify-content space-between, align-items flex-start, margin-bottom 12px
- .product-info h4: margin 0 0 4px 0, font-size 15px, font-weight 600, color #2c3e50
- .product-category: font-size 12px, color #7f8c8d
- .severity-badge: padding 4px 12px, border-radius 12px, font-size 12px, font-weight 600
- .severity-badge.critical: background #e74c3c, color white
- .severity-badge.warning: background #f39c12, color white
- .expiry-item-details: display grid, grid-template-columns repeat(3, 1fr), gap 15px, margin-bottom 12px, padding-bottom 12px, border-bottom 1px solid #ecf0f1
- .detail-item: display flex, flex-direction column, gap 4px
- .detail-label: font-size 11px, color #7f8c8d, text-transform uppercase, letter-spacing 0.5px
- .detail-value: font-size 14px, font-weight 600, color #2c3e50
- .detail-value.critical: color #e74c3c
- .detail-value.warning: color #f39c12
- .expiry-item-actions: display flex, gap 10px
- .action-btn: padding 8px 16px, border none, border-radius 6px, cursor pointer, font-size 13px, font-weight 600, transition all 0.3s
- .action-btn.primary: background #3498db, color white
- .action-btn.primary:hover: background #2980b9
- .action-btn.secondary: background white, color #2c3e50, border 1px solid #ddd
- .action-btn.secondary:hover: background #f8f9fa
- .no-alerts: text-align center, padding 60px 20px
- .no-alerts-icon: font-size 48px, display block, margin-bottom 15px
- .no-alerts p: margin 0 0 5px 0, font-size 16px, color #2c3e50, font-weight 600
- .no-alerts-subtitle: font-size 14px, color #7f8c8d
*/