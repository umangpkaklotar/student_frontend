import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthPublicEndpoint = error.config?.url?.includes('/auth/login');

    if (status === 401 && !isAuthPublicEndpoint) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403 && !error.response?.data?.detail) {
      error.response.data = {
        ...error.response.data,
        detail: 'You do not have permission to perform this action.',
      };
    } else if (status === 422 && Array.isArray(error.response?.data?.errors)) {
      const firstMsg = error.response.data.errors[0]?.msg;
      if (firstMsg) {
        error.response.data.detail = firstMsg.replace(/^Value error,\s*/i, '');
      }
    } else if (status >= 500) {
      error.response.data = {
        ...error.response?.data,
        detail:
          error.response?.data?.detail ||
          'Server error occurred. Please try again later.',
      };
    }

    return Promise.reject(error);
  }
);

export default api;
