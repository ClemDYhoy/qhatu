// components/AIAlert.jsx
import React from 'react';
import './AIAlert.css';

const AIAlert = ({ 
  type, // 'prediction' | 'recommendation' | 'assistant'
  severity, // 'info' | 'warning' | 'critical'
  title,
  message,
  data, // Datos adicionales (opcional)
  actions // Array de botones de acción
}) => {
  const icons = {
    prediction: '🔮',
    recommendation: '🎯',
    assistant: '💬'
  };

  const severityColors = {
    info: '#3498db',
    warning: '#f39c12',
    critical: '#e74c3c'
  };

  return (
    <div className={`ai-alert ai-alert-${severity}`}>
      {/* Icono de tipo de IA */}
      <div className="alert-icon" style={{ color: severityColors[severity] }}>
        {icons[type]}
      </div>

      {/* Contenido */}
      <div className="alert-content">
        <h4 className="alert-title">{title}</h4>
        <p className="alert-message">{message}</p>

        {/* Datos adicionales (opcional) */}
        {data && (
          <div className="alert-data">
            {Object.entries(data).map(([key, value]) => (
              <span key={key} className="data-item">
                <strong>{key}:</strong> {value}
              </span>
            ))}
          </div>
        )}

        {/* Acciones (opcional) */}
        {actions && actions.length > 0 && (
          <div className="alert-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`action-btn ${action.variant || 'primary'}`}
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAlert;

/* 
CSS ESPECIFICACIONES (AIAlert.css):
- .ai-alert: display flex, padding 15px, border-radius 8px, margin-bottom 15px, border-left 4px solid
- .ai-alert-info: background #ecf5ff, border-color #3498db
- .ai-alert-warning: background #fff9e6, border-color #f39c12
- .ai-alert-critical: background #ffe6e6, border-color #e74c3c
- .alert-icon: font-size 32px, margin-right 15px, flex-shrink 0
- .alert-content: flex-grow 1
- .alert-title: margin 0 0 5px 0, font-size 16px, font-weight 600, color #2c3e50
- .alert-message: margin 0 0 10px 0, font-size 14px, color #555, line-height 1.5
- .alert-data: display flex, gap 15px, margin-bottom 10px, flex-wrap wrap
- .data-item: font-size 13px, color #666
- .alert-actions: display flex, gap 10px, margin-top 10px
- .action-btn: padding 6px 12px, border-radius 4px, border none, cursor pointer, font-size 13px, font-weight 500
- .action-btn.primary: background #3498db, color white
- .action-btn.secondary: background #ecf0f1, color #2c3e50
*/