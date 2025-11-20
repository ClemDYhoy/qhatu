
// C:\qhatu\frontend\src\pages\Vendedor\sections\Historial\components\VentaHistorial.jsx
// Componente para mostrar el listado de ventas realizadas
// Vista de tabla con información detallada de cada venta
// Incluye estado, fecha, cliente, total y acciones

import React, { useState } from 'react';

const VentaHistorial = ({ ventas }) => {
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleViewDetail = (venta) => {
    setSelectedVenta(venta);
    setShowModal(true);
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'completada': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelada': return 'danger';
      default: return 'default';
    }
  };

  if (ventas.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No se encontraron ventas</h3>
        <p>Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="venta-historial-container">
      <div className="table-responsive">
        <table className="historial-table">
          <thead>
            <tr>
              <th>N° Venta</th>
              <th>Cliente</th>
              <th>Items</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(venta => (
              <tr key={venta.venta_id}>
                <td>
                  <span className="venta-numero">#{venta.numero_venta}</span>
                </td>
                <td>
                  <div className="cliente-cell">
                    <span className="cliente-nombre">{venta.cliente_nombre}</span>
                    <span className="cliente-email">{venta.cliente_email}</span>
                  </div>
                </td>
                <td>
                  <span className="items-badge">{venta.total_items || 0} items</span>
                </td>
                <td>
                  <span className="total-amount">S/ {venta.total}</span>
                </td>
                <td>
                  <span className={`status-badge status-${getStatusColor(venta.estado)}`}>
                    {venta.estado}
                  </span>
                </td>
                <td>
                  <div className="fecha-cell">
                    <span className="fecha-date">{new Date(venta.fecha_venta).toLocaleDateString('es-PE')}</span>
                    <span className="fecha-time">{new Date(venta.fecha_venta).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleViewDetail(venta)}
                  >
                    👁️ Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalle */}
      {showModal && selectedVenta && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle de Venta #{selectedVenta.numero_venta}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>📋 Información de la Venta</h4>
                <div className="info-grid">
                  <div><strong>Estado:</strong> <span className={`badge badge-${selectedVenta.estado}`}>{selectedVenta.estado}</span></div>
                  <div><strong>Fecha:</strong> {new Date(selectedVenta.fecha_venta).toLocaleString('es-PE')}</div>
                  <div><strong>Total Items:</strong> {selectedVenta.total_items || 0}</div>
                  <div><strong>Total:</strong> S/ {selectedVenta.total}</div>
                </div>
              </div>
              <div className="detail-section">
                <h4>👤 Cliente</h4>
                <div className="info-grid">
                  <div><strong>Nombre:</strong> {selectedVenta.cliente_nombre}</div>
                  <div><strong>Email:</strong> {selectedVenta.cliente_email}</div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VentaHistorial;