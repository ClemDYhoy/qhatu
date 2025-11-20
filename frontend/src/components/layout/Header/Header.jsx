// C:\qhatu\frontend\src\components\layout\Header\Header.jsx
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../../contexts/CartContext';
import Navigation from '../Navigation/Navigation';
import CartWidget from '../../cart/CartWidget/CartWidget';
import CartModal from '../../cart/CartModal/CartModal';
import UserMenu from './UserMenu/UserMenu';
import authService from '../../../services/authService';
import './Header.css';

const Header = () => {
  // ====================================
  // 📦 CONTEXTOS Y HOOKS
  // ====================================
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const lastScrollY = useRef(0);
  const rafId = useRef(null);

  // ====================================
  // 🎯 ESTADOS
  // ====================================
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // ====================================
  // 🔐 VERIFICACIÓN DE RUTAS Y ROLES
  // ====================================
  const isStaffRoute = useCallback(() => {
    return location.pathname.startsWith('/admin') || 
           location.pathname.startsWith('/vendedor') || 
           location.pathname.startsWith('/almacenero');
  }, [location.pathname]);

  const isStaffUser = useCallback((userRole) => {
    return ['super_admin', 'vendedor', 'almacenero'].includes(userRole);
  }, []);

  // ====================================
  // 👤 CARGAR USUARIO
  // ====================================
  const loadUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser || null);
    } catch (error) {
      console.error('❌ Error al cargar usuario:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ====================================
  // 🔄 ACTUALIZAR USUARIO
  // ====================================
  const handleUserUpdate = useCallback((updatedUser) => {
    console.log('✅ Usuario actualizado en Header:', updatedUser);
    setUser(updatedUser);
    authService.setUser(updatedUser);
    window.dispatchEvent(new CustomEvent('userDataChanged', { 
      detail: updatedUser 
    }));
  }, []);

  // ====================================
  // 🛒 HANDLERS DEL CARRITO
  // ====================================
  const handleOpenCart = useCallback(() => {
    console.log('🛒 Header: Abriendo carrito modal');
    setIsCartOpen(true);
  }, []);

  const handleCloseCart = useCallback(() => {
    console.log('🛒 Header: Cerrando carrito modal');
    setIsCartOpen(false);
  }, []);

  // ====================================
  // 🎬 EFECTOS DE INICIALIZACIÓN
  // ====================================
  useEffect(() => {
    loadUser();
  }, [loadUser, location.pathname]);

  useEffect(() => {
    const handleStorageChange = () => {
      console.log('🔄 Detectado cambio en storage/usuario');
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataChanged', handleStorageChange);
    };
  }, [loadUser]);

  // ====================================
  // 🛒 LISTENER PARA EVENTO DE CARRITO
  // ====================================
  useEffect(() => {
    const handleOpenCartEvent = (event) => {
      console.log('📡 Header: Evento openCartModal recibido', event.detail);
      handleOpenCart();
    };

    window.addEventListener('openCartModal', handleOpenCartEvent);
    
    return () => {
      window.removeEventListener('openCartModal', handleOpenCartEvent);
    };
  }, [handleOpenCart]);

  // ====================================
  // 📜 MANEJO DE SCROLL OPTIMIZADO
  // ====================================
  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDifference = currentScrollY - lastScrollY.current;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = documentHeight > 0 ? (currentScrollY / documentHeight) * 100 : 0;

        setIsScrolled(currentScrollY > 80);
        setScrollProgress(Math.min(progress, 100));

        if (currentScrollY > 300) {
          if (scrollDifference > 0) {
            setIsVisible(false);
          } else if (scrollDifference < -5) {
            setIsVisible(true);
          }
        } else {
          setIsVisible(true);
        }

        lastScrollY.current = currentScrollY;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // ====================================
  // 🚪 LOGOUT
  // ====================================
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsCartOpen(false);
      setIsMobileMenuOpen(false);
      document.body.style.overflow = '';
      console.log('✅ Logout exitoso');
      navigate('/');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  }, [navigate]);

  // ====================================
  // 🔐 NAVEGACIÓN A MODALES DE AUTH
  // ====================================
  const handleOpenLogin = useCallback(() => {
    navigate('/login', { 
      state: { backgroundLocation: location } 
    });
  }, [navigate, location]);

  const handleOpenRegister = useCallback(() => {
    navigate('/register', { 
      state: { backgroundLocation: location } 
    });
  }, [navigate, location]);

  // ====================================
  // 📱 MENÚ MÓVIL
  // ====================================
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => {
      const newState = !prev;
      document.body.style.overflow = newState ? 'hidden' : '';
      return newState;
    });
  }, []);

  // ====================================
  // 📱 CERRAR MENÚ MÓVIL AL CAMBIAR RUTA
  // ====================================
  useEffect(() => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  // ====================================
  // 🎭 VARIABLES DERIVADAS
  // ====================================
  const hideHeaderContent = isStaffRoute();
  const showCart = !hideHeaderContent && !isStaffUser(user?.rol_nombre);
  
  // ✅ FIX: Cálculo correcto del contador de items
  // cart es un objeto { items: [], total: 0, ... }, NO un array
  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  // ====================================
  // 🎨 RENDER PRINCIPAL
  // ====================================
  return (
    <>
      <div className="app-header">
        <header 
          className={`qh-header ${isScrolled ? 'qh-header--scrolled' : ''} ${isVisible ? 'qh-header--visible' : 'qh-header--hidden'}`}
          role="banner"
        >
          <div className="qh-header__container">
            <div className="qh-header__content">
              
              {/* ===== LOGO ===== */}
              <div className="qh-header__logo">
                <Link 
                  to="/" 
                  className="qh-logo"
                  aria-label="Qhatu - Ir al inicio"
                >
                  <img
                    src="/logo-oe.png"
                    alt="Qhatu"
                    className="qh-logo__image"
                    loading="eager"
                  />
                  <span className="qh-logo__glow" aria-hidden="true"></span>
                </Link>
              </div>

              {/* ===== NAVEGACIÓN (SOLO CLIENTES) ===== */}
              {!hideHeaderContent && (
                <nav 
                  className={`qh-header__nav ${isMobileMenuOpen ? 'qh-header__nav--open' : ''}`}
                  aria-label="Navegación principal"
                  id="main-navigation"
                >
                  <Navigation />
                </nav>
              )}

              {/* ===== ACCIONES DEL USUARIO ===== */}
              <div className="qh-header__actions">
                
                {/* CARRITO (SOLO PARA CLIENTES) */}
                {showCart && (
                  <div className="qh-header__cart">
                    {/* ✅ FIX: Pasar onClick directamente */}
                    <CartWidget 
                      onClick={handleOpenCart}
                    />
                    {cartItemsCount > 0 && (
                      <span className="qh-cart-button__pulse" aria-hidden="true"></span>
                    )}
                  </div>
                )}

                {/* AUTENTICACIÓN */}
                <div className="qh-header__auth">
                  {isLoading ? (
                    <div className="qh-auth-loading" aria-live="polite">
                      <div className="qh-spinner">
                        <div className="qh-spinner__circle"></div>
                      </div>
                      <span className="sr-only">Cargando usuario...</span>
                    </div>
                  ) : user ? (
                    <UserMenu 
                      user={user} 
                      onLogout={handleLogout}
                      onUserUpdate={handleUserUpdate}
                    />
                  ) : (
                    <div className="qh-auth-buttons">
                      <button 
                        className="qh-btn qh-btn--ghost" 
                        onClick={handleOpenLogin}
                        aria-label="Iniciar sesión"
                      >
                        <span>Iniciar sesión</span>
                      </button>
                      <button 
                        className="qh-btn qh-btn--primary" 
                        onClick={handleOpenRegister}
                        aria-label="Crear cuenta nueva"
                      >
                        <span>Registrarse</span>
                        <span className="qh-btn__shine" aria-hidden="true"></span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ===== MENÚ MÓVIL (SOLO CLIENTES) ===== */}
              {!hideHeaderContent && (
                <button
                  className={`qh-menu-toggle ${isMobileMenuOpen ? 'qh-menu-toggle--active' : ''}`}
                  onClick={toggleMobileMenu}
                  aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="main-navigation"
                >
                  <span className="qh-menu-toggle__line" aria-hidden="true"></span>
                  <span className="qh-menu-toggle__line" aria-hidden="true"></span>
                  <span className="qh-menu-toggle__line" aria-hidden="true"></span>
                </button>
              )}
            </div>
          </div>

          {/* BARRA DE PROGRESO DE SCROLL */}
          {isScrolled && (
            <div className="qh-header__progress" aria-hidden="true">
              <div 
                className="qh-header__progress-bar"
                style={{ width: `${scrollProgress}%` }}
              ></div>
            </div>
          )}
        </header>

        {/* OVERLAY MÓVIL */}
        {isMobileMenuOpen && !hideHeaderContent && (
          <div 
            className="qh-mobile-overlay"
            onClick={toggleMobileMenu}
            aria-hidden="true"
          ></div>
        )}

        {/* MODAL DEL CARRITO */}
        {isCartOpen && !hideHeaderContent && (
          <CartModal 
            isOpen={isCartOpen} 
            onClose={handleCloseCart}
          />
        )}
      </div>
    </>
  );
};

export default React.memo(Header);