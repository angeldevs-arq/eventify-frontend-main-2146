/**
 * Base API Service
 * Clase base genérica para todos los servicios API del sistema
 * Proporciona métodos HTTP estandarizados con manejo de errores
 */

import apiClient from '@/shared/infrastructure/http/axios.config.js';

export class BaseApiService {
  /**
   * Endpoint base del servicio
   * Debe ser sobrescrito por las clases hijas
   */
  static get baseEndpoint() {
    throw new Error('baseEndpoint must be defined in child class');
  }

  /**
   * GET - Obtener todos los recursos
   * @param {Object} params - Query parameters opcionales
   * @returns {Promise<Array>}
   */
  static async getAll(params = {}) {
    try {
      const response = await apiClient.get(this.baseEndpoint, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al obtener recursos');
    }
  }

  /**
   * GET - Obtener recurso por ID
   * @param {number|string} id - ID del recurso
   * @returns {Promise<Object>}
   */
  static async getById(id) {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al obtener recurso ${id}`);
    }
  }

  /**
   * POST - Crear nuevo recurso
   * @param {Object} data - Datos del recurso a crear
   * @returns {Promise<Object>}
   */
  static async create(data) {
    try {
      const response = await apiClient.post(this.baseEndpoint, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al crear recurso');
    }
  }

  /**
   * PUT - Actualizar recurso completo
   * @param {number|string} id - ID del recurso
   * @param {Object} data - Datos completos del recurso
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    try {
      const response = await apiClient.put(`${this.baseEndpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al actualizar recurso ${id}`);
    }
  }

  /**
   * PATCH - Actualizar recurso parcialmente
   * @param {number|string} id - ID del recurso
   * @param {Object} data - Datos parciales del recurso
   * @returns {Promise<Object>}
   */
  static async patch(id, data) {
    try {
      const response = await apiClient.patch(`${this.baseEndpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al actualizar parcialmente recurso ${id}`);
    }
  }

  /**
   * DELETE - Eliminar recurso
   * @param {number|string} id - ID del recurso
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    try {
      await apiClient.delete(`${this.baseEndpoint}/${id}`);
      return true;
    } catch (error) {
      throw this.handleError(error, `Error al eliminar recurso ${id}`);
    }
  }

  /**
   * GET - Búsqueda con filtros personalizados
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>}
   */
  static async search(filters = {}) {
    try {
      const response = await apiClient.get(this.baseEndpoint, {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error en búsqueda');
    }
  }

  /**
   * GET - Paginación
   * @param {number} page - Número de página
   * @param {number} limit - Elementos por página
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Object>} - { data, total, page, limit }
   */
  static async getPaginated(page = 1, limit = 10, filters = {}) {
    try {
      const response = await apiClient.get(this.baseEndpoint, {
        params: {
          ...filters,
          _page: page,
          _limit: limit
        }
      });

      return {
        data: response.data,
        total: parseInt(response.headers['x-total-count'] || '0'),
        page,
        limit
      };
    } catch (error) {
      throw this.handleError(error, 'Error al obtener datos paginados');
    }
  }

  /**
   * POST - Subir archivo (multipart/form-data)
   * @param {string} endpoint - Endpoint específico para upload
   * @param {FormData} formData - FormData con el archivo
   * @returns {Promise<Object>}
   */
  static async uploadFile(endpoint, formData) {
    try {
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al subir archivo');
    }
  }

  /**
   * Manejador centralizado de errores
   * @param {Error} error - Error de Axios
   * @param {string} defaultMessage - Mensaje por defecto
   * @returns {Error}
   */
  static handleError(error, defaultMessage = 'Error en operación') {
    // Error de respuesta del servidor
    if (error.response) {
      const status = error.response.status;
      const serverMessage = error.response.data?.message || error.response.data?.error;

      const errorMessages = {
        400: 'Solicitud inválida',
        401: 'No autorizado. Por favor inicia sesión',
        403: 'Acceso denegado',
        404: 'Recurso no encontrado',
        409: 'Conflicto. El recurso ya existe',
        422: 'Datos de validación inválidos',
        500: 'Error interno del servidor',
        503: 'Servicio no disponible'
      };

      const message = serverMessage || errorMessages[status] || defaultMessage;

      return {
        message,
        status,
        data: error.response.data,
        isServerError: true
      };
    }

    // Error de red (sin respuesta)
    if (error.request) {
      return {
        message: 'Error de conexión. Verifica tu red',
        status: 0,
        data: null,
        isNetworkError: true
      };
    }

    // Error en la configuración de la petición
    return {
      message: error.message || defaultMessage,
      status: 0,
      data: null,
      isConfigError: true
    };
  }

  /**
   * Construir endpoint con parámetros dinámicos
   * @param {string} template - Template del endpoint (ej: '/profiles/{id}/albums')
   * @param {Object} params - Parámetros a reemplazar
   * @returns {string}
   */
  static buildEndpoint(template, params = {}) {
    let endpoint = template;

    Object.entries(params).forEach(([key, value]) => {
      endpoint = endpoint.replace(`{${key}}`, value);
    });

    return endpoint;
  }
}
