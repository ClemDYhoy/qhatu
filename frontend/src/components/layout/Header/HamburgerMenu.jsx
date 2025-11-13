// C:\qhatu\frontend\src\components\layout\Header\HamburgerMenu.jsx
import React from 'react';
import './HamburgerMenu.css';

const HamburgerMenu = ({ isOpen, onClick, className = '' }) => {
  return (
    <button
      className={`hamburger-menu ${isOpen ? 'hamburger-menu--open' : ''} ${className}`}
      onClick={onClick}
      aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      aria-expanded={isOpen}
      type="button"
    >
      <span className="hamburger-menu__line hamburger-menu__line--top" />
      <span className="hamburger-menu__line hamburger-menu__line--middle" />
      <span className="hamburger-menu__line hamburger-menu__line--bottom" />
    </button>
  );
};

export default HamburgerMenu;