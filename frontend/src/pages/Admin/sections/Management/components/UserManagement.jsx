// sections/Management/components/UserManagement.jsx
import React, { useState } from 'react';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import './UserManagement.css';

const UserManagement = () => {
  // Datos simulados - luego vendrán de la API
  const [users, setUsers] = useState([
    {
      usuario_id: 1,
      nombre_completo: 'Admin Principal',
      email: 'admin@qhatu.com',
      rol_nombre: 'super_admin',
      estado: 'activo',
      ultimo_acceso: '2025-11-18'
    },
    {
      usuario_id: 2,
      nombre_completo: 'María Vendedora',
      email: 'vendedor@qhatu.com',
      rol_nombre: 'vendedor',
      estado: 'activo',
      ultimo_acceso: '2025-11-17'
    },
    {
      usuario_id: 3,
      nombre_completo: 'Carlos Almacenero',
      email: 'almacenero@qhatu.com',
      rol_nombre: 'almacenero',
      estado: 'bloqueado',
      ultimo_acceso: '2025-11-13'
    }
  ]);

  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const columns = [
    { key: 'usuario_id', label: 'ID', sortable: true },
    { key: 'nombre_completo', label: 'Nombre', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'rol_nombre', label: 'Rol', sortable: true },
    { key: 'estado', label: 'Estado', sortable: true },
    { key: 'ultimo_acceso', label: 'Último Acceso', sortable: true }
  ];

  const renderActions = (user) => (
    <div className="user-actions">
      <button 
        className="btn-edit"
        onClick={() => handleEditUser(user)}
        title="Editar"
      >
        ✏️
      </button>
      <button 
        className={`btn-toggle ${user.estado === 'activo' ? 'deactivate' : 'activate'}`}
        onClick={() => handleToggleStatus(user.usuario_id, user.estado)}
        title={user.estado === 'activo' ? 'Desactivar' : 'Activar'}
      >
        {user.estado === 'activo' ? '🔒' : '🔓'}
      </button>
      {user.rol_nombre !== 'super_admin' && (
        <button 
          className="btn-delete"
          onClick={() => handleDeleteUser(user.usuario_id)}
          title="Eliminar"
        >
          🗑️
        </button>
      )}
    </div>
  );

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleToggleStatus = (userId, currentStatus) => {
    const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
    console.log(`Cambiar estado de usuario ${userId} a ${newStatus}`);
    // TODO: Implementar cambio de estado
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      console.log('Eliminar usuario:', userId);
      // TODO: Implementar eliminación
    }
  };

  // Formatear datos para la tabla
  const formattedUsers = users.map(u => ({
    ...u,
    rol_nombre: (
      <span className={`role-badge ${u.rol_nombre}`}>
        {u.rol_nombre === 'super_admin' && '👑 Admin'}
        {u.rol_nombre === 'vendedor' && '💼 Vendedor'}
        {u.rol_nombre === 'almacenero' && '📦 Almacenero'}
        {u.rol_nombre === 'cliente' && '👤 Cliente'}
      </span>
    ),
    estado: (
      <span className={`status-badge ${u.estado}`}>
        {u.estado === 'activo' && '✅ Activo'}
        {u.estado === 'inactivo' && '⏸️ Inactivo'}
        {u.estado === 'bloqueado' && '🔒 Bloqueado'}
      </span>
    ),
    ultimo_acceso: new Date(u.ultimo_acceso).toLocaleDateString('es-PE')
  }));

  return (
    <div className="user-management-container">
      <div className="management-header">
        <h2>👥 Gestión de Usuarios</h2>
        <button className="btn-create" onClick={handleCreateUser}>
          ➕ Crear Usuario
        </button>
      </div>

      <div className="users-stats">
        <div className="stat-box">
          <span className="stat-value">{users.length}</span>
          <span className="stat-label">Total Usuarios</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{users.filter(u => u.estado === 'activo').length}</span>
          <span className="stat-label">Activos</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{users.filter(u => u.rol_nombre === 'vendedor').length}</span>
          <span className="stat-label">Vendedores</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{users.filter(u => u.rol_nombre === 'almacenero').length}</span>
          <span className="stat-label">Almaceneros</span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={formattedUsers}
        actions={renderActions}
        searchable={true}
        sortable={true}
      />

      {/* Modal de Usuario */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={selectedUser ? 'Editar Usuario' : 'Crear Usuario'}
        size="medium"
      >
        <div className="user-form-placeholder">
          <p>Formulario de usuario (por implementar)</p>
          {/* TODO: Implementar formulario */}
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;

/* 
CSS ESPECIFICACIONES (UserManagement.css):
- .user-management-container: display flex, flex-direction column, gap 25px
- .management-header: display flex, justify-content space-between, align-items center
- .management-header h2: margin 0, font-size 22px, color #2c3e50
- .btn-create: padding 10px 20px, background #27ae60, color white, border none, border-radius 6px, cursor pointer, font-size 14px, font-weight 600
- .btn-create:hover: background #229954
- .users-stats: display grid, grid-template-columns repeat(4, 1fr), gap 15px, padding 20px, background #f8f9fa, border-radius 8px
- .stat-box: text-align center
- .stat-value: display block, font-size 28px, font-weight bold, color #2c3e50, margin-bottom 5px
- .stat-label: display block, font-size 13px, color #7f8c8d
- .user-actions: display flex, gap 8px, justify-content flex-end
- .btn-edit, .btn-toggle, .btn-delete: padding 8px 12px, border none, border-radius 6px, cursor pointer, font-size 16px
- .btn-edit: background #3498db, color white
- .btn-edit:hover: background #2980b9
- .btn-toggle.activate: background #27ae60, color white
- .btn-toggle.deactivate: background #f39c12, color white
- .btn-delete: background #e74c3c, color white
- .btn-delete:hover: background #c0392b
- .role-badge: padding 4px 12px, border-radius 12px, font-size 12px, font-weight 600
- .role-badge.super_admin: background #9b59b6, color white
- .role-badge.vendedor: background #3498db, color white
- .role-badge.almacenero: background #e67e22, color white
- .role-badge.cliente: background #95a5a6, color white
- .status-badge: padding 4px 12px, border-radius 12px, font-size 12px, font-weight 600
- .status-badge.activo: background #d5f4e6, color #27ae60
- .status-badge.inactivo: background #fef5e7, color #f39c12
- .status-badge.bloqueado: background #fadbd8, color #e74c3c
*/