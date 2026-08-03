// Gestión de usuarios — implementa RF-10: listar usuarios, cambiar su
// rol y activar/desactivar cuentas.
import { useEffect, useState } from 'react';
import { userApi } from '../../api/api';

const ROLES = ['cliente', 'administrador', 'soporte'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  function reload() {
    userApi.list().then(setUsers).catch((err) => setError(err.message));
  }

  useEffect(reload, []);

  async function handleRoleChange(id, role) {
    try {
      await userApi.updateRole(id, role);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleActive(user) {
    try {
      await userApi.setActive(user.id, !user.active);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="admin-users">
      <h2>Usuarios</h2>
      {error && <p className="error">{error}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td>{u.active ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button className="link-button" onClick={() => handleToggleActive(u)}>
                  {u.active ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
