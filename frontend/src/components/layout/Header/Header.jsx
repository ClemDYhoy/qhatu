import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navigation from '../Navigation/Navigation';
import CartWidget from '../../cart/CartWidget/CartWidget';
import './Header.css';

import fresa from '../../../../public/fresa.png';

const Header = () => {
const [isScrolled, setIsScrolled] = useState(false);
const location = useLocation();

useEffect(() => {
    const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
}, []);

// Definir el contenido contextual según la ruta
const getContextualContent = () => {
    switch(location.pathname) {
    case '/':
        
    case '/products':
        return {
        title: 'Nuestros Productos',
        description: 'Descubre una amplia selección de nuestros productos cuidadosamente seleccionados para la comunidad.',
        image: fresa,
        alt: 'Catálogo de productos Oasis Elegante'
        };
    case '/nosotros':
        return {
        title: 'Nuestra Historia',
        description: 'Conoce más sobre nuestra misión de conectar a la comunidad hispanohablante con los mejores productos internacionales.',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=871&q=80',
        alt: 'Equipo de Oasis Elegante'
        };
    case '/contact':
        return {
        title: 'Contáctanos',
        description: 'Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo para cualquier consulta o soporte.',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=871&q=80',
        alt: 'Contacto Oasis Elegante'
        };
    default:
        return {
        title: 'Bienvenido a ¡OE!',
        description: 'La plataforma que conecta a hispanohablantes con productos importados de manera simple y óptima.',
        image: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
        alt: 'Oasis Elegante - Productos importados'
        };
    }
};

const contextualContent = getContextualContent();

return (
    <>
    <header className={`oe-header ${isScrolled ? 'oe-header-scrolled' : ''}`}>
        <div className="container">
        <div className="oe-header-content">
            <Link to="/" className="oe-logo-link">
                <img 
                src="../../../../public/logo-oe.png" 
                alt="Oe" 
                className="oe-logo-img"
                />
            </Link> 
            
            <Navigation />
            
            <div className="oe-header-actions">
            <CartWidget />
            </div>

            <button className="oe-menu-toggle" aria-label="Abrir menú">
            <span></span>
            <span></span>
            <span></span>
            </button>
        </div>
        </div>
    </header>

    {/* Sección contextual según la página */}
    <section className={`oe-contextual ${isScrolled ? 'oe-contextual-hidden' : ''}`}>
        <div className="container">
        <div className={`oe-contextual-content oe-contextual-${location.pathname.slice(1) || 'home'}`}>
            <div className="oe-contextual-image">
            <img 
                src={contextualContent.image} 
                alt={contextualContent.alt} 
            />
            </div>
            <div className="oe-contextual-text">
            <h1>{contextualContent.title}</h1>
            <p>{contextualContent.description}</p>
            
            {/* Contenido adicional específico por página */}
            {location.pathname === '/products' && (
                <div className="oe-contextual-actions">
                <button className="oe-btn oe-btn-outline">Filtrar Productos</button>
                </div>
            )}
            
            {location.pathname === '/nosotros' && (
                <div className="oe-contextual-stats">
                <div className="oe-stat">
                    <span className="oe-stat-number">20+</span>
                    <span className="oe-stat-label">Productos</span>
                </div>
                <div className="oe-stat">
                    <span className="oe-stat-number">1K+</span>
                    <span className="oe-stat-label">Clientes</span>
                </div>
                <div className="oe-stat">
                    <span className="oe-stat-number">1+</span>
                    <span className="oe-stat-label">Países</span>
                </div>
                </div>
            )}
            
            {location.pathname === '/contact' && (
                <div className="oe-contextual-contact">
                    <div className="oe-contact-method">
                    <span className="oe-contact-icon">📧</span>
                    <a href="mailto:info@oasiselegante.com" className="oe-contact-link">
                        info@oasiselegante.com
                    </a>
                    </div>
                    <div className="oe-contact-method">
                    <span className="oe-contact-icon">📱</span>
                    <a href="https://wa.me/1234567890" className="oe-contact-link" target="_blank" rel="noopener noreferrer">
                        +1 (123) 456-7890
                    </a>
                    </div>
                    <div className="oe-contact-method">
                    <span className="oe-contact-icon">🕒</span>
                    <span>Lun-Vie: 9AM - 6PM</span>
                    </div>
                    
                    <div className="oe-contact-actions">
                    <a href="mailto:info@oasiselegante.com" className="oe-contact-btn oe-contact-btn-primary">
                        <span>📧</span> Enviar Email
                    </a>
                    <a href="https://wa.me/1234567890" className="oe-contact-btn oe-contact-btn-secondary" target="_blank" rel="noopener noreferrer">
                        <span>💬</span> WhatsApp
                    </a>
                    </div>
                </div>
                )}
            </div>
        </div>
        </div>
    </section>
    </>
);
};

export default Header;