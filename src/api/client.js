import axios from 'axios';

// Prefer env var, fall back to production URL (never localhost in production)
const PRODUCTION_API = 'https://restaurant-app-backend-g8w3.onrender.com/api';
let rawApiUrl = import.meta.env.VITE_API_URL || PRODUCTION_API;
if (rawApiUrl.endsWith('/')) rawApiUrl = rawApiUrl.slice(0, -1);
if (!rawApiUrl.endsWith('/api')) rawApiUrl += '/api';

const api = axios.create({
  baseURL: rawApiUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) throw new Error('No refresh token');
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, { refresh });
        const newAccess = res.data.access;
        localStorage.setItem('access_token', newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
