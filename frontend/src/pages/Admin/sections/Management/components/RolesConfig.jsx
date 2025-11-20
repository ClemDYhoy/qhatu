// sections/Management/components/RolesConfig.jsx
import React, { useState } from 'react';
import './RolesConfig.css';

const RolesConfig = () => {
  // Datos de roles desde la BD
  const [roles] = useState([
    {
      rol_id: 1,
      nombre: 'super_admin',
      descripcion: 'Administrador con acceso total al sistema',
      usuarios_count: 1,
      permisos: ['productos', 'usuarios', 'ventas', 'reportes', 'configuracion']
    },
    {
      rol_id: 2,
      nombre: 'vendedor',
      descripcion: 'Gestiona ventas y carritos de clientes',
      usuarios_count: 3,
      permisos: ['ventas', 'carritos', 'clientes']
    },
    {
      rol_id: 3,
      nombre: 'almacenero',
      descripcion: 'Gestiona inventario y stock',
      usuarios_count: 2,
      permisos: ['productos', 'stock', 'alertas']
    },
    {
      rol_id: 4,
      nombre: 'cliente',
      descripcion: 'Usuario final que realiza compras',
      usuarios_count: 45,
      permisos: ['productos', 'carrito', 'compras']
    }
  ]);

  const getRoleIcon = (roleName) => {
    switch(roleName) {
      case 'super_admin': return '👑';
      case 'vendedor': return '💼';
      case 'almacenero': return '📦';
      case 'cliente': return '👤';
      default: return '👥';
    }
  };

  const getRoleColor = (roleName) => {
    switch(roleName) {
      case 'super_admin': return '#9b59b6';
      case 'vendedor': return '#3498db';
      case 'almacenero': return '#e67e22';
      case 'cliente': return '#95a5a6';
      default: return '#34495e';
    }
  };

  return (
    <div className="roles-config-container">
      <div className="config-header">
        <h2>🔐 Configuración de Roles</h2>
        <p className="config-desc">
          Gestión de roles y permisos del sistema
        </p>
      </div>

      <div className="roles-grid">
        {roles.map(role => (
          <div 
            key={role.rol_id} 
            className="role-card"
            style={{ borderTopColor: getRoleColor(role.nombre) }}
          >
            <div className="role-header">
              <div className="role-icon" style={{ background: `${getRoleColor(role.nombre)}20`, color: getRoleColor(role.nombre) }}>
                {getRoleIcon(role.nombre)}
              </div>
              <div className="role-title-section">
                <h3 className="role-name">{role.nombre}</h3>
                <p className="role-description">{role.descripcion}</p>
              </div>
            </div>

            <div className="role-stats">
              <div className="role-stat">
                <span className="stat-icon">👥</span>
                <div className="stat-info">
                  <span className="stat-value">{role.usuarios_count}</span>
                  <span className="stat-label">Usuarios</span>
                </div>
              </div>
              <div className="role-stat">
                <span className="stat-icon">🔑</span>
                <div className="stat-info">
                  <span className="stat-value">{role.permisos.length}</span>
                  <span className="stat-label">Permisos</span>
                </div>
              </div>
            </div>

            <div className="role-permissions">
              <h4 className="permissions-title">Permisos:</h4>
              <div className="permissions-list">
                {role.permisos.map((permiso, idx) => (
                  <span key={idx} className="permission-tag">
                    ✓ {permiso}
                  </span>
                ))}
              </div>
            </div>

            {role.nombre !== 'super_admin' && (
              <div className="role-actions">
                <button className="btn-edit-role">
                  ✏️ Editar Permisos
                </button>
              </div>
            )}

            {role.nombre === 'super_admin' && (
              <div className="role-locked">
                <span className="lock-icon">🔒</span>
                <span className="lock-text">Rol protegido del sistema</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="roles-info">
        <div className="info-box">
          <span className="info-icon">💡</span>
          <div className="info-content">
            <h4 className="info-title">Sobre los Roles</h4>
            <p className="info-text">
              Los roles definen qué acciones puede realizar cada tipo de usuario en el sistema. 
              El rol <strong>super_admin</strong> está protegido y no puede ser modificado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesConfig;

/* 
CSS ESPECIFICACIONES (RolesConfig.css):
- .roles-config-container: display flex, flex-direction column, gap 25px
- .config-header: margin-bottom 10px
- .config-header h2: margin 0 0 8px 0, font-size 22px, color #2c3e50
- .config-desc: margin 0, font-size 14px, color #7f8c8d
- .roles-grid: display grid, grid-template-columns repeat(2, 1fr), gap 20px
- .role-card: background white, border 2px solid #ecf0f1, border-top 4px solid, border-radius 10px, padding 20px, transition all 0.3s
- .role-card:hover: transform translateY(-4px), box-shadow 0 6px 20px rgba(0,0,0,0.1)
- .role-header: display flex, gap 15px, align-items flex-start, margin-bottom 15px
- .role-icon: width 50px, height 50px, border-radius 50%, display flex, align-items center, justify-content center, font-size 24px, flex-shrink 0
- .role-title-section: flex-grow 1
- .role-name: margin 0 0 4px 0, font-size 18px, font-weight 600, color #2c3e50, text-transform capitalize
- .role-description: margin 0, font-size 13px, color #7f8c8d, line-height 1.5
- .role-stats: display flex, gap 20px, margin-bottom 15px, padding-bottom 15px, border-bottom 1px solid #ecf0f1
- .role-stat: display flex, align-items center, gap 10px
- .stat-icon: font-size 24px
- .stat-info: display flex, flex-direction column
- .stat-value: font-size 20px, font-weight bold, color #2c3e50, line-height 1
- .stat-label: font-size 12px, color #7f8c8d
- .role-permissions: margin-bottom 15px
- .permissions-title: margin 0 0 10px 0, font-size 14px, font-weight 600, color #2c3e50
- .permissions-list: display flex, flex-wrap wrap, gap 8px
- .permission-tag: background #ecf0f1, color #2c3e50, padding 4px 12px, border-radius 12px, font-size 12px, font-weight 600
- .role-actions: margin-top 15px
- .btn-edit-role: width 100%, padding 10px, background #3498db, color white, border none, border-radius 6px, cursor pointer, font-size 14px, font-weight 600
- .btn-edit-role:hover: background #2980b9
- .role-locked: display flex, align-items center, justify-content center, gap 8px, padding 10px, background #ecf0f1, border-radius 6px, margin-top 15px
- .lock-icon: font-size 16px
- .lock-text: font-size 13px, color #7f8c8d, font-weight 600
- .roles-info: margin-top 20px
- .info-box: background #e8f4f8, border-left 4px solid #3498db, padding 20px, border-radius 8px, display flex, gap 15px
- .info-icon: font-size 32px
- .info-content: flex-grow 1
- .info-title: margin 0 0 8px 0, font-size 16px, font-weight 600, color #2c3e50
- .info-text: margin 0, font-size 13px, color #555, line-height 1.6
*/