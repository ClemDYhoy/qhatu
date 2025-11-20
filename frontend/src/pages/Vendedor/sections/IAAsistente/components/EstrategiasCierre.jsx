
// C:\qhatu\frontend\src\pages\Vendedor\sections\IAAsistente\components\ClientesInactivosAlert.jsx
// Componente para identificar y reactivar clientes inactivos
// Detecta clientes que no han comprado recientemente
// Sugiere estrategias personalizadas de reactivación
// Calcula el valor histórico del cliente (LTV) para priorizar acciones

import React from 'react';

const ClientesInactivosAlert = ({ clientes }) => {
  
  const calcularDiasInactivo = (ultimaCompra) => {
    const hoy = new Date();
    const ultima = new Date(ultimaCompra);
    const diferencia = Math.floor((hoy - ultima) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  const getNivelUrgencia = (dias) => {
    if (dias >= 90) return { class: 'critico', label: 'Crítico', icon: '🔴' };
    if (dias >= 60) return { class: 'alto', label: 'Alto', icon: '🟠' };
    if (dias >= 30) return { class: 'medio', label: 'Medio', icon: '🟡' };
    return { class: 'bajo', label: 'Bajo', icon: '🟢' };
  };

  const handleReactivar = (cliente) => {
    const dias = calcularDiasInactivo(cliente.ultima_compra);
    
    const mensaje = `Hola ${cliente.nombre}, ¡Te extrañamos! 🎉

Han pasado ${dias} días desde tu última compra y queremos volver a verte.

${cliente.incentivo_sugerido}

¿Hay algo en lo que podamos ayudarte?`;
    
    const url = `https://wa.me/51${cliente.telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  if (clientes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">✅</div>
        <h3>¡Excelente! Todos tus clientes están activos</h3>
        <p>No hay clientes inactivos por el momento</p>
      </div>
    );
  }

  return (
    <div className="clientes-inactivos-container">
      <div className="info-banner banner-warning">
        <span className="banner-icon">⚠️</span>
        <div className="banner-content">
          <strong>Alerta:</strong> Estos clientes no han comprado recientemente. 
          Una reactivación oportuna puede recuperar ventas perdidas.
        </div>
      </div>

      <div className="clientes-inactivos-grid">
        {clientes.map((cliente, index) => {
          const diasInactivo = calcularDiasInactivo(cliente.ultima_compra);
          const urgencia = getNivelUrgencia(diasInactivo);
          
          return (
            <div key={index} className={`cliente-inactivo-card urgencia-${urgencia.class}`}>
              <div className="urgencia-badge">
                <span className="urgencia-icon">{urgencia.icon}</span>
                <span className="urgencia-text">{urgencia.label}</span>
              </div>

              <div className="cliente-header">
                <div className="cliente-avatar-large">
                  {cliente.nombre?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="cliente-info-header">
                  <h4>{cliente.nombre}</h4>
                  <p className="cliente-email">{cliente.email}</p>
                </div>
              </div>

              <div className="inactividad-stats">
                <div className="stat-item">
                  <span className="stat-icon">⏰</span>
                  <div>
                    <p className="stat-value">{diasInactivo} días</p>
                    <p className="stat-label">Sin comprar</p>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="stat-icon">🛍️</span>
                  <div>
                    <p className="stat-value">{cliente.total_compras || 0}</p>
                    <p className="stat-label">Compras anteriores</p>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="stat-icon">💰</span>
                  <div>
                    <p className="stat-value">S/ {cliente.valor_historico?.toFixed(2) || '0.00'}</p>
                    <p className="stat-label">Valor histórico</p>
                  </div>
                </div>
              </div>

              <div className="ultima-compra-info">
                <strong>Última compra:</strong>
                <p>{new Date(cliente.ultima_compra).toLocaleDateString('es-PE')}</p>
                <p className="producto-ultimo">{cliente.ultimo_producto}</p>
              </div>

              <div className="incentivo-sugerido">
                <strong>🎁 Incentivo sugerido por IA:</strong>
                <p className="incentivo-texto">{cliente.incentivo_sugerido}</p>
              </div>

              <div className="estrategia-reactivacion">
                <strong>💡 Estrategia recomendada:</strong>
                <ul className="estrategia-lista">
                  {cliente.estrategias?.map((estrategia, idx) => (
                    <li key={idx}>{estrategia}</li>
                  )) || [
                    'Enviar mensaje personalizado',
                    'Ofrecer descuento exclusivo',
                    'Recordar productos favoritos'
                  ].map((estrategia, idx) => (
                    <li key={idx}>{estrategia}</li>
                  ))}
                </ul>
              </div>

              <div className="cliente-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleReactivar(cliente)}
                >
                  💬 Reactivar Cliente
                </button>
              </div>

              <div className="probabilidad-bar">
                <div className="probabilidad-label">
                  <span>Prob. de reactivación:</span>
                  <span>{cliente.probabilidad_reactivacion || 65}%</span>
                </div>
                <div className="probabilidad-progress">
                  <div 
                    className="probabilidad-fill"
                    style={{ width: `${cliente.probabilidad_reactivacion || 65}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="leyenda-urgencias">
        <h4>Niveles de Urgencia</h4>
        <div className="leyenda-grid">
          <div className="leyenda-item">
            <span className="leyenda-icon">🔴</span>
            <span>Crítico: +90 días</span>
          </div>
          <div className="leyenda-item">
            <span className="leyenda-icon">🟠</span>
            <span>Alto: 60-89 días</span>
          </div>
          <div className="leyenda-item">
            <span className="leyenda-icon">🟡</span>
            <span>Medio: 30-59 días</span>
          </div>
          <div className="leyenda-item">
            <span className="leyenda-icon">🟢</span>
            <span>Bajo: -30 días</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientesInactivosAlert;