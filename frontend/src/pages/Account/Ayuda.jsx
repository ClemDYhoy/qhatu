import React from 'react';
import { Link } from 'react-router-dom';
import './Account.css';

const IconWhatsApp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.9 11.9 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41A11.82 11.82 0 0 0 12.05 0zm5.42 16.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35z"/>
  </svg>
);

const FAQS = [
  { q: '¿Cómo hago un pedido?', a: 'Agrega productos al carrito, abre el carrito y pulsa "Comprar por WhatsApp". Te confirmamos stock y coordinamos la entrega.' },
  { q: '¿Cuáles son los métodos de pago?', a: 'Aceptamos Yape, Plin, transferencia bancaria y efectivo contra entrega dentro de Huánuco.' },
  { q: '¿Cuánto cuesta el envío?', a: 'El envío es gratis en compras desde S/. 50. Para montos menores se coordina un costo según la zona.' },
  { q: '¿Los productos son originales?', a: 'Sí, todos nuestros productos son 100% originales y se seleccionan con cuidado.' },
  { q: '¿Puedo cambiar o devolver un producto?', a: 'Sí. Si tu pedido tiene algún problema, escríbenos por WhatsApp dentro de las 48 horas y lo resolvemos.' }
];

const Ayuda = () => (
  <div className="account-page">
    <div className="container">
      <div className="account-header">
        <h1 className="account-title">Ayuda y Soporte</h1>
        <p className="account-subtitle">Resolvemos tus dudas y te acompañamos en tu compra.</p>
      </div>

      <div className="account-grid">
        <div className="account-card">
          <h2 className="account-card__title">Preguntas frecuentes</h2>
          <div className="account-faq">
            {FAQS.map((f, i) => (
              <details key={i}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="account-card">
          <h2 className="account-card__title">Contáctanos</h2>
          <p className="account-subtitle" style={{ marginBottom: '1rem' }}>
            ¿No encuentras lo que buscas? Escríbenos y te ayudamos.
          </p>
          <div className="account-actions">
            <a className="account-btn account-btn--whatsapp" href="https://wa.me/51952682285" target="_blank" rel="noopener noreferrer">
              <IconWhatsApp /> WhatsApp
            </a>
            <a className="account-btn account-btn--ghost" href="mailto:info@qhatumarca.com">info@qhatumarca.com</a>
            <Link className="account-btn account-btn--ghost" to="/contact">Formulario de contacto</Link>
            <Link className="account-btn account-btn--ghost" to="/nosotros">Sobre nosotros</Link>
          </div>
          <p className="account-subtitle" style={{ marginTop: '1rem' }}>
            Horario de atención: Lunes a Domingo, 8:00 AM – 10:00 PM.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Ayuda;
