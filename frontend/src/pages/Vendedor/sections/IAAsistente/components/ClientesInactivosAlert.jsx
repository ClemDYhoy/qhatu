// C:\qhatu\frontend\src\pages\Vendedor\sections\IAAsistente\components\ClientesInactivosAlert.jsx
import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../../../../hooks/useAnalytics';

const ClientesInactivosAlert = () => {
  const {
    loading,
    clientesInactivos,
    cargarClientesInactivos
  } = useAnalytics();

  const [diasInactividad, setDiasInactividad] = useState(60);

  useEffect(() => {
    cargarClientesInactivos(diasInactividad);
  }, [diasInactividad]);

  const handleWhatsApp = (cliente) => {
    let numeroLimpio = cliente.cliente_telefono.replace(/\D/g, '');
    
    if (!numeroLimpio.startsWith('51')) {
      numeroLimpio = '51' + numeroLimpio;
    }

    const mensaje = `Hola ${cliente.cliente_nombre}! 😊

¡Te extrañamos en Qhatu! 

Vimos que hace ${cliente.dias_sin_comprar} días no compras con nosotros y queremos invitarte a ver nuestros nuevos productos.

¿Hay algo específico que estés buscando? Estoy aquí para ayudarte.

¡Saludos! 🛍️`;

    const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'priority-high';
      case 'media': return 'priority-medium';
      case 'baja': return 'priority-low';
      default: return '';
    }
  };

  const getPriorityLabel = (prioridad) => {
    switch (prioridad) {
      case 'alta': return '🔴 Alta';
      case 'media': return '🟡 Media';
      case 'baja': return '🟢 Baja';
      default: return prioridad;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value || 0);
  };

  return (
    <div className="clientes-inactivos-section">
      {/* Header */}
      <div className="section-header">
        <div className="header-left">
          <h3 className="section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Clientes Inactivos
          </h3>
          <p className="section-subtitle">
            Clientes que no compran hace más de {diasInactividad} días
          </p>
        </div>

        <div className="header-right">
          <select
            className="dias-select"
            value={diasInactividad}
            onChange={(e) => setDiasInactividad(Number(e.target.value))}
            disabled={loading}
          >
            <option value={30}>30 días</option>
            <option value={60}>60 días</option>
            <option value={90}>90 días</option>
            <option value={180}>6 meses</option>
          </select>
        </div>
      </div>

      {/* Alert Info */}
      <div className="info-alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <div className="alert-content">
          <strong>💡 Consejo de IA:</strong>
          <p>
            Contactar clientes inactivos puede aumentar tus ventas hasta un 30%. 
            Usa el botón de WhatsApp para enviarles un mensaje personalizado.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-clientes">
          <div className="spinner"></div>
          <p>Analizando clientes inactivos...</p>
        </div>
      )}

      {/* Lista de Clientes */}
      {!loading && clientesInactivos.length > 0 && (
        <div className="clientes-list">
          {clientesInactivos.map((cliente) => (
            <div key={cliente.cliente_id} className="cliente-card">
              {/* Priority Badge */}
              <div className={`priority-badge ${getPriorityColor(cliente.prioridad_reactivacion)}`}>
                {getPriorityLabel(cliente.prioridad_reactivacion)}
              </div>

              {/* Cliente Info */}
              <div className="cliente-info">
                <div className="cliente-header">
                  <div className="cliente-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="cliente-details">
                    <h4 className="cliente-nombre">{cliente.cliente_nombre}</h4>
                    <span className="cliente-telefono">{cliente.cliente_telefono}</span>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="cliente-stats">
                  <div className="stat-item">
                    <span className="stat-label">Última compra:</span>
                    <span className="stat-value highlight">
                      Hace {cliente.dias_sin_comprar} días
                    </span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Compras históricas:</span>
                    <span className="stat-value">{cliente.total_compras_historial}</span>
                  </div>

                  <div className="stat-item">
                    <span className="stat-label">Gastó en total:</span>
                    <span className="stat-value success">
                      {formatCurrency(cliente.gasto_total_historial)}
                    </span>
                  </div>
                </div>

                {/* Recomendación IA */}
                <div className="ia-recommendation">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <p>
                    {cliente.prioridad_reactivacion === 'alta' 
                      ? `Cliente VIP con alto valor de compra. ¡Contáctalo pronto!`
                      : cliente.prioridad_reactivacion === 'media'
                      ? `Buen cliente. Ofrécele productos nuevos o descuentos.`
                      : `Cliente ocasional. Un mensaje amigable puede ayudar.`
                    }
                  </p>
                </div>

                {/* Acciones */}
                <div className="cliente-actions">
                  <button
                    className="btn-action btn-whatsapp"
                    onClick={() => handleWhatsApp(cliente)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Enviar WhatsApp
                  </button>

                  <button className="btn-action btn-secondary">
                    Ver Historial
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && clientesInactivos.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3>¡Excelente!</h3>
          <p>No hay clientes inactivos en este periodo</p>
          <span>Todos tus clientes están activos</span>
        </div>
      )}

      {/* Resumen */}
      {!loading && clientesInactivos.length > 0 && (
        <div className="clientes-summary">
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Clientes Inactivos:</span>
              <span className="summary-value">{clientesInactivos.length}</span>
            </div>
            
            <div className="summary-item">
              <span className="summary-label">Prioridad Alta:</span>
              <span className="summary-value priority-high">
                {clientesInactivos.filter(c => c.prioridad_reactivacion === 'alta').length}
              </span>
            </div>

            <div className="summary-item">
              <span className="summary-label">Valor Potencial:</span>
              <span className="summary-value success">
                {formatCurrency(
                  clientesInactivos.reduce((sum, c) => 
                    sum + parseFloat(c.gasto_total_historial), 0
                  )
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesInactivosAlert;