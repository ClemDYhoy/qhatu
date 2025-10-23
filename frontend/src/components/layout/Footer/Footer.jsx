import React from 'react';
import './Footer.css';

// Iconos SVG Premium
const EmailIcon = () => (
  <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const LocationIcon = () => (
  <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.273 14.884 3.783 13.733 3.783 12.436s.49-2.448 1.343-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.853.875 1.343 2.026 1.343 3.323s-.49 2.448-1.343 3.323c-.875.807-2.026 1.297-3.323 1.297z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.016 10.016 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Sección Marca */}
          <div className="footer-section footer-brand">
            <div className="brand-badge">
              <span>⚡</span>
              oe!
            </div>
            <h4>Qhatu Marca</h4>
            <p>
              Conectando <span className="brand-highlight">hispanohablantes</span> con los 
              mejores <span className="brand-highlight">productos importados</span> de calidad. 
              Tu puerta de entrada a experiencias únicas desde cualquier parte del mundo.
            </p>
            
            {/* Redes Sociales */}
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <TwitterIcon />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
            </div>
          </div>
          
          {/* Enlaces Rápidos */}
          <div className="footer-section footer-links">
            <h4>Enlaces Rápidos</h4>
            <ul>
              <li><a href="/">🏠 Inicio</a></li>
              <li><a href="/products">📦 Productos</a></li>
              <li><a href="/categories">🗂️ Categorías</a></li>
              <li><a href="/deals">🔥 Ofertas</a></li>
              <li><a href="/about">👥 Nosotros</a></li>
              <li><a href="/contact">📞 Contacto</a></li>
            </ul>
          </div>
          
          {/* Información de Contacto */}
          <div className="footer-section footer-contact">
            <h4>Contacto</h4>
            <p>
              <EmailIcon />
              info@qhatumarca.com
            </p>
            <p>
              <WhatsAppIcon />
              +1 (123) 456-7890
            </p>
            <p>
              <LocationIcon />
              Miami, FL - Internacional
            </p>
            
            <div className="business-hours">
              <p style={{marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--gray-40)'}}>
                🕒 Horario: Lunes a Viernes<br/>
                9:00 AM - 6:00 PM EST
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            &copy; {currentYear} <strong>Qhatu Marca</strong>. Todos los derechos reservados.
          </p>
          <div className="footer-legal">
            <a href="/privacy">Política de Privacidad</a>
            <a href="/terms">Términos de Servicio</a>
            <a href="/shipping">Envíos & Devoluciones</a>
            <a href="/cookies">Política de Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;