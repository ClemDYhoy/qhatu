import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    // Simular envío (reemplaza con tu lógica real)
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => setStatus(''), 3000);
    }, 1500);
  };

  return (
    <div className="contact">
      <h2>Contáctanos</h2>
      <p>Estamos aquí para ayudarte. Déjanos un mensaje y te responderemos pronto.</p>

      {/* Contact Info Cards */}
      <div className="contact-info">
        <div className="contact-card">
          <div className="contact-icon">📧</div>
          <h3>Email</h3>
          <a href="mailto:contacto@qhatu.com">contacto@qhatu.com</a>
        </div>

        <div className="contact-card">
          <div className="contact-icon">📱</div>
          <h3>WhatsApp</h3>
          <a 
            href="https://wa.me/51123456789" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            +51 123 456 789
          </a>
        </div>

        <div className="contact-card">
          <div className="contact-icon">🕒</div>
          <h3>Horario</h3>
          <p>Lun - Vie: 9AM - 6PM<br />Sáb: 10AM - 2PM</p>
        </div>
      </div>

      {/* Contact Form */}
      <form className="contact-form" onSubmit={handleSubmit}>
        <h3>Envíanos un mensaje</h3>

        <div className="form-group">
          <label htmlFor="name">Nombre completo *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Tu nombre"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="tu@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Asunto *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="¿En qué podemos ayudarte?"
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Mensaje *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Escribe tu mensaje aquí..."
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={status === 'sending'}
        >
          {status === 'sending' && '⏳ Enviando...'}
          {status === 'success' && '✓ Mensaje enviado'}
          {!status && 'Enviar mensaje'}
        </button>

        {status === 'success' && (
          <p style={{ 
            textAlign: 'center', 
            marginTop: '1rem', 
            color: '#28a745',
            fontWeight: '500'
          }}>
            ¡Gracias por contactarnos! Te responderemos pronto.
          </p>
        )}
      </form>
    </div>
  );
};

export default Contact;