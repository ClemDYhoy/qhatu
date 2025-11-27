// src/pages/Vendedor/sections/NavBar.jsx
import React from 'react';
import './Navbar.css';

const NavBar = ({ user, stats }) => {
  return (
    <header className="vendedor-navbar">
      <div className="navbar-left">
        <h1>
          {user?.nombre ? `Bienvenido, ${user.nombre.split(' ')[0]}` : 'Dashboard Vendedor'}
        </h1>
      </div>

      <div className="navbar-right">
        <div className="stat-mini">
          <span>Hoy</span>
          <strong>{stats.ventasHoy} ventas</strong>
        </div>
        <div className="stat-mini">
          <span>Comisión</span>
          <strong>S/ {(Number(stats.comision) || 0).toFixed(2)}</strong>
        </div>
        <div className="user-avatar">
          {user?.nombre?.[0] || 'V'}
        </div>
      </div>
    </header>
  );
};

export default NavBar;