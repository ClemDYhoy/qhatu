// src/pages/Vendedor/sections/IAAsistente/IAAsistente.jsx
import React from 'react';

const IAAsistente = () => {
  return (
    <div className="section-container">
      <h2>Asistente IA</h2>
      <div className="ia-card">
        <h3>¿En qué te puedo ayudar hoy?</h3>
        <p>Escribe tu consulta y te daré estrategias de venta personalizadas</p>
        <textarea placeholder="Ej: Cómo cerrar más ventas esta semana..." rows="4"></textarea>
        <button className="ia-btn">Enviar consulta</button>
      </div>
    </div>
  );
};

export default IAAsistente;