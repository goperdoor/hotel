const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const authApi = {
  adminLogin: (email, password) => request('/auth/admin/login', { method: 'POST', body: { email, password } }),
  ownerLogin: (email, password, hotelEmail) => request('/auth/owner/login', { method: 'POST', body: { email, password, hotelEmail } }),
};

export const hotelApi = {
  listAdmin: (token) => request('/hotels', { token }),
  create: (token, payload) => request('/hotels', { method: 'POST', body: payload, token }),
  update: (token, id, payload) => request(`/hotels/${id}`, { method: 'PUT', body: payload, token }),
  toggle: (token, id) => request(`/hotels/${id}/toggle`, { method: 'PATCH', token }),
  remove: (token, id) => request(`/hotels/${id}`, { method: 'DELETE', token }),
  publicList: (search) => request(`/hotels/public${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  publicGet: (id) => request(`/hotels/public/${id}`),
};

export const menuApi = {
  ownerList: (token) => request('/menu/owner', { token }),
  publicList: (hotelId) => request(`/menu/public/${hotelId}`),
  create: (token, payload) => request('/menu', { method: 'POST', body: payload, token }),
  update: (token, id, payload) => request(`/menu/${id}`, { method: 'PUT', body: payload, token }),
  toggle: (token, id) => request(`/menu/${id}/toggle`, { method: 'PATCH', token }),
  remove: (token, id) => request(`/menu/${id}`, { method: 'DELETE', token }),
};

export const orderApi = {
  create: (payload) => request('/orders', { method: 'POST', body: payload }),
  ownerList: (token) => request('/orders/owner', { token }),
  updateStatus: (token, id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status }, token }),
  get: (id) => request(`/orders/${id}`),
  remove: (token, id) => request(`/orders/${id}`, { method: 'DELETE', token }),
  byNumber: (number) => request(`/orders/number/${number}`),
  exportRange: async (token, start, end) => {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    const headers = { Authorization: `Bearer ${token}` };
    const res = await fetch(`${API_BASE}/orders/owner/export?${params.toString()}`, { headers });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    return blob; // caller handles download
  },
  purgeRange: (token, start, end) => request('/orders/owner/purge', { method: 'POST', body: { start, end }, token }),
};

export const uploadApi = {
  image: async (token, file) => {
    const formData = new FormData();
    formData.append('image', file);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', headers, body: formData });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data; // { url, public_id }
  }
};
