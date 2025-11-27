// src/profile-management/application/album-api.service.js

/**
 * Servicio para comunicación con la API de álbumes usando Axios
 * Maneja todas las operaciones CRUD para los álbumes de organizador
 */

import apiClient from '@/shared/infrastructure/components/http/axios.config.js'

export class AlbumApiService {
  static ENDPOINT = '/albums';

  /**
   * Obtener todos los álbumes
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const response = await apiClient.get(this.ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('AlbumApiService.getAll error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener un álbum por ID
   * @param {string} id - ID del álbum
   * @returns {Promise<Object>}
   */
  static async getById(id) {
    try {
      const response = await apiClient.get(`${this.ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`AlbumApiService.getById(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear un nuevo álbum
   * @param {Object} albumData - Datos del álbum
   * @returns {Promise<Object>}
   */
  static async create(albumData) {
    try {
      const response = await apiClient.post(this.ENDPOINT, albumData);
      return response.data;
    } catch (error) {
      console.error('AlbumApiService.create error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar un álbum existente (PUT - reemplaza todo)
   * @param {string} id - ID del álbum
   * @param {Object} albumData - Datos completos del álbum
   * @returns {Promise<Object>}
   */
  static async update(id, albumData) {
    try {
      const response = await apiClient.put(`${this.ENDPOINT}/${id}`, albumData);
      return response.data;
    } catch (error) {
      console.error(`AlbumApiService.update(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar parcialmente un álbum (PATCH)
   * @param {string} id - ID del álbum
   * @param {Object} partialData - Datos parciales a actualizar
   * @returns {Promise<Object>}
   */
  static async patch(id, partialData) {
    try {
      const response = await apiClient.patch(`${this.ENDPOINT}/${id}`, partialData);
      return response.data;
    } catch (error) {
      console.error(`AlbumApiService.patch(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar un álbum
   * @param {string} id - ID del álbum
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    try {
      await apiClient.delete(`${this.ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      console.error(`AlbumApiService.delete(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Filtrar álbumes por organizador
   * @param {string} organizerId - ID del organizador
   * @returns {Promise<Array>}
   */
  static async getByOrganizer(organizerId) {
    try {
      const response = await apiClient.get(this.ENDPOINT, {
        params: { organizerId }
      });
      return response.data;
    } catch (error) {
      console.error(`AlbumApiService.getByOrganizer(${organizerId}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar álbumes con filtros dinámicos
   * @param {Object} filters - { title, date, tags, organizerId, etc }
   * @returns {Promise<Array>}
   */
  static async search(filters = {}) {
    try {
      const response = await apiClient.get(this.ENDPOINT, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('AlbumApiService.search error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener álbumes con paginación
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
      console.error('AlbumApiService.getPaginated error:', error);
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
      const errorMessage = error.response.data?.message || error.message;
      return new Error(`API Error (${error.response.status}): ${errorMessage}`);
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error(`Request setup error: ${error.message}`);
    }
  }
}
