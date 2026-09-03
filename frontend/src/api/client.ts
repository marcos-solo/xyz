import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('iat_token') || localStorage.getItem('apex_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('iat_token');
      localStorage.removeItem('iat_user');
      localStorage.removeItem('apex_token');
      localStorage.removeItem('apex_user');
      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/verify')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
