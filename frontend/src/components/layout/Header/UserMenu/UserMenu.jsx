// C:\qhatu\frontend\src\components\layout\Header\UserMenu\UserMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../../../services/authService';
import './UserMenu.css';

const UserMenu = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // ====================================
  // 🎨 ICONOS SVG
  // ====================================
  const Icon = {
    User: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    Settings: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"/>
      </svg>
    ),
    ShoppingBag: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    Heart: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    MapPin: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    CreditCard: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    HelpCircle: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    LogOut: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
    Dashboard: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    ChevronDown: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    )
  };

  // ====================================
  // 🔒 VERIFICAR SI ES STAFF
  // ====================================
  const isStaff = ['super_admin', 'vendedor', 'almacenero'].includes(user?.rol_nombre);
  const isCliente = user?.rol_nombre === 'cliente';

  // ====================================
  // 🖱️ CERRAR MENÚ AL HACER CLICK FUERA
  // ====================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ====================================
  // 🚀 ACCIONES
  // ====================================
  const handleMenuItemClick = (path) => {
    setIsOpen(false);
    if (path) {
      navigate(path);
    }
  };

  const handleLogoutClick = async () => {
    setIsOpen(false);
    await onLogout();
  };

  // ====================================
  // 🎨 OBTENER INICIALES
  // ====================================
  const getInitials = () => {
    if (user?.nombre_completo) {
      return user.nombre_completo
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  // ====================================
  // 🎨 RENDER
  // ====================================
  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      {/* Botón del usuario */}
      <button 
        className={`user-menu-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menú de usuario"
      >
        <div className="user-avatar-circle">
          {user?.foto_perfil_url ? (
            <img src={user.foto_perfil_url} alt={user.nombre_completo} />
          ) : (
            <span className="user-initials">{getInitials()}</span>
          )}
        </div>
        
        <div className="user-info-compact">
          <span className="user-greeting">¡Hola!</span>
          <span className="user-name-short">
            {user?.nombre_completo?.split(' ')[0] || user?.email}
          </span>
        </div>
        
        <Icon.ChevronDown />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="user-menu-dropdown">
          {/* Header del menú */}
          <div className="user-menu-header">
            <div className="user-avatar-large">
              {user?.foto_perfil_url ? (
                <img src={user.foto_perfil_url} alt={user.nombre_completo} />
              ) : (
                <span className="user-initials-large">{getInitials()}</span>
              )}
            </div>
            <div className="user-details">
              <h4 className="user-full-name">{user?.nombre_completo || 'Usuario'}</h4>
              <p className="user-email">{user?.email}</p>
              <span className={`user-role-badge role-${user?.rol_nombre}`}>
                {user?.rol_nombre === 'super_admin' && '👑 Administrador'}
                {user?.rol_nombre === 'vendedor' && '💼 Vendedor'}
                {user?.rol_nombre === 'almacenero' && '📦 Almacenero'}
                {user?.rol_nombre === 'cliente' && '🛍️ Cliente'}
              </span>
            </div>
          </div>

          <div className="user-menu-divider"></div>

          {/* Opciones para STAFF */}
          {isStaff && (
            <>
              <Link 
                to={authService.getRedirectRoute(user.rol_nombre)}
                className="user-menu-item"
                onClick={() => handleMenuItemClick()}
              >
                <Icon.Dashboard />
                <span>Mi Dashboard</span>
              </Link>
              <div className="user-menu-divider"></div>
            </>
          )}

          {/* Opciones para CLIENTES */}
          {isCliente && (
            <>
              <button 
                className="user-menu-item"
                onClick={() => handleMenuItemClick('/perfil')}
              >
                <Icon.User />
                <span>Mi Perfil</span>
              </button>

              <button 
                className="user-menu-item"
                onClick={() => handleMenuItemClick('/mis-pedidos')}
              >
                <Icon.ShoppingBag />
                <span>Mis Pedidos</span>
              </button>

              <button 
                className="user-menu-item"
                onClick={() => handleMenuItemClick('/favoritos')}
              >
                <Icon.Heart />
                <span>Favoritos</span>
              </button>

              <button 
                className="user-menu-item"
                onClick={() => handleMenuItemClick('/direcciones')}
              >
                <Icon.MapPin />
                <span>Mis Direcciones</span>
              </button>

              <button 
                className="user-menu-item"
                onClick={() => handleMenuItemClick('/metodos-pago')}
              >
                <Icon.CreditCard />
                <span>Métodos de Pago</span>
              </button>

              <div className="user-menu-divider"></div>
            </>
          )}

          {/* Opciones comunes */}
          <button 
            className="user-menu-item"
            onClick={() => handleMenuItemClick('/configuracion')}
          >
            <Icon.Settings />
            <span>Configuración</span>
          </button>

          <button 
            className="user-menu-item"
            onClick={() => handleMenuItemClick('/ayuda')}
          >
            <Icon.HelpCircle />
            <span>Ayuda y Soporte</span>
          </button>

          <div className="user-menu-divider"></div>

          {/* Logout */}
          <button 
            className="user-menu-item logout-item"
            onClick={handleLogoutClick}
          >
            <Icon.LogOut />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;