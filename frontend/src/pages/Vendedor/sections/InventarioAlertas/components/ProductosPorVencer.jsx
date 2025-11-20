// C:\qhatu\frontend\src\pages\Vendedor\sections\InventarioAlertas\components\ProductosPorVencer.jsx
// Componente para mostrar productos próximos a vencer
// Calcula días hasta vencimiento y prioriza según urgencia
// Permite crear promociones rápidas para productos próximos a vencer

import React from 'react';

const ProductosPorVencer = ({ productos }) => {
  
  const calcularDiasVencer = (fechaVencimiento) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  const getUrgenciaClass = (dias) => {
    if (dias <= 3) return 'urgencia-critica';
    if (dias <= 7) return 'urgencia-alta';
    if (dias <= 15) return 'urgencia-media';
    return 'urgencia-baja';
  };

  const getUrgenciaLabel = (dias) => {
    if (dias <= 0) return '¡VENCIDO!';
    if (dias === 1) return '1 día';
    return `${dias} días`;
  };

  if (productos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✅</div>
        <h3>Sin productos por vencer</h3>
        <p>No hay productos próximos a su fecha de vencimiento</p>
      </div>
    );
  }

  return (
    <div className="productos-vencer-container">
      <div className="productos-vencer-grid">
        {productos.map(producto => {
          const diasVencer = calcularDiasVencer(producto.fecha_vencimiento);
          
          return (
            <div key={producto.producto_id} className={`producto-vencer-card ${getUrgenciaClass(diasVencer)}`}>
              <div className="urgencia-badge">
                <span className="urgencia-icon">⏰</span>
                <span className="urgencia-text">{getUrgenciaLabel(diasVencer)}</span>
              </div>

              <div className="producto-vencer-header">
                <h4>{producto.nombre}</h4>
                <span className="stock-info">Stock: {producto.stock_actual}</span>
              </div>

              <div className="producto-vencer-body">
                <div className="info-row">
                  <span className="info-label">SKU:</span>
                  <span className="info-value">{producto.sku || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Categoría:</span>
                  <span className="info-value">{producto.categoria || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Vencimiento:</span>
                  <span className="info-value">
                    {new Date(producto.fecha_vencimiento).toLocaleDateString('es-PE')}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Precio:</span>
                  <span className="info-value precio">S/ {producto.precio}</span>
                </div>
              </div>

              <div className="producto-vencer-actions">
                <button className="btn btn-sm btn-warning">
                  🏷️ Crear Promoción
                </button>
                <button className="btn btn-sm btn-primary">
                  📊 Ver Detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda de urgencia */}
      <div className="urgencia-legend">
        <h4>Nivel de Urgencia</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color urgencia-critica"></span>
            <span>Crítico (0-3 días)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color urgencia-alta"></span>
            <span>Alto (4-7 días)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color urgencia-media"></span>
            <span>Medio (8-15 días)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color urgencia-baja"></span>
            <span>Bajo (+15 días)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductosPorVencer;
