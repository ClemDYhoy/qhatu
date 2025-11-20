
// C:\qhatu\frontend\src\pages\Vendedor\sections\SalesPending\components\SalesTable.jsx
// Componente de tabla para visualizar carritos pendientes en formato tabla
// Muestra: ID, Cliente, Items, Total, Fecha y Acciones
// Incluye funciones para ver detalle, contactar por WhatsApp y confirmar venta

import React from 'react';

const SalesTable = ({ carritos, onViewDetail, onConfirmar }) => {
  
  const handleWhatsApp = (carrito) => {
    const mensaje = `Hola ${carrito.cliente_nombre}, te contacto sobre tu pedido #${carrito.carrito_id}`;
    const url = `https://wa.me/51${carrito.cliente_telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="sales-table-container">
      <table className="sales-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Items</th>
            <th>Total</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {carritos.map(carrito => (
            <tr key={carrito.carrito_id}>
              <td>
                <span className="carrito-id">#{carrito.carrito_id}</span>
              </td>
              <td>{carrito.cliente_nombre || 'Anónimo'}</td>
              <td>{carrito.cliente_email || '-'}</td>
              <td>{carrito.cliente_telefono || '-'}</td>
              <td>
                <span className="items-badge">{carrito.total_items || 0}</span>
              </td>
              <td>
                <span className="total-amount">S/ {carrito.total?.toFixed(2) || '0.00'}</span>
              </td>
              <td>{new Date(carrito.creado_en).toLocaleDateString('es-PE')}</td>
              <td>
                <div className="table-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => onViewDetail(carrito)}
                    title="Ver detalle"
                  >
                    👁️
                  </button>
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleWhatsApp(carrito)}
                    title="WhatsApp"
                  >
                    💬
                  </button>
                  <button 
                    className="btn btn-sm btn-confirm"
                    onClick={() => onConfirmar(carrito.carrito_id)}
                    title="Confirmar"
                  >
                    ✅
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;