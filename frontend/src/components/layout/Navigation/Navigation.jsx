// C:\qhatu\frontend\src\components\layout\Navigation\Navigation.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

// ====================================
// 🎨 ICONOS SVG MEJORADOS
// ====================================
const Icons = {
  Home: ({ className = "" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  
  Products: ({ className = "" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  
  About: ({ className = "" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  
  Contact: ({ className = "" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  
  WhatsApp: ({ className = "" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  
  Mail: ({ className = "" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  
  Close: ({ className = "" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
};

// ====================================
// 🧩 COMPONENTE PRINCIPAL MEJORADO
// ====================================
const Navigation = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Items de navegación con sus iconos
  const navItems = [
    { path: '/', label: 'Inicio', icon: Icons.Home },
    { path: '/products', label: 'Productos', icon: Icons.Products },
    { path: '/nosotros', label: 'Nosotros', icon: Icons.About },
    { path: '/contact', label: 'Contacto', icon: Icons.Contact },
  ];

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Manejar tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // ====================================
  // 🎨 RENDER MEJORADO
  // ====================================
  return (
    <>
      {/* Overlay para móvil */}
      <div 
        className={`navigation-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Navegación principal */}
      <nav 
        className={`navigation ${isOpen ? 'navigation--open' : ''}`}
        role="navigation"
        aria-label="Navegación principal"
      >
        {/* Botón cerrar en móvil */}
        <button
          className="navigation-close"
          onClick={onClose}
          aria-label="Cerrar menú de navegación"
        >
          <Icons.Close className="close-icon" />
        </button>

        {/* Lista de navegación */}
        <ul className="navigation-list">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            
            return (
              <li key={item.path} className="navigation-item" style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
                <Link
                  to={item.path}
                  className={`navigation-link ${isActive ? 'navigation-link--active' : ''}`}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="navigation-icon">
                    <IconComponent className="nav-icon" />
                  </span>
                  <span className="navigation-label">{item.label}</span>
                  {isActive && <span className="navigation-indicator" aria-hidden="true" />}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sección de contacto SOLO en móvil */}
        <div className="navigation-contact-mobile">
          <h3 className="contact-title">Contáctanos</h3>
          
          <div className="contact-item">
            <div className="contact-icon-wrapper">
              <Icons.WhatsApp className="contact-icon whatsapp-icon" />
            </div>
            <div className="contact-details">
              <span className="contact-label">WhatsApp</span>
              <a 
                href="https://wa.me/51952682285" 
                className="contact-link"
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
              >
                +51 952 682 285
              </a>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon-wrapper">
              <Icons.Mail className="contact-icon mail-icon" />
            </div>
            <div className="contact-details">
              <span className="contact-label">Email</span>
              <a 
                href="mailto:info@qhatu.com" 
                className="contact-link"
                onClick={onClose}
              >
                info@qhatu.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer del menú SOLO en móvil */}
        <div className="navigation-footer">
          <p className="navigation-footer-text">
            © 2024 Qhatu. Todos los derechos reservados.
          </p>
        </div>
      </nav>
    </>
  );
};

export default Navigation;