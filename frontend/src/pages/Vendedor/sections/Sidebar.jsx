// src/pages/Vendedor/sections/Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

// SVG Icons
const Icons = {
  Home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  ShoppingCart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  History: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.04h16.94a2 2 0 0 0 1.71-3.04l-8.47-14.14a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  SmartToy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <rect x="8" y="6" width="8" height="8" rx="1" />
      <circle cx="9" cy="17" r="1" />
      <circle cx="15" cy="17" r="1" />
      <line x1="12" y1="19" x2="12" y2="20" />
    </svg>
  ),
  LogOut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  ArrowLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  TrendingUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
};

const Sidebar = ({ activeSection, setActiveSection, user }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: 'Home' },
    { id: 'ventas-pendientes', label: 'Ventas Pendientes', icon: 'ShoppingCart' },
    { id: 'historial', label: 'Historial de Ventas', icon: 'History' },
    { id: 'analytics', label: 'Mis Estadísticas', icon: 'TrendingUp' },
    { id: 'inventario', label: 'Alertas de Inventario', icon: 'Warning' },
    { id: 'ia-asistente', label: 'Asistente IA', icon: 'SmartToy' },
  ];

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
  };

  const handleLogout = () => {
    // Limpiar datos de sesión si es necesario
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="vendedor-sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="header-brand">
          <div className="brand-info">
            <h1 className="brand-name">Qhatu</h1>
            <span className="brand-badge">Vendedor</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => handleNavClick(item.id)}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                title={item.label}
              >
                <span className="nav-icon">{Icons[item.icon]}</span>
                <span className="nav-label">{item.label}</span>
                {activeSection === item.id && <span className="nav-active-bar" />}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* User Profile */}
        <div className="user-profile">
          <div className="user-avatar">
            {user?.nombre?.[0]?.toUpperCase() || 'V'}
          </div>
          <div className="user-data">
            <p className="user-name">{user?.nombre || 'Vendedor'}</p>
            <p className="user-email">{user?.email || 'usuario@qhatu.com'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="footer-actions">
          <button 
            className="action-btn logout-btn"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <span className="action-icon">{Icons.LogOut}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;