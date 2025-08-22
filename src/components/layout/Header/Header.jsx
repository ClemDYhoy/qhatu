import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../Navigation/Navigation';
import CartWidget from '../../cart/CartWidget/CartWidget';
import './Header.css';

const Header = () => {
return (
    <header className="header">
        <div className="container">
            <div className="header-content">
            <Link to="/" className="logo">
                <span className="logo-icon">🛍️</span>
                Oe!!
            </Link>
            
            <Navigation />
            
            <div className="header-actions">
                <CartWidget />
            </div>
            </div>
    </div>
    </header>
);
};

export default Header;