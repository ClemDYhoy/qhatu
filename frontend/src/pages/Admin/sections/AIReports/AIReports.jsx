// sections/AIReports/AIReports.jsx
import React, { useState } from 'react';
import PredictionPanel from './components/PredictionPanel';
import RecommendationsPanel from './components/RecommendationsPanel';
import SellerAssistPanel from './components/SellerAssistPanel';
import CarouselSuggestions from './components/CarouselSuggestions';
import './AIReports.css';

const AIReports = () => {
  const [activeAI, setActiveAI] = useState('prediction'); // 'prediction' | 'recommendations' | 'assistant' | 'carousels'

  const aiTabs = [
    { id: 'prediction', label: 'Predicción de Inventario', icon: '🔮' },
    { id: 'recommendations', label: 'Recomendaciones', icon: '🎯' },
    { id: 'assistant', label: 'Asistente Vendedor', icon: '💬' },
    { id: 'carousels', label: 'Carruseles Sugeridos', icon: '🎨' }
  ];

  return (
    <div className="ai-reports-section">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1>🤖 Reportes Inteligentes</h1>
          <p className="section-subtitle">
            Análisis y sugerencias generadas por Inteligencia Artificial
          </p>
        </div>
        <button className="refresh-btn">
          🔄 Actualizar Reportes
        </button>
      </div>

      {/* Tabs de IAs */}
      <div className="ai-tabs">
        {aiTabs.map(tab => (
          <button
            key={tab.id}
            className={`ai-tab ${activeAI === tab.id ? 'active' : ''}`}
            onClick={() => setActiveAI(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido según IA activa */}
      <div className="ai-content">
        {activeAI === 'prediction' && <PredictionPanel />}
        {activeAI === 'recommendations' && <RecommendationsPanel />}
        {activeAI === 'assistant' && <SellerAssistPanel />}
        {activeAI === 'carousels' && <CarouselSuggestions />}
      </div>
    </div>
  );
};

export default AIReports;

/* 
CSS ESPECIFICACIONES (AIReports.css):
- .ai-reports-section: padding 30px
- .section-header: display flex, justify-content space-between, align-items flex-start, margin-bottom 30px
- .section-header h1: margin 0 0 5px 0, font-size 28px, color #2c3e50
- .section-subtitle: margin 0, font-size 14px, color #7f8c8d
- .refresh-btn: padding 10px 20px, background #3498db, color white, border none, border-radius 6px, cursor pointer, font-size 14px, font-weight 600
- .refresh-btn:hover: background #2980b9
- .ai-tabs: display grid, grid-template-columns repeat(4, 1fr), gap 15px, margin-bottom 30px
- .ai-tab: padding 15px 20px, background white, border 2px solid #ecf0f1, border-radius 10px, cursor pointer, transition all 0.3s, display flex, flex-direction column, align-items center, gap 8px
- .ai-tab:hover: border-color #3498db, transform translateY(-2px), box-shadow 0 4px 12px rgba(0,0,0,0.1)
- .ai-tab.active: border-color #3498db, background #ecf5ff, box-shadow 0 4px 12px rgba(52,152,219,0.2)
- .tab-icon: font-size 32px
- .tab-label: font-size 13px, font-weight 600, color #2c3e50, text-align center
- .ai-content: background white, border-radius 12px, padding 25px, box-shadow 0 2px 8px rgba(0,0,0,0.1)
*/