// C:\qhatu\frontend\src\pages\Vendedor\sections\IAAsistente\IAAsistente.jsx
import React, { useState } from 'react';
import ClientesInactivosAlert from './components/ClientesInactivosAlert';
import CrossSelling from './components/CrossSelling';
import Upselling from './components/Upselling';
import EstrategiasCierre from './components/EstrategiasCierre';
import './IAAsistente.css';
const IAAsistente = () => {
  const [activeTab, setActiveTab] = useState('clientes-inactivos');

  const tabs = [
    {
      id: 'clientes-inactivos',
      label: 'Clientes Inactivos',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      description: 'Reactiva clientes que no compran'
    },
    {
      id: 'cross-selling',
      label: 'Cross-Selling',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      description: 'Productos complementarios'
    },
    {
      id: 'upselling',
      label: 'Upselling',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      description: 'Aumenta el valor de venta'
    },
    {
      id: 'estrategias',
      label: 'Estrategias de Cierre',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      description: 'Tips para cerrar ventas'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'clientes-inactivos':
        return <ClientesInactivosAlert />;
      case 'cross-selling':
        return <CrossSelling />;
      case 'upselling':
        return <Upselling />;
      case 'estrategias':
        return <EstrategiasCierre />;
      default:
        return <ClientesInactivosAlert />;
    }
  };

  return (
    <div className="ia-asistente-container">
      {/* Header */}
      <div className="ia-header">
        <div className="header-content">
          <h2 className="ia-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Asistente IA de Ventas
          </h2>
          <p className="ia-subtitle">
            Recomendaciones inteligentes para aumentar tus ventas
          </p>
        </div>

        {/* Info Banner */}
        <div className="ia-banner">
          <div className="banner-icon">🤖</div>
          <div className="banner-content">
            <h3>Powered by AI</h3>
            <p>
              Este asistente analiza datos reales de tu historial de ventas para 
              brindarte recomendaciones personalizadas y estrategias efectivas.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="ia-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`ia-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="tab-icon">{tab.icon}</div>
            <div className="tab-content">
              <span className="tab-label">{tab.label}</span>
              <span className="tab-description">{tab.description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Contenido Dinámico */}
      <div className="ia-content">
        {renderContent()}
      </div>

      {/* Footer con Tips */}
      <div className="ia-footer">
        <div className="tip-card">
          <div className="tip-icon">💡</div>
          <div className="tip-content">
            <h4>Tip Profesional</h4>
            <p>
              {activeTab === 'clientes-inactivos' && 
                'Los clientes que llevan 60+ días sin comprar tienen un 70% de probabilidad de no regresar. ¡Contáctalos ahora!'}
              
              {activeTab === 'cross-selling' && 
                'El cross-selling puede aumentar tus ventas hasta un 35%. Ofrece productos complementarios siempre.'}
              
              {activeTab === 'upselling' && 
                'El upselling bien hecho aumenta el ticket promedio sin afectar la experiencia del cliente.'}
              
              {activeTab === 'estrategias' && 
                'Las mejores estrategias de cierre combinan urgencia, valor y confianza.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IAAsistente;