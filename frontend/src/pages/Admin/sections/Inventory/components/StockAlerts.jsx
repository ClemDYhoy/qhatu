// sections/Inventory/components/StockAlerts.jsx
import React from 'react';
import './StockAlerts.css';

const StockAlerts = ({ products }) => {
  // Filtrar productos con stock crítico (< 10)
  const criticalStock = products.filter(p => p.stock < 10 && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);

  return (
    <div className="stock-alerts-container">
      <div className="alerts-header">
        <h3>⚠️ Alertas de Stock</h3>
        <span className="alerts-count">
          {criticalStock.length + outOfStock.length} alertas
        </span>
      </div>

      {/* Stock Crítico */}
      {criticalStock.length > 0 && (
        <div className="alert-section">
          <h4 className="alert-section-title critical">
            🔴 Stock Crítico ({criticalStock.length})
          </h4>
          <p className="alert-section-desc">
            Productos con menos de 10 unidades
          </p>
          <div className="alert-list">
            {criticalStock.map(product => (
              <div key={product.producto_id} className="alert-item critical">
                <div className="alert-item-info">
                  <p className="product-name">{product.nombre}</p>
                  <span className="product-category">{product.categoria_nombre}</span>
                </div>
                <div className="alert-item-stock">
                  <span className="stock-value critical">{product.stock}</span>
                  <span className="stock-label">unidades</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agotados */}
      {outOfStock.length > 0 && (
        <div className="alert-section">
          <h4 className="alert-section-title out">
            ⛔ Productos Agotados ({outOfStock.length})
          </h4>
          <p className="alert-section-desc">
            Productos sin stock disponible
          </p>
          <div className="alert-list">
            {outOfStock.map(product => (
              <div key={product.producto_id} className="alert-item out">
                <div className="alert-item-info">
                  <p className="product-name">{product.nombre}</p>
                  <span className="product-category">{product.categoria_nombre}</span>
                </div>
                <div className="alert-item-stock">
                  <span className="stock-value out">0</span>
                  <span className="stock-label">unidades</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin alertas */}
      {criticalStock.length === 0 && outOfStock.length === 0 && (
        <div className="no-alerts">
          <span className="no-alerts-icon">✅</span>
          <p>No hay alertas de stock en este momento</p>
          <span className="no-alerts-subtitle">
            Todos los productos tienen stock adecuado
          </span>
        </div>
      )}
    </div>
  );
};

export default StockAlerts;

/* 
CSS ESPECIFICACIONES (StockAlerts.css):
- .stock-alerts-container: background white, border-radius 12px, padding 20px, box-shadow 0 2px 8px rgba(0,0,0,0.1)
- .alerts-header: display flex, justify-content space-between, align-items center, margin-bottom 20px, padding-bottom 15px, border-bottom 2px solid #ecf0f1
- .alerts-header h3: margin 0, font-size 18px, color #2c3e50
- .alerts-count: background #e74c3c, color white, padding 4px 12px, border-radius 12px, font-size 13px, font-weight 600
- .alert-section: margin-bottom 25px
- .alert-section-title: margin 0 0 5px 0, font-size 16px, font-weight 600, display flex, align-items center
- .alert-section-title.critical: color #e74c3c
- .alert-section-title.out: color #95a5a6
- .alert-section-desc: margin 0 0 15px 0, font-size 13px, color #7f8c8d
- .alert-list: display flex, flex-direction column, gap 10px
- .alert-item: display flex, justify-content space-between, align-items center, padding 12px 15px, border-radius 8px, border-left 4px solid
- .alert-item.critical: background #fff5f5, border-color #e74c3c
- .alert-item.out: background #f8f9fa, border-color #95a5a6
- .alert-item-info: flex-grow 1
- .product-name: margin 0 0 4px 0, font-size 14px, font-weight 600, color #2c3e50
- .product-category: font-size 12px, color #7f8c8d
- .alert-item-stock: text-align right
- .stock-value: font-size 24px, font-weight bold, display block
- .stock-value.critical: color #e74c3c
- .stock-value.out: color #95a5a6
- .stock-label: font-size 12px, color #7f8c8d, display block, margin-top -4px
- .no-alerts: text-align center, padding 60px 20px, display flex, flex-direction column, align-items center
- .no-alerts-icon: font-size 48px, margin-bottom 15px
- .no-alerts p: margin 0 0 5px 0, font-size 16px, color #2c3e50, font-weight 600
- .no-alerts-subtitle: font-size 14px, color #7f8c8d
*/