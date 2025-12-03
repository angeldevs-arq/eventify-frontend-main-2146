/**
 * Configuración de Axios para el módulo Quote Management
 * Centraliza la configuración HTTP
 */

import axios from 'axios';

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Para agregar token, logs, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token de localStorage o sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    console.log(`[Task API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.status, error.message);

    console.error('[Task API Response Error]', error.response?.status, error.message);

    // Manejo de errores globales
    if (error.response) {
      // El servidor respondió con un status fuera del rango 2xx
      switch (error.response.status) {
        case 404:
          console.error('Resource not found');
          console.error('Task resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        case 401:
          console.error('Unauthorized');
          // TODO: Redirigir a login
          break;
        case 403:
          console.error('Forbidden - Insufficient permissions');
          break;
        default:
          console.error('API Error:', error.response.data);
          console.error('Task API Error:', error.response.data);
      }
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('No response from server');
    } else {
      // Algo pasó al configurar la petición
      console.error('Error setting up request:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
