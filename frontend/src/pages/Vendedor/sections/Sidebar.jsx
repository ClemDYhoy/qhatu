// src/pages/Vendedor/sections/Sidebar.jsx
import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, setActiveSection, user }) => {
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: 'Home' },
    { id: 'ventas-pendientes', label: 'Ventas Pendientes', icon: 'ShoppingCart' },
    { id: 'historial', label: 'Historial de Ventas', icon: 'History' },
    { id: 'inventario', label: 'Alertas de Inventario', icon: 'Warning' },
    { id: 'ia-asistente', label: 'Asistente IA', icon: 'SmartToy' },
  ];

  return (
    <aside className="vendedor-sidebar">
      <div className="sidebar-header">
        <h2>Qhatu</h2>
        <p>Vendedor</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar">{user?.nombre?.[0] || 'V'}</div>
          <div>
            <p className="user-name">{user?.nombre || 'Vendedor'}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;