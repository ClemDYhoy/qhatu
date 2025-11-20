// components/Sidebar.jsx
import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeSection, onSectionChange, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'inventory', label: 'Inventario', icon: '📦' },
    { id: 'ai-reports', label: 'Reportes IA', icon: '🤖' },
    { id: 'management', label: 'Gestión', icon: '⚙️' }
  ];

  return (
    <aside className="admin-sidebar">
      {/* Header del sidebar */}
      <div className="sidebar-header">
        <h2> Qhatu Admin</h2>
        <div className="sidebar-user">
          <p className="user-name">{user?.nombre_completo}</p>
          <span className="user-role">{user?.rol_nombre}</span>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="item-icon">{item.icon}</span>
            <span className="item-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Botón de cerrar sesión */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

/* 
CSS ESPECIFICACIONES (Sidebar.css):
- .admin-sidebar: width 250px, height 100vh, background #2c3e50, color white
- .sidebar-header: padding 20px, border-bottom 1px solid rgba(255,255,255,0.1)
- .sidebar-user: margin-top 10px, font-size 14px
- .sidebar-nav: flex-grow 1, padding 20px 0
- .sidebar-item: width 100%, padding 12px 20px, text-align left, border-left 3px solid transparent
- .sidebar-item.active: background rgba(255,255,255,0.1), border-left-color #3498db
- .sidebar-item:hover: background rgba(255,255,255,0.05)
- .item-icon: margin-right 10px, font-size 20px
- .logout-btn: width calc(100% - 40px), margin 20px, padding 12px, background #e74c3c
*/