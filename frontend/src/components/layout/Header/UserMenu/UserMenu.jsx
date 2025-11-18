// C:\qhatu\frontend\src\components\layout\Header\UserMenu\UserMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../../../services/authService';
import UserProfile from '../../UserProfile/UserProfile';
import './UserMenu.css';

const UserMenu = ({ user, onLogout, onUserUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Debug: Log cuando cambia isProfileOpen
  useEffect(() => {
    console.log('🔄 isProfileOpen cambió a:', isProfileOpen);
  }, [isProfileOpen]);

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
    Settings: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"/>
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
  // 🔒 VERIFICAR ROL
  // ====================================
  const isStaff = ['super_admin', 'vendedor', 'almacenero'].includes(user?.rol_nombre);
  const isCliente = user?.rol_nombre === 'cliente';

  // ====================================
  // 🖱️ CERRAR MENÚ AL PRESIONAR ESC
  // ====================================
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (isOpen) setIsOpen(false);
        if (isProfileOpen) setIsProfileOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, isProfileOpen]);

  // ====================================
  // 🚀 ACCIONES
  // ====================================
  const closeMenu = () => {
    console.log('🔒 Cerrando menú dropdown');
    setIsOpen(false);
  };

  const handleMenuItemClick = (path) => {
    console.log('🔗 Navegando a:', path);
    closeMenu();
    if (path) {
      navigate(path);
    }
  };

  const handleProfileClick = () => {
    console.log('👤 Abriendo panel de perfil...');
    closeMenu();
    setIsProfileOpen(true);
    
    // Agregar clase al body
    document.body.classList.add('profile-panel-open');
  };

  const handleCloseProfile = () => {
    console.log('❌ Cerrando panel de perfil...');
    setIsProfileOpen(false);
    document.body.classList.remove('profile-panel-open');
  };

  const handleLogoutClick = async () => {
    console.log('🚪 Cerrando sesión...');
    closeMenu();
    try {
      await onLogout();
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  };

  // ====================================
  // 🎨 UTILIDADES
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

  const getFirstName = () => {
    return user?.nombre_completo?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario';
  };

  const getRoleBadgeConfig = () => {
    const roleMap = {
      super_admin: { icon: '👑', label: 'Administrador' },
      vendedor: { icon: '💼', label: 'Vendedor' },
      almacenero: { icon: '📦', label: 'Almacenero' },
      cliente: { icon: '🛍️', label: 'Cliente' }
    };
    return roleMap[user?.rol_nombre] || { icon: '👤', label: 'Usuario' };
  };

  // ====================================
  // 🎨 COMPONENTES INTERNOS
  // ====================================
  const UserAvatar = ({ size = 'small' }) => {
    const isLarge = size === 'large';
    const className = isLarge ? 'user-avatar-large' : 'user-avatar-circle';
    const initialsClassName = isLarge ? 'user-initials-large' : 'user-initials';

    return (
      <div className={className}>
        {user?.foto_perfil_url ? (
          <img 
            src={user.foto_perfil_url} 
            alt={user.nombre_completo || 'Usuario'} 
            loading="lazy"
          />
        ) : (
          <span className={initialsClassName}>{getInitials()}</span>
        )}
      </div>
    );
  };

  const MenuHeader = () => {
    const roleBadge = getRoleBadgeConfig();
    
    return (
      <div className="user-menu-header">
        <UserAvatar size="large" />
        <div className="user-details">
          <h4 className="user-full-name">{user?.nombre_completo || 'Usuario'}</h4>
          <p className="user-email">{user?.email}</p>
          <span className={`user-role-badge role-${user?.rol_nombre}`}>
            {roleBadge.icon} {roleBadge.label}
          </span>
        </div>
      </div>
    );
  };

  const MenuItem = ({ icon: IconComponent, label, onClick, className = '' }) => (
    <button 
      className={`user-menu-item ${className}`}
      onClick={onClick}
      type="button"
    >
      <IconComponent />
      <span>{label}</span>
    </button>
  );

  const MenuDivider = () => <div className="user-menu-divider" />;

  // ====================================
  // 🎯 OPCIONES DE MENÚ
  // ====================================
  const staffMenuItems = [
    {
      icon: Icon.Dashboard,
      label: 'Mi Dashboard',
      onClick: () => handleMenuItemClick(authService.getRedirectRoute(user.rol_nombre))
    }
  ];

  const clientMenuItems = [
    { icon: Icon.ShoppingBag, label: 'Mis Pedidos', path: '/mis-pedidos' },
    { icon: Icon.Heart, label: 'Favoritos', path: '/favoritos' },
    { icon: Icon.MapPin, label: 'Mis Direcciones', path: '/direcciones' },
    { icon: Icon.CreditCard, label: 'Métodos de Pago', path: '/metodos-pago' }
  ];

  const commonMenuItems = [
    { icon: Icon.Settings, label: 'Configuración', path: '/configuracion' },
    { icon: Icon.HelpCircle, label: 'Ayuda y Soporte', path: '/ayuda' }
  ];

  // ====================================
  // 🎨 RENDER
  // ====================================
  return (
    <>
      <div className="user-menu-wrapper" ref={menuRef}>
        {/* Botón del usuario */}
        <button 
          className={`user-menu-trigger ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menú de usuario"
          aria-expanded={isOpen}
          aria-haspopup="true"
          type="button"
        >
          <UserAvatar size="small" />
          
          <div className="user-info-compact">
            <span className="user-greeting">¡Hola!</span>
            <span className="user-name-short">{getFirstName()}</span>
          </div>
          
          <Icon.ChevronDown />
        </button>

        {/* Overlay + Dropdown Menu */}
        {isOpen && (
          <>
            <div 
              className="user-menu-overlay" 
              onClick={closeMenu}
              aria-hidden="true"
            />
            
            <div 
              className="user-menu-dropdown"
              role="menu"
              aria-label="Opciones de usuario"
            >
              <MenuHeader />
              <MenuDivider />

              {/* Mi Perfil - CON DEBUG */}
              <MenuItem
                icon={Icon.User}
                label="Mi Perfil"
                onClick={() => {
                  console.log('🖱️ Click en Mi Perfil');
                  handleProfileClick();
                }}
              />

              <MenuDivider />

              {/* Opciones para STAFF */}
              {isStaff && (
                <>
                  {staffMenuItems.map((item, index) => (
                    <MenuItem
                      key={`staff-${index}`}
                      icon={item.icon}
                      label={item.label}
                      onClick={item.onClick}
                    />
                  ))}
                  <MenuDivider />
                </>
              )}

              {/* Opciones para CLIENTES */}
              {isCliente && (
                <>
                  {clientMenuItems.map((item, index) => (
                    <MenuItem
                      key={`client-${index}`}
                      icon={item.icon}
                      label={item.label}
                      onClick={() => handleMenuItemClick(item.path)}
                    />
                  ))}
                  <MenuDivider />
                </>
              )}

              {/* Opciones comunes */}
              {commonMenuItems.map((item, index) => (
                <MenuItem
                  key={`common-${index}`}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => handleMenuItemClick(item.path)}
                />
              ))}

              <MenuDivider />

              {/* Logout */}
              <MenuItem
                icon={Icon.LogOut}
                label="Cerrar Sesión"
                onClick={handleLogoutClick}
                className="logout-item"
              />
            </div>
          </>
        )}
      </div>

      {/* Panel lateral de perfil */}
      <UserProfile
        isOpen={isProfileOpen}
        onClose={handleCloseProfile}
        user={user}
        onUserUpdate={onUserUpdate}
      />
    </>
  );
};

export default UserMenu;