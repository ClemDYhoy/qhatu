// sections/AIReports/AIReports.jsx
import React, { useState } from 'react';
import PredictionPanel from './components/PredictionPanel';
import RecommendationsPanel from './components/RecommendationsPanel';
import SellerAssistPanel from './components/SellerAssistPanel';
import CarouselSuggestions from './components/CarouselSuggestions';
import './AIReports.css';

const Ico = {
  Predict: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>),
  Target: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>),
  Chat: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>),
  Gallery: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>),
  Refresh: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>)
};

const AIReports = () => {
  const [activeAI, setActiveAI] = useState('prediction');
  const [refreshKey, setRefreshKey] = useState(0);

  const aiTabs = [
    { id: 'prediction', label: 'Predicción de inventario', Icon: Ico.Predict },
    { id: 'recommendations', label: 'Recomendaciones', Icon: Ico.Target },
    { id: 'assistant', label: 'Asistente vendedor', Icon: Ico.Chat },
    { id: 'carousels', label: 'Carruseles sugeridos', Icon: Ico.Gallery }
  ];

  return (
    <div className="ai-reports-section">
      <div className="section-header">
        <div>
          <h1>Reportes inteligentes</h1>
          <p className="section-subtitle">Análisis y sugerencias generadas con inteligencia artificial</p>
        </div>
        <button className="refresh-btn" onClick={() => setRefreshKey((k) => k + 1)} type="button">
          <Ico.Refresh /> Actualizar reportes
        </button>
      </div>

      <div className="ai-tabs">
        {aiTabs.map((tab) => (
          <button
            key={tab.id}
            className={`ai-tab ${activeAI === tab.id ? 'active' : ''}`}
            onClick={() => setActiveAI(tab.id)}
            type="button"
          >
            <span className="tab-icon"><tab.Icon /></span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="ai-content" key={refreshKey}>
        {activeAI === 'prediction' && <PredictionPanel />}
        {activeAI === 'recommendations' && <RecommendationsPanel />}
        {activeAI === 'assistant' && <SellerAssistPanel />}
        {activeAI === 'carousels' && <CarouselSuggestions />}
      </div>
    </div>
  );
};

export default AIReports;
