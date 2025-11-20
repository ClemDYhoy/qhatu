
// C:\qhatu\frontend\src\pages\Vendedor\sections\Historial\components\ClienteHistorial.jsx
// Componente para agrupar y mostrar ventas por cliente
// Calcula totales, número de compras y última compra por cliente
// Permite ver el historial completo de cada cliente

import React, { useState, useMemo } from 'react';

const ClienteHistorial = ({ ventas }) => {
  const [expandedClient, setExpandedClient] = useState(null);

  // Agrupar ventas por cliente
  const clientesData = useMemo(() => {
    const grouped = ventas.reduce((acc, venta) => {
      const clienteId = venta.cliente_id || venta.cliente_email;
      
      if (!acc[clienteId]) {
        acc[clienteId] = {
          cliente_id: clienteId,
          cliente_nombre: venta.cliente_nombre,
          cliente_email: venta.cliente_email,
          ventas: [],
          total_compras: 0,
          total_items: 0,
          total_gastado: 0
        };
      }
      
      acc[clienteId].ventas.push(venta);
      acc[clienteId].total_compras += 1;
      acc[clienteId].total_items += venta.total_items || 0;
      acc[clienteId].total_gastado += parseFloat(venta.total) || 0;
      
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => b.total_gastado - a.total_gastado);
  }, [ventas]);

  const toggleClient = (clienteId) => {
    setExpandedClient(expandedClient === clienteId ? null : clienteId);
  };

  if (clientesData.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3>No hay clientes registrados</h3>
        <p>Las ventas aparecerán agrupadas por cliente aquí</p>
      </div>
    );
  }

  return (
    <div className="cliente-historial-container">
      <div className="clientes-grid">
        {clientesData.map(cliente => (
          <div key={cliente.cliente_id} className="cliente-card">
            <div className="cliente-card-header" onClick={() => toggleClient(cliente.cliente_id)}>
              <div className="cliente-info">
                <div className="cliente-avatar">
                  {cliente.cliente_nombre?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="cliente-details">
                  <h4 className="cliente-nombre">{cliente.cliente_nombre || 'Cliente Anónimo'}</h4>
                  <p className="cliente-email">{cliente.cliente_email || '-'}</p>
                </div>
              </div>
              <button className="expand-btn">
                {expandedClient === cliente.cliente_id ? '▼' : '▶'}
              </button>
            </div>

            <div className="cliente-stats">
              <div className="stat-item">
                <span className="stat-icon">🛍️</span>
                <div>
                  <p className="stat-value">{cliente.total_compras}</p>
                  <p className="stat-label">Compras</p>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📦</span>
                <div>
                  <p className="stat-value">{cliente.total_items}</p>
                  <p className="stat-label">Items</p>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">💰</span>
                <div>
                  <p className="stat-value">S/ {cliente.total_gastado.toFixed(2)}</p>
                  <p className="stat-label">Total Gastado</p>
                </div>
              </div>
            </div>

            {expandedClient === cliente.cliente_id && (
              <div className="cliente-ventas-list">
                <h5>Historial de Compras</h5>
                {cliente.ventas.map(venta => (
                  <div key={venta.venta_id} className="venta-item">
                    <div className="venta-info">
                      <span className="venta-numero">#{venta.numero_venta}</span>
                      <span className="venta-fecha">
                        {new Date(venta.fecha_venta).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                    <div className="venta-details">
                      <span className="venta-items">{venta.total_items || 0} items</span>
                      <span className="venta-total">S/ {venta.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClienteHistorial;