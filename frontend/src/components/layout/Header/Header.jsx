import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CartContext } from '../../../contexts/CartContext';
import { getProfile } from '../../../services/productService';
import Navigation from '../Navigation/Navigation';
import CartWidget from '../../cart/CartWidget/CartWidget';
import CartModal from '../../cart/CartModal/CartModal';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import './Header.css';

const Header = () => {
  const { cart } = useContext(CartContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Función para cargar usuario desde localStorage y validar con backend
  const loadUser = async () => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        // Primero cargar datos locales para respuesta rápida
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Luego validar con el backend
        const profile = await getProfile();
        
        // Actualizar con datos del servidor
        const updatedUser = {
          ...parsedUser,
          nombre: profile.nombre || parsedUser.nombre,
          email: profile.email || parsedUser.email,
          rol: profile.rol || profile.isAdmin ? 'admin' : 'usuario'
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error validating user:', error);
        // Si el token es inválido, limpiar todo
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  // Cargar usuario al montar y cuando cambie la ruta
  useEffect(() => {
    loadUser();
  }, [location.pathname]);

  // Listener para detectar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      loadUser();
    };

    // Listener para cambios en localStorage desde otras pestañas
    window.addEventListener('storage', handleStorageChange);

    // Listener personalizado para cambios en la misma pestaña
    window.addEventListener('userDataChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataChanged', handleStorageChange);
    };
  }, []);

  // Manejo de scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Logout mejorado
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);

    // Disparar evento personalizado para notificar el cambio
    window.dispatchEvent(new Event('userDataChanged'));

    // Cerrar todos los modales
    setIsCartOpen(false);
    setIsMobileMenuOpen(false);

    // Navegar al home
    navigate('/');
  };

  // Función para manejar el cierre de modales y actualizar estado
  const handleCloseLogin = () => {
    setShowLogin(false);
    loadUser(); // Recargar usuario después de cerrar login
  };

  const handleCloseRegister = () => {
    setShowRegister(false);
    loadUser(); // Recargar usuario después de cerrar registro
  };

  // Abrir carrito
  const handleOpenCart = () => {
    setIsCartOpen(true);
  };

  // Contenido contextual según la ruta
  const getContextualContent = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Bienvenido a tu spot de sabores',
          description:
            'Ramen, bebidas, snacks y un mundo de delicias reunidos en un único spot, listos para pedir súper fácil por WhatsApp.',
          image: 'https://i.ibb.co/VcrTmX1F/upscalemedia-transformed-1.png',
          alt: 'Qhatu',
        };
      case '/products':
        return {
          title: 'Nuestros Productos',
          description:
            'Descubre una amplia selección de nuestros productos cuidadosamente seleccionados para la comunidad.',
          image: 'https://i.ibb.co/VcrTmX1F/upscalemedia-transformed-1.png',
          alt: 'Catálogo de productos Qhatu',
        };
      case '/nosotros':
        return {
          title: 'Nuestra Historia',
          description:
            'Conoce más sobre nuestra misión de conectar a la comunidad hispanohablante con los mejores productos internacionales.',
          image: 'https://i.ibb.co/VcrTmX1F/upscalemedia-transformed-1.png',
          alt: 'Equipo de Qhatu',
        };
      case '/contact':
        return {
          title: 'Contáctanos',
          description:
            'Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo para cualquier consulta o soporte.',
          image:
            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=871&q=80',
          alt: 'Contacto Qhatu',
        };
      default:
        return {
          title: 'Bienvenido a Qhatu',
          description:
            'La plataforma que conecta a hispanohablantes con productos importados de manera simple y óptima.',
          image:
            'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&auto=format&fit=crop&w=870&q=80',
          alt: 'Qhatu - Productos importados',
        };
    }
  };

  const contextualContent = getContextualContent();

  return (
    <>
      <header className={`oe-header ${isScrolled ? 'oe-header-scrolled' : ''}`}>
        <div className="container">
          <div className="oe-header-content">
            {/* Logo */}
            <div className="oe-header-logo">
              <Link to="/" className="oe-logo-link">
                <img src="/logo-oe.png" alt="Qhatu" className="oe-logo-img" />
              </Link>
            </div>

            {/* Navigation */}
            <div className={`oe-header-nav ${isMobileMenuOpen ? 'oe-header-nav-open' : ''}`}>
              <Navigation />
            </div>

            {/* Actions */}
            <div className="oe-header-actions">
              {/* Cart Widget con contador */}
              <div className="cart-action" onClick={handleOpenCart}>
                <CartWidget />
                {cart && cart.length > 0 && (
                  <span className="cart-badge">{cart.length}</span>
                )}
              </div>

              <div className="oe-auth-buttons">
                {!isLoading && user ? (
                  <div className="user-menu flex-center gap-4">
                    {/* Menú de usuario con estilo premium */}
                    <div className="flex-center gap-3">
                      {/* Avatar/Icono de usuario */}
                      <div className="user-avatar flex-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="user-icon">
                          <path 
                            d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" 
                            stroke="currentColor" 
                            strokeWidth="1.5"
                          />
                          <path 
                            d="M20 21C20 19.6044 20 18.4067 19.8278 17.45C19.44 15.4321 17.8179 13.81 15.8 13.4222C14.8433 13.25 13.6456 13.25 12.25 13.25H11.75C10.3544 13.25 9.1567 13.25 8.2 13.4222C6.18207 13.81 4.56 15.4321 4.17221 17.45C4 18.4067 4 19.6044 4 21" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      
                      {/* Información del usuario */}
                      <div className="user-info text-right">
                        <span className="user-welcome text-sm text-tertiary">
                          ¡Hola!
                        </span>
                        <div className="user-name font-semibold text-primary">
                          {user.nombre}
                        </div>
                      </div>
                    </div>

                    {/* Separador visual */}
                    <div className="separator h-6 w-px bg-border-medium"></div>

                    {/* Botones de acción */}
                    <div className="user-actions flex-center gap-3">
                      {user.rol === 'admin' && (
                        <Link 
                          to="/admin" 
                          className="admin-link btn btn-outline btn-sm flex-center gap-2"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path 
                              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" 
                              stroke="currentColor" 
                              strokeWidth="1.5"
                            />
                            <path 
                              d="M19.4 15C19.2669 15.3998 19.216 15.5838 19.1867 15.7833C19.0938 16.4494 18.5526 17.0696 17.8 17.2C17.6 17.2333 17.3333 17.2333 16.8 17.2333C16.5035 17.2333 16.2599 17.477 16.2417 17.7732C16.2255 18.0351 16.2174 18.166 16.1947 18.2866C16.0894 18.8458 15.6458 19.2894 15.0866 19.3947C14.966 19.4174 14.8351 19.4255 14.5732 19.4417C14.277 19.4599 14.0333 19.7035 14.0333 20V20C14.0333 20.4667 14.0333 20.7 13.9958 20.8882C13.6839 22.2568 11.9835 22.7183 10.9118 21.755C10.765 21.625 10.5402 21.4002 10.0907 20.9507L9.04933 19.9093C8.59978 19.4598 8.375 19.235 8.245 19.0882C7.28166 18.0165 7.74318 16.3161 9.11183 16.0042C9.30004 15.9667 9.53333 15.9667 10 15.9667C10.2965 15.9667 10.5401 15.723 10.5583 15.4268C10.5745 15.1649 10.5826 15.034 10.6053 14.9134C10.7106 14.3542 11.1542 13.9106 11.7134 13.8053C11.834 13.7826 11.9649 13.7745 12.2268 13.7583C12.523 13.7401 12.7667 13.4965 12.7667 13.2V13.2C12.7667 12.7333 12.7667 12.5 12.8042 12.3118C13.1161 10.9432 14.8165 10.4817 15.8882 11.445C16.035 11.575 16.2598 11.7998 16.7093 12.2493L17.7507 13.2907C18.2002 13.7402 18.425 13.965 18.5718 14.1118C19.5351 15.1835 19.0736 16.8839 17.705 17.1958C17.5168 17.2333 17.2833 17.2333 16.8167 17.2333" 
                              stroke="currentColor" 
                              strokeWidth="1.5" 
                              strokeLinecap="round"
                            />
                          </svg>
                          Panel Admin
                        </Link>
                      )}
                      
                      <button 
                        className="logout-btn btn btn-accent btn-sm flex-center gap-2"
                        onClick={handleLogout}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path 
                            d="M15 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H15" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round"
                          />
                          <path 
                            d="M10 12H3M3 12L6 9M3 12L6 15" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                ) : !isLoading ? (
                  <>
                    <button 
                      className="oe-login-btn" 
                      onClick={() => setShowLogin(true)}
                    >
                      Iniciar
                    </button>
                    <button 
                      className="oe-register-btn" 
                      onClick={() => setShowRegister(true)}
                    >
                      Registrarse
                    </button>
                  </>
                ) : (
                  <div className="loading-auth">Cargando...</div>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={`oe-menu-toggle ${isMobileMenuOpen ? 'oe-menu-toggle-open' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Abrir menú"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Sección contextual */}
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
                    <a href="mailto:info@qhatu.com" className="oe-contact-link">
                      info@qhatu.com
                    </a>
                  </div>
                  <div className="oe-contact-method">
                    <span className="oe-contact-icon">📱</span>
                    <a
                      href="https://wa.me/952682285"
                      className="oe-contact-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      +1 (123) 456-7890
                    </a>
                  </div>
                  <div className="oe-contact-method">
                    <span className="oe-contact-icon">🕒</span>
                    <span>Lun-Vie: 9AM - 6PM</span>
                  </div>
                  <div className="oe-contact-actions">
                    <a href="mailto:info@qhatu.com" className="oe-contact-btn oe-contact-btn-primary">
                      <span>📧</span> Enviar Email
                    </a>
                    <a
                      href="https://wa.me/952682285"
                      className="oe-contact-btn oe-contact-btn-secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modals */}
      {showLogin && (
        <Login
          onClose={handleCloseLogin}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <Register
          onClose={handleCloseRegister}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}

      {isCartOpen && (
        <CartModal 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />
      )}
    </>
  );
};

export default Header;