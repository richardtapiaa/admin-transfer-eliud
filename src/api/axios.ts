import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

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
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }

      if (error.response.data?.message) {
        console.error('Error del servidor:', error.response.data.message);
      }
    } else if (error.request) {
      console.error('No se pudo conectar con el servidor');
    }

    return Promise.reject(error);
  }
);

export default api;
