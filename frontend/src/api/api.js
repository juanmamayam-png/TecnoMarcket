// Cliente HTTP central. Todas las llamadas al backend pasan por `apiFetch`,
// que centraliza dos cosas para no repetirlas en cada página:
//   1) adjuntar el token JWT guardado tras el login,
//   2) convertir respuestas de error (status >= 400) en excepciones con
//      el mensaje que devuelve la API, para poder mostrarlo en la UI.
// En desarrollo local, '/api' se resuelve vía el proxy de vite.config.js
// hacia http://localhost:4000. En producción (Vercel), el frontend y el
// backend son dos despliegues distintos con dominios distintos, así que
// se necesita la URL completa del backend — se toma de la variable de
// entorno VITE_API_URL configurada en el proyecto de Vercel del frontend.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('tecnomarket_token');
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content no trae cuerpo JSON.
  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Error ${response.status}`);
  }
  return data;
}

// --- Auth ---
export const authApi = {
  register: (payload) => apiFetch('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => apiFetch('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => apiFetch('/auth/me'),
};

// --- Productos / catálogo ---
export const productApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))
    ).toString();
    return apiFetch(`/products${query ? `?${query}` : ''}`, { auth: false });
  },
  categories: () => apiFetch('/products/categories', { auth: false }),
  getById: (id) => apiFetch(`/products/${id}`, { auth: false }),
  create: (payload) => apiFetch('/products', { method: 'POST', body: payload }),
  update: (id, payload) => apiFetch(`/products/${id}`, { method: 'PUT', body: payload }),
  adjustStock: (id, payload) => apiFetch(`/products/${id}/stock`, { method: 'PATCH', body: payload }),
  remove: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
  createCategory: (payload) => apiFetch('/products/categories', { method: 'POST', body: payload }),
};

// --- Pedidos ---
export const orderApi = {
  checkout: (payload) => apiFetch('/orders/checkout', { method: 'POST', body: payload }),
  list: () => apiFetch('/orders'),
  getById: (id) => apiFetch(`/orders/${id}`),
  updateStatus: (id, status) => apiFetch(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
};

// --- Facturas ---
export const invoiceApi = {
  getByOrderId: (orderId) => apiFetch(`/invoices/order/${orderId}`),
};

// --- Notificaciones ---
export const notificationApi = {
  list: () => apiFetch('/notifications'),
  markAsRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
};

// --- Usuarios (admin) ---
export const userApi = {
  list: () => apiFetch('/users'),
  updateRole: (id, role) => apiFetch(`/users/${id}/role`, { method: 'PATCH', body: { role } }),
  setActive: (id, active) => apiFetch(`/users/${id}/active`, { method: 'PATCH', body: { active } }),
};

// --- Reportes (admin) ---
export const reportApi = {
  sales: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/reports/sales${query ? `?${query}` : ''}`);
  },
  inventory: () => apiFetch('/reports/inventory'),
};

export { getToken };
