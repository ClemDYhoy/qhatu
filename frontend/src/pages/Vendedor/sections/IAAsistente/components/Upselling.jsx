// src/pages/Vendedor/sections/IAAsistente/components/Upselling.jsx
import React from 'react';


const Upselling = () => {
  const opcionesMejores = [
    {
      id: 1,
      actual: 'Celular Básico',
      precioActual: 'S/ 599',
      recomendado: 'Celular Pro + 128GB',
      precioRecomendado: 'S/ 899',
      beneficio: '+64GB almacenamiento · Cámara 48MP · 2 años garantía',
      ahorro: '¡Solo S/ 300 más!',
      popular: true,
    },
  ];

  return (
    <div className="ia-suggestion-card upselling">
      <div className="suggestion-header">
        <span className="suggestion-icon">rocket</span>
        <h3>¡Sube de nivel y gana más comisión!</h3>
      </div>

      {opcionesMejores.map((opcion) => (
        <div key={opcion.id} className="upsell-comparison">
          <div className="current-product">
            <span className="tag">Actual</span>
            <p>{opcion.actual}</p>
            <strong>{opcion.precioActual}</strong>
          </div>

          <div className="arrow">→</div>

          <div className="recommended-product">
            {opcion.popular && <span className="badge-popular">Más vendido</span>}
            <p className="recommended-name">{opcion.recomendado}</p>
            <strong className="price-highlight">{opcion.precioRecomendado}</strong>
            <p className="benefits">{opcion.beneficio}</p>
            <p className="upsell-cta">{opcion.ahorro}</p>
          </div>

          <button className="btn-upsell">
            Mostrar esta opción al cliente
          </button>
        </div>
      ))}

      <p className="suggestion-footer">
        Los vendedores que ofrecen esta mejora cierran 38% más
      </p>
    </div>
  );
};

export default Upselling;
