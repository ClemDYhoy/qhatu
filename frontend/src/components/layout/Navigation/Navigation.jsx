import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const location = useLocation();

const navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/products', label: 'Productos' },
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/contact', label: 'Contacto' },
];
6
const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
};

const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
};

return (
    <>
    {/* Botón de menú móvil */}
    <button 
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Abrir menú de navegación"
    >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
    </button>

    {/* Overlay para móvil */}
    {isMobileMenuOpen && (
        <div 
            className="mobile-menu-overlay"
            onClick={closeMobileMenu}
        ></div>
    )}

    {/* Navegación principal */}
    <nav className={`navigation ${isMobileMenuOpen ? 'navigation--open' : ''}`}>
        <ul className="navigation-list">
        {navItems.map((item) => (
            <li key={item.path} className="navigation-item">
                <Link
                    to={item.path}
                    className={`navigation-link ${
                    location.pathname === item.path ? 'navigation-link--active' : ''
                    }`}
                    onClick={closeMobileMenu}
                >
                    {item.label}
                </Link>
            </li>
        ))}
        </ul>

        {/* Información de contacto en móvil */}
        <div className="navigation-contact-mobile">
            <div className="contact-info">
                <span className="contact-label">WhatsApp:</span>
                <a 
                href="https://wa.me/1234567890" 
                className="contact-link"
                target="_blank"
                rel="noopener noreferrer"
                >
                +1 (123) 456-7890
                </a>
            </div>
            <div className="contact-info">
                <span className="contact-label">Email:</span>
                <a href="mailto:info@qhatumarca.com" className="contact-link">
                info@qhatumarca.com
                </a>
            </div>
        </div>
    </nav>
    </>
);
};

export default Navigation;