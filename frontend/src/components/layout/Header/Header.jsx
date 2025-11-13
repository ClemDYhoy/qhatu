// C:\qhatu\frontend\src\components\layout\Header\Header.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../../contexts/CartContext';
import Navigation from '../Navigation/Navigation';
import CartWidget from '../../cart/CartWidget/CartWidget';
import CartModal from '../../cart/CartModal/CartModal';
import UserMenu from './UserMenu/UserMenu';
import authService from '../../../services/authService';
import './Header.css';

const Header = () => {
  const { cart } = useContext(CartContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // ====================================
  // 🔐 VERIFICAR SI EL USUARIO ES STAFF
  // ====================================
  const isStaffRoute = () => {
    return location.pathname.startsWith('/admin') || 
           location.pathname.startsWith('/vendedor') || 
           location.pathname.startsWith('/almacenero');
  };

  const isStaffUser = (userRole) => {
    return ['super_admin', 'vendedor', 'almacenero'].includes(userRole);
  };

  // ====================================
  // 👤 CARGAR USUARIO
  // ====================================
  const loadUser = async () => {
    setIsLoading(true);
    const currentUser = authService.getCurrentUser();

    if (currentUser) {
      setUser(currentUser);
      console.log('✅ Usuario cargado:', currentUser.email, '| Rol:', currentUser.rol_nombre);
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  

  // Listener para cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataChanged', handleStorageChange);
    };
  }, []);

  // ====================================
  // 📜 MANEJO DE SCROLL
  // ====================================
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ====================================
  // 🚪 LOGOUT
  // ====================================
  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setIsCartOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // ====================================
  // 🔐 NAVEGACIÓN A MODALES DE AUTH
  // ====================================
  const handleOpenLogin = () => {
    navigate('/login', { 
      state: { backgroundLocation: location } 
    });
  };

  const handleOpenRegister = () => {
    navigate('/register', { 
      state: { backgroundLocation: location } 
    });
  };

  // ====================================
  // 🛒 CARRITO - Listener para el evento
  // ====================================
  useEffect(() => {
    const handleOpenCartEvent = () => {
      setIsCartOpen(true);
    };

    window.addEventListener('openCartModal', handleOpenCartEvent);

    return () => {
      window.removeEventListener('openCartModal', handleOpenCartEvent);
    };
  }, []);

  const handleOpenCart = () => {
    setIsCartOpen(true);
  };

  // ====================================
  // 🎨 CONTENIDO CONTEXTUAL
  // ====================================
  const getContextualContent = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Bienvenido a tu spot de sabores',
          description: 'Ramen, bebidas, snacks y un mundo de delicias reunidos en un único spot.',
          image: 'https://i.ibb.co/VcrTmX1F/upscalemedia-transformed-1.png',
          alt: 'Qhatu',
        };
      case '/products':
        return {
          title: 'Nuestros Productos',
          description: 'Descubre una amplia selección de productos cuidadosamente seleccionados.',
          image: 'https://i.ibb.co/VcrTmX1F/upscalemedia-transformed-1.png',
          alt: 'Catálogo de productos Qhatu',
        };
      case '/nosotros':
        return {
          title: 'Nuestra Historia',
          description: 'Conoce más sobre nuestra misión de conectar comunidades con los mejores productos.',
          image: 'https://i.ibb.co/VcrTmX1F/upscalemedia-transformed-1.png',
          alt: 'Equipo de Qhatu',
        };
      case '/contact':
        return {
          title: 'Contáctanos',
          description: 'Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo.',
          image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=871&q=80',
          alt: 'Contacto Qhatu',
        };
      default:
        return {
          title: 'Bienvenido a Qhatu',
          description: 'Tu plataforma de productos importados.',
          image: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=870&q=80',
          alt: 'Qhatu',
        };
    }
  };

  const contextualContent = getContextualContent();
  const hideHeaderContent = isStaffRoute();

  // ====================================
  // 🎨 RENDER
  // ====================================
  return (
    <>
      <header className={`oe-header ${isScrolled ? 'oe-header-scrolled' : ''}`}>
        <div className="container">
          <div className="oe-header-content">
            {/* ========== LOGO ========== */}
            <div className="oe-header-logo">
              <Link to="/" className="oe-logo-link">
                <img src="/logo-oe.png" alt="Qhatu" className="oe-logo-img" />
              </Link>
            </div>

            {/* ========== NAVEGACIÓN (SOLO CLIENTES) ========== */}
            {!hideHeaderContent && (
              <div className={`oe-header-nav ${isMobileMenuOpen ? 'oe-header-nav-open' : ''}`}>
                <Navigation />
              </div>
            )}

            {/* ========== ACCIONES ========== */}
            <div className="oe-header-actions">
              {/* CARRITO (SOLO PARA CLIENTES) */}
              {!hideHeaderContent && !isStaffUser(user?.rol_nombre) && (
                <div className="cart-action">
                  <CartWidget />
                </div>
              )}

              {/* USUARIO AUTENTICADO */}
              <div className="oe-auth-buttons">
                {!isLoading && user ? (
                  <UserMenu user={user} onLogout={handleLogout} />
                ) : !isLoading ? (
                  <>
                    <button 
                      className="oe-login-btn" 
                      onClick={handleOpenLogin}
                    >
                      Iniciar
                    </button>
                    <button 
                      className="oe-register-btn" 
                      onClick={handleOpenRegister}
                    >
                      Registrarse
                    </button>
                  </>
                ) : (
                  <div className="loading-auth">Cargando...</div>
                )}
              </div>
            </div>

            {/* ========== MOBILE MENU (SOLO CLIENTES) ========== */}
            {!hideHeaderContent && (
              <button
                className={`oe-menu-toggle ${isMobileMenuOpen ? 'oe-menu-toggle-open' : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Abrir menú"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========== SECCIÓN CONTEXTUAL (SOLO RUTAS PÚBLICAS) ========== */}
      {!hideHeaderContent && (
        <section className={`oe-contextual ${isScrolled ? 'oe-contextual-hidden' : ''}`}>
          <div className="container">
            <div className={`oe-contextual-content oe-contextual-${location.pathname.slice(1) || 'home'}`}>
              <div className="oe-contextual-image">
                <img src={contextualContent.image} alt={contextualContent.alt} />
              </div>
              <div className="oe-contextual-text">
                <h1>{contextualContent.title}</h1>
                <p>{contextualContent.description}</p>

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
                  </div>
                )}

                {location.pathname === '/contact' && (
                  <div className="oe-contextual-contact">
                    <div className="oe-contact-method">
                      <span className="oe-contact-icon">📧</span>
                      <a href="mailto:info@qhatu.com" className="oe-contact-link">
                        info@qhatu.com
                      </a>
                    </div>
                    <div className="oe-contact-method">
                      <span className="oe-contact-icon">📱</span>
                      <a href="https://wa.me/952682285" className="oe-contact-link" target="_blank" rel="noopener noreferrer">
                        +51 952 682 285
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== MODAL DE CARRITO ========== */}
      {isCartOpen && !hideHeaderContent && (
        <CartModal 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />
      )}
    </>
  );
};

export default Header;