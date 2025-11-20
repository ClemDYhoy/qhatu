// sections/AIReports/components/SellerAssistPanel.jsx
import React from 'react';
import AIAlert from '../../../components/AIAlert';
import './SellerAssistPanel.css';

const SellerAssistPanel = () => {
  // Datos simulados - luego vendrán de la IA
  const assistData = {
    clientesInactivos: [
      { 
        nombre: 'María González', 
        email: 'maria@email.com',
        ultimaCompra: '2025-09-15',
        diasInactivo: 65,
        valorHistorico: 245.50
      },
      { 
        nombre: 'Carlos Ramírez', 
        email: 'carlos@email.com',
        ultimaCompra: '2025-10-01',
        diasInactivo: 49,
        valorHistorico: 180.30
      }
    ],
    carritosAbandonados: [
      {
        cliente: 'Ana Torres',
        productos: 3,
        valor: 85.50,
        dias: 2
      },
      {
        cliente: 'Luis Medina',
        productos: 5,
        valor: 125.00,
        dias: 1
      }
    ],
    oportunidadesUpselling: [
      {
        cliente: 'Pedro Silva',
        compraPromedio: 45.00,
        sugerencia: 'Chocolates Premium',
        potencialAumento: 35
      }
    ]
  };

  return (
    <div className="seller-assist-panel">
      <div className="panel-header">
        <h2>💬 Asistente del Vendedor</h2>
        <p className="panel-description">
          Alertas y sugerencias para mejorar las ventas y retención de clientes
        </p>
      </div>

      {/* Clientes Inactivos */}
      <div className="assist-section">
        <h3 className="section-title">😴 Clientes Inactivos</h3>
        <p className="section-desc">
          Clientes que no han realizado compras recientemente
        </p>

        <div className="inactive-clients-list">
          {assistData.clientesInactivos.map((cliente, index) => (
            <div key={index} className="inactive-client-card">
              <div className="client-header">
                <div className="client-avatar">👤</div>
                <div className="client-info">
                  <h4 className="client-name">{cliente.nombre}</h4>
                  <p className="client-email">{cliente.email}</p>
                </div>
                <span className="inactive-badge">{cliente.diasInactivo} días</span>
              </div>
              
              <div className="client-stats">
                <div className="stat-box">
                  <span className="stat-label">Última Compra</span>
                  <span className="stat-value">
                    {new Date(cliente.ultimaCompra).toLocaleDateString('es-PE')}
                  </span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Valor Histórico</span>
                  <span className="stat-value">S/ {cliente.valorHistorico}</span>
                </div>
              </div>

              <div className="client-actions">
                <button className="action-btn primary">
                  📧 Enviar Recordatorio
                </button>
                <button className="action-btn secondary">
                  🎁 Enviar Cupón
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carritos Abandonados */}
      <div className="assist-section">
        <h3 className="section-title">🛒 Carritos Abandonados con Alto Valor</h3>
        <p className="section-desc">
          Carritos que no fueron completados y tienen valor significativo
        </p>

        {assistData.carritosAbandonados.map((carrito, index) => (
          <AIAlert
            key={index}
            type="assistant"
            severity="warning"
            title={`${carrito.cliente} - Carrito Abandonado`}
            message={`Hace ${carrito.dias} día(s), este cliente dejó ${carrito.productos} productos en el carrito.`}
            data={{
              'Productos': carrito.productos,
              'Valor Total': `S/ ${carrito.valor}`,
              'Tiempo Abandonado': `${carrito.dias} día(s)`
            }}
            actions={[
              { label: 'Contactar Cliente', variant: 'primary', onClick: () => console.log('Contactar') },
              { label: 'Ver Carrito', variant: 'secondary', onClick: () => console.log('Ver') }
            ]}
          />
        ))}
      </div>

      {/* Oportunidades de Upselling */}
      <div className="assist-section">
        <h3 className="section-title">💰 Oportunidades de Upselling</h3>
        <p className="section-desc">
          Clientes con potencial para aumentar su ticket promedio
        </p>

        {assistData.oportunidadesUpselling.map((opp, index) => (
          <AIAlert
            key={index}
            type="assistant"
            severity="info"
            title={`${opp.cliente} - Oportunidad de Venta`}
            message={`Este cliente tiene un ticket promedio de S/ ${opp.compraPromedio}. Se recomienda ofrecerle: ${opp.sugerencia}`}
            data={{
              'Ticket Promedio': `S/ ${opp.compraPromedio}`,
              'Producto Sugerido': opp.sugerencia,
              'Aumento Potencial': `+${opp.potencialAumento}%`
            }}
            actions={[
              { label: 'Crear Oferta Personalizada', variant: 'primary', onClick: () => console.log('Oferta') },
              { label: 'Ver Historial', variant: 'secondary', onClick: () => console.log('Historial') }
            ]}
          />
        ))}
      </div>

      {/* Resumen del Asistente */}
      <div className="assist-summary">
        <h3 className="summary-title">📊 Resumen de Oportunidades</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-icon">😴</span>
            <span className="summary-value">{assistData.clientesInactivos.length}</span>
            <span className="summary-label">Clientes Inactivos</span>
            <span className="summary-potential">
              Potencial: S/ {assistData.clientesInactivos.reduce((sum, c) => sum + c.valorHistorico, 0).toFixed(2)}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-icon">🛒</span>
            <span className="summary-value">{assistData.carritosAbandonados.length}</span>
            <span className="summary-label">Carritos Abandonados</span>
            <span className="summary-potential">
              Valor: S/ {assistData.carritosAbandonados.reduce((sum, c) => sum + c.valor, 0).toFixed(2)}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-icon">💰</span>
            <span className="summary-value">{assistData.oportunidadesUpselling.length}</span>
            <span className="summary-label">Oportunidades Upselling</span>
            <span className="summary-potential">
              Potencial: +{assistData.oportunidadesUpselling.reduce((sum, o) => sum + o.potencialAumento, 0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerAssistPanel;

/* 
CSS ESPECIFICACIONES (SellerAssistPanel.css):
- .seller-assist-panel: display flex, flex-direction column, gap 30px
- .panel-header h2: margin 0 0 8px 0, font-size 24px, color #2c3e50
- .panel-description: margin 0, font-size 14px, color #7f8c8d
- .assist-section: margin-bottom 25px
- .section-title: margin 0 0 8px 0, font-size 18px, font-weight 600, color #2c3e50
- .section-desc: margin 0 0 15px 0, font-size 13px, color #7f8c8d
- .inactive-clients-list: display grid, grid-template-columns repeat(2, 1fr), gap 20px
- .inactive-client-card: background white, border 2px solid #ecf0f1, border-radius 10px, padding 20px, transition all 0.3s
- .inactive-client-card:hover: border-color #e74c3c, box-shadow 0 4px 12px rgba(0,0,0,0.1)
- .client-header: display flex, align-items center, gap 15px, margin-bottom 15px
- .client-avatar: width 50px, height 50px, background linear-gradient(135deg, #667eea, #764ba2), border-radius 50%, display flex, align-items center, justify-content center, font-size 24px
- .client-info: flex-grow 1
- .client-name: margin 0 0 4px 0, font-size 16px, font-weight 600, color #2c3e50
- .client-email: margin 0, font-size 13px, color #7f8c8d
- .inactive-badge: background #e74c3c, color white, padding 4px 12px, border-radius 12px, font-size 12px, font-weight 600
- .client-stats: display grid, grid-template-columns 1fr 1fr, gap 15px, margin-bottom 15px, padding-bottom 15px, border-bottom 1px solid #ecf0f1
- .stat-box: display flex, flex-direction column, gap 4px
- .stat-label: font-size 12px, color #7f8c8d, text-transform uppercase
- .stat-value: font-size 14px, font-weight 600, color #2c3e50
- .client-actions: display flex, gap 10px
- .action-btn: flex 1, padding 10px, border none, border-radius 6px, cursor pointer, font-size 13px, font-weight 600, transition all 0.3s
- .action-btn.primary: background #3498db, color white
- .action-btn.primary:hover: background #2980b9
- .action-btn.secondary: background #ecf0f1, color #2c3e50
- .action-btn.secondary:hover: background #d5dbdb
- .assist-summary: background linear-gradient(135deg, #f093fb 0%, #f5576c 100%), padding 25px, border-radius 12px, color white
- .summary-title: margin 0 0 20px 0, font-size 18px, font-weight 600
- .summary-grid: display grid, grid-template-columns repeat(3, 1fr), gap 20px
- .summary-card: background rgba(255,255,255,0.15), backdrop-filter blur(10px), padding 20px, border-radius 10px, text-align center
- .summary-icon: font-size 36px, display block, margin-bottom 10px
- .summary-value: font-size 32px, font-weight bold, display block, margin-bottom 5px
- .summary-label: font-size 13px, display block, margin-bottom 8px
- .summary-potential: font-size 14px, font-weight 600, display block, background rgba(255,255,255,0.2), padding 6px 12px, border-radius 6px
*/