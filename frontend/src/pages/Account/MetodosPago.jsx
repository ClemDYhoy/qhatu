import React from 'react';
import './Account.css';

const METODOS = [
  { nombre: 'Yape', detalle: 'Pago rápido con tu celular.', tono: '#7c3aed' },
  { nombre: 'Plin', detalle: 'Transferencia inmediata entre billeteras.', tono: '#0ea5e9' },
  { nombre: 'Transferencia bancaria', detalle: 'BCP, Interbank, BBVA y más.', tono: '#334155' },
  { nombre: 'Efectivo contra entrega', detalle: 'Disponible en Huánuco.', tono: '#16a34a' }
];

const MetodosPago = () => (
  <div className="account-page">
    <div className="container">
      <div className="account-header">
        <h1 className="account-title">Métodos de Pago</h1>
        <p className="account-subtitle">Estas son las formas en que puedes pagar tu pedido.</p>
      </div>

      <div className="account-grid">
        {METODOS.map((m) => (
          <div className="account-card" key={m.nombre}>
            <h2 className="account-card__title" style={{ color: m.tono }}>{m.nombre}</h2>
            <p className="account-subtitle">{m.detalle}</p>
          </div>
        ))}
      </div>

      <div className="account-card" style={{ marginTop: 'var(--space-6)' }}>
        <h2 className="account-card__title">¿Cómo pago?</h2>
        <p className="account-subtitle">
          Al confirmar tu pedido por WhatsApp te enviamos los datos de pago (Yape, Plin o cuenta bancaria).
          Coordinamos el pago y la entrega en el mismo chat.
        </p>
        <div className="account-actions" style={{ marginTop: '1rem' }}>
          <a className="account-btn account-btn--whatsapp" href="https://wa.me/51952682285" target="_blank" rel="noopener noreferrer">
            Coordinar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default MetodosPago;
