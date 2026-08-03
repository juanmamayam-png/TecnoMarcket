// Contexto de autenticación. Guarda el usuario actual y el token JWT en
// memoria + localStorage (para no perder la sesión al recargar), y
// expone login/register/logout a toda la aplicación.
import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'tecnomarket_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar la app, si hay un token guardado, se valida contra
  // /auth/me para recuperar la sesión sin pedir login de nuevo.
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await authApi.login({ email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await authApi.register(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
