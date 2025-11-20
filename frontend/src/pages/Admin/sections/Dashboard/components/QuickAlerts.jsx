// sections/Dashboard/components/QuickAlerts.jsx
import React from 'react';
import AIAlert from '../../../components/AIAlert';
import './QuickAlerts.css';

const QuickAlerts = () => {
  // Datos simulados - luego vendrán de las IAs
  const alerts = [
    {
      type: 'prediction',
      severity: 'critical',
      title: 'Stock Crítico Detectado',
      message: '5 productos tienen stock menor a 10 unidades y alta demanda.',
      data: {
        'Productos afectados': '5',
        'Urgencia': 'Alta'
      },
      actions: [
        { label: 'Ver Detalles', variant: 'primary', onClick: () => console.log('Ver detalles') },
        { label: 'Reabastecer', variant: 'secondary', onClick: () => console.log('Reabastecer') }
      ]
    },
    {
      type: 'prediction',
      severity: 'warning',
      title: 'Productos Próximos a Vencer',
      message: '3 productos vencerán en los próximos 15 días.',
      data: {
        'Productos': '3',
        'Días restantes': '15'
      },
      actions: [
        { label: 'Ver Lista', variant: 'primary', onClick: () => console.log('Ver lista') }
      ]
    },
    {
      type: 'recommendation',
      severity: 'info',
      title: 'Oportunidad de Promoción',
      message: 'Los chocolates tienen alta demanda. Se recomienda crear un carrusel promocional.',
      data: {
        'Categoría': 'Chocolates',
        'Aumento de demanda': '+35%'
      },
      actions: [
        { label: 'Crear Carrusel', variant: 'primary', onClick: () => console.log('Crear carrusel') },
        { label: 'Ignorar', variant: 'secondary', onClick: () => console.log('Ignorar') }
      ]
    },
    {
      type: 'assistant',
      severity: 'info',
      title: 'Clientes Inactivos',
      message: '12 clientes no han realizado compras en los últimos 30 días.',
      data: {
        'Clientes': '12',
        'Valor promedio histórico': 'S/ 85'
      },
      actions: [
        { label: 'Ver Clientes', variant: 'primary', onClick: () => console.log('Ver clientes') },
        { label: 'Enviar Recordatorio', variant: 'secondary', onClick: () => console.log('Enviar recordatorio') }
      ]
    }
  ];

  return (
    <div className="quick-alerts-container">
      <div className="alerts-header">
        <h3>🔔 Alertas Inteligentes</h3>
        <span className="alerts-count">{alerts.length} alertas activas</span>
      </div>

      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <AIAlert key={index} {...alert} />
        ))}
      </div>
    </div>
  );
};

export default QuickAlerts;

/* 
CSS ESPECIFICACIONES (QuickAlerts.css):
- .quick-alerts-container: background white, border-radius 12px, padding 20px, box-shadow 0 2px 8px rgba(0,0,0,0.1)
- .alerts-header: display flex, justify-content space-between, align-items center, margin-bottom 20px, padding-bottom 15px, border-bottom 2px solid #ecf0f1
- .alerts-header h3: margin 0, font-size 18px, color #2c3e50
- .alerts-count: background #3498db, color white, padding 4px 12px, border-radius 12px, font-size 13px, font-weight 600
- .alerts-list: display flex, flex-direction column, gap 15px
*/