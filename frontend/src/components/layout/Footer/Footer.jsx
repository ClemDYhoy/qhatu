import React from 'react';
import './Footer.css';

const Footer = () => {
return (
    <footer className="footer">
        <div className="container">
            <div className="footer-content">
            <div className="footer-section">
                <h4>Qhatu Marca</h4>
                <p>Conectando hispanohablantes con productos importados de calidad.</p>
            </div>
            
            <div className="footer-section">
                <h4>Enlaces Rápidos</h4>
                <ul>
                <li><a href="/">Inicio</a></li>
                <li><a href="/products">Productos</a></li>
                <li><a href="/about">Nosotros</a></li>
                <li><a href="/contact">Contacto</a></li>
                </ul>
            </div>
            
            <div className="footer-section">
                <h4>Contacto</h4>
                <p>Email: info@qhatumarca.com</p>
                <p>WhatsApp: +1 (123) 456-7890</p>
            </div>
            </div>
            
            <div className="footer-bottom">
            <p>&copy; 2024 Qhatu Marca. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>
);
};

export default Footer;