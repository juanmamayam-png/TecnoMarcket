import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Crear cuenta</h1>
        <label>
          Nombre completo
          <input required value={form.name} onChange={update('name')} />
        </label>
        <label>
          Email
          <input type="email" required value={form.email} onChange={update('email')} />
        </label>
        <label>
          Teléfono
          <input value={form.phone} onChange={update('phone')} />
        </label>
        <label>
          Contraseña
          <input type="password" required minLength={6} value={form.password} onChange={update('password')} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Ingresa aquí</Link>
        </p>
      </form>
    </div>
  );
}
