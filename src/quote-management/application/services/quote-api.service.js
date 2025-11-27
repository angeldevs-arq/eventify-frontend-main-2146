// src/quote-management/application/services/quote-api.service.js

/**
 * Servicio para comunicación con la API de cotizaciones usando Axios
 * Maneja todas las operaciones CRUD
 */
import { NotificationApiService } from '/src/profile-management/infrastructure/notification-api.service.js'
import apiClient from '/src/shared/infrastructure/http/axios.config.js';

export class QuoteApiService {
  static ENDPOINT = '/quotes';

  /**
   * Obtener todas las cotizaciones
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const response = await apiClient.get(this.ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('QuoteApiService.getAll error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener una cotización por ID
   * @param {string} id - ID de la cotización
   * @returns {Promise<Object>}
   */
  static async getById(id) {
    try {
      const response = await apiClient.get(`${this.ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`QuoteApiService.getById(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear una nueva cotización
   * @param {Object} quoteData - Datos de la cotización
   * @returns {Promise<Object>}
   */
  static async create(quoteData) {
    try {
      const response = await apiClient.post(this.ENDPOINT, quoteData);
      const createdQuote = response.data;

      await NotificationApiService.create({
        userId: quoteData.organizerId,
        type: 'quote',
        title: 'Nueva cotización recibida',
        message: `${quoteData.hostName} te envió una nueva cotización`,
        time: new Date().toISOString(),
        read: false,
        icon: 'pi-file-edit',
        color: '#10b981',
        quoteId: createdQuote.id
      });
      return createdQuote;
    } catch (error) {
      console.error('QuoteApiService.create error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar una cotización existente (PUT - reemplaza todo)
   * @param {string} id - ID de la cotización
   * @param {Object} quoteData - Datos completos de la cotización
   * @returns {Promise<Object>}
   */
  static async update(id, quoteData) {
    try {
      const response = await apiClient.put(`${this.ENDPOINT}/${id}`, quoteData);
      return response.data;
    } catch (error) {
      console.error(`QuoteApiService.update(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar parcialmente una cotización (PATCH)
   * @param {string} id - ID de la cotización
   * @param {Object} partialData - Datos parciales a actualizar
   * @returns {Promise<Object>}
   */
  static async patch(id, partialData) {
    try {
      const response = await apiClient.patch(`${this.ENDPOINT}/${id}`, partialData);
      return response.data;
    } catch (error) {
      console.error(`QuoteApiService.patch(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar una cotización
   * @param {string} id - ID de la cotización
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    try {
      await apiClient.delete(`${this.ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      console.error(`QuoteApiService.delete(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Filtrar cotizaciones por estado
   * @param {string} state - Estado de la cotización (APPROVED, PENDING, etc.)
   * @returns {Promise<Array>}
   */
  static async getByState(state) {
    try {
      const response = await apiClient.get(this.ENDPOINT, {
        params: { state }
      });
      return response.data;
    } catch (error) {
      console.error(`QuoteApiService.getByState(${state}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar cotizaciones con múltiples filtros
   * @param {Object} filters - Objeto con filtros { state, customer, date, etc }
   * @returns {Promise<Array>}
   */
  static async search(filters = {}) {
    try {
      const response = await apiClient.get(this.ENDPOINT, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('QuoteApiService.search error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener cotizaciones con paginación
   * @param {number} page - Número de página (1-based)
   * @param {number} limit - Elementos por página
   * @returns {Promise<Object>} - { data: Array, total: number, page: number }
   */
  static async getPaginated(page = 1, limit = 10) {
    try {
      const response = await apiClient.get(this.ENDPOINT, {
        params: {
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
      console.error('QuoteApiService.getPaginated error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cambiar estado de una cotización
   * @param {string} id - ID de la cotización
   * @param {string} newState - Nuevo estado
   * @returns {Promise<Object>}
   */
  static async changeState(id, newState) {
    try {
      const response = await apiClient.patch(`${this.ENDPOINT}/${id}`, {
        state: newState,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error(`QuoteApiService.changeState(${id}, ${newState}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Manejador centralizado de errores
   * @param {Error} error - Error de Axios
   * @returns {Error}
   */
  static handleError(error) {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const errorMessage = error.response.data?.message || error.message;
      return new Error(`API Error (${error.response.status}): ${errorMessage}`);
    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta
      return new Error('No response from server. Please check your connection.');
    } else {
      // Algo sucedió al configurar la petición
      return new Error(`Request setup error: ${error.message}`);
    }
  }
}
