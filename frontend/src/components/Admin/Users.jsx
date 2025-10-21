// C:\qhatu\frontend\src\components\Admin\Users.jsx
import { useState, useEffect } from 'react';
import { Plus, Shield, Trash2, Edit } from 'lucide-react';

function Users() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ nombre: '', correo: '', rol_id: 2, telefono: '', contrasena: 'defaultpass123' });
  const [roles, setRoles] = useState([]);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));

    fetch('http://localhost:5000/api/users/roles', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setRoles(data))
      .catch(error => console.error('Error fetching roles:', error));
  }, []);

  const handleAddUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        const data = await response.json();
        setUsers([...users, data]);
        setNewUser({ nombre: '', correo: '', rol_id: 2, telefono: '', contrasena: 'defaultpass123' });
      } else {
        throw new Error('Error al agregar usuario');
      }
    } catch (error) {
      console.error('Error en handleAddUser:', error);
      alert('Error al agregar usuario');
    }
  };

  const handleEditUser = (user) => {
    setEditUser({ ...user, contrasena: '' });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${editUser.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(editUser),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id_usuario === updatedUser.id_usuario ? updatedUser : u));
        setEditUser(null);
      } else {
        throw new Error('Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error en handleSaveEdit:', error);
      alert('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este usuario?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        if (response.ok) {
          setUsers(users.filter(u => u.id_usuario !== id));
        } else {
          throw new Error('Error al eliminar usuario');
        }
      } catch (error) {
        console.error('Error en handleDeleteUser:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editUser) {
      setEditUser({ ...editUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Gestionar Usuarios</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={editUser?.nombre || newUser.nombre}
            onChange={handleInputChange}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <input
            type="email"
            name="correo"
            placeholder="Correo"
            value={editUser?.correo || newUser.correo}
            onChange={handleInputChange}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <select
            name="rol_id"
            value={editUser?.rol_id || newUser.rol_id}
            onChange={handleInputChange}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            {roles.map(role => (
              <option key={role.id_rol} value={role.id_rol}>{role.nombre}</option>
            ))}
          </select>
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={editUser?.telefono || newUser.telefono}
            onChange={handleInputChange}
            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {editUser ? (
            <button
              onClick={handleSaveEdit}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              <Edit size={16} /> Guardar
            </button>
          ) : (
            <button
              onClick={handleAddUser}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              <Plus size={16} /> Agregar Usuario
            </button>
          )}
        </div>
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Nombre</th>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Correo</th>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Rol</th>
              <th style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id_usuario} style={{ background: '#fff', '&:hover': { background: '#f1f1f1' } }}>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{user.nombre}</td>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>{user.correo}</td>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}><Shield size={16} /> {roles.find(r => r.id_rol === user.rol_id)?.nombre}</td>
                <td style={{ padding: '0.5rem 1rem', border: '1px solid #ddd' }}>
                  <button
                    onClick={() => handleEditUser(user)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.5rem', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id_usuario)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.5rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users; // Añadido exportación por defecto