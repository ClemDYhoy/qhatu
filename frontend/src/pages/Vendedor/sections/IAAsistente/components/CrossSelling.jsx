// src/pages/Vendedor/sections/IAAsistente/components/CrossSelling.jsx
import React from 'react';


const CrossSelling = () => {
  const sugerencias = [
    { id: 1, nombre: 'Audífonos Bluetooth', precio: 'S/ 89.90', emoji: 'headphones' },
    { id: 2, nombre: 'Funda Protectora', precio: 'S/ 29.90', emoji: 'shield' },
    { id: 3, nombre: 'Cargador Inalámbrico', precio: 'S/ 119.90', emoji: 'zap' },
  ];

  return (
    <div className="ia-suggestion-card">
      <div className="suggestion-header">
        <span className="suggestion-icon">lightbulb</span>
        <h3>Clientes que compraron esto también agregaron...</h3>
      </div>

      <div className="suggestions-grid">
        {sugerencias.map((prod) => (
          <div key={prod.id} className="suggestion-item">
            <div className="product-emoji">{prod.emoji}</div>
            <div className="product-info">
              <p className="product-name">{prod.nombre}</p>
              <p className="product-price">{prod.precio}</p>
            </div>
            <button className="btn-add-suggestion">
              + Agregar
            </button>
          </div>
        ))}
      </div>

      <p className="suggestion-footer">
        Sugerencias basadas en +8,400 ventas similares
      </p>
    </div>
  );
};

export default CrossSelling;