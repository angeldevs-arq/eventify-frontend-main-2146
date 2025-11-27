// src/task-management/application/services/task-api.service.js

/**
 * Servicio para comunicación con la API de tareas usando Axios
 * Maneja todas las operaciones CRUD
 */

import apiClient from '/src/shared/infrastructure/http/axios.config.js';

export class TaskApiService {
  static ENDPOINT = '/tasks';

  /**
   * Obtener todas las tareas
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const response = await apiClient.get(this.ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('TaskApiService.getAll error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener una tarea por ID
   * @param {string} id - ID de la tarea
   * @returns {Promise<Object>}
   */
  static async getById(id) {
    try {
      const response = await apiClient.get(`${this.ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.getById(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear una nueva tarea
   * @param {Object} taskData - Datos de la tarea
   * @returns {Promise<Object>}
   */
  static async create(taskData) {
    try {
      const response = await apiClient.post(this.ENDPOINT, taskData);
      return response.data;
    } catch (error) {
      console.error('TaskApiService.create error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar una tarea existente (PUT - reemplaza todo)
   * @param {string} id - ID de la tarea
   * @param {Object} taskData - Datos completos de la tarea
   * @returns {Promise<Object>}
   */
  static async update(id, taskData) {
    try {
      const response = await apiClient.put(`${this.ENDPOINT}/${id}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.update(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar parcialmente una tarea (PATCH)
   * @param {string} id - ID de la tarea
   * @param {Object} partialData - Datos parciales a actualizar
   * @returns {Promise<Object>}
   */
  static async patch(id, partialData) {
    try {
      const response = await apiClient.patch(`${this.ENDPOINT}/${id}`, partialData);
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.patch(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar una tarea
   * @param {string} id - ID de la tarea
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    try {
      await apiClient.delete(`${this.ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      console.error(`TaskApiService.delete(${id}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Filtrar tareas por estado
   * @param {string} status - Estado de la tarea (TODO, IN_PROGRESS, DONE, etc.)
   * @returns {Promise<Array>}
   */
  static async getByStatus(status) {
    try {
      const response = await apiClient.get(this.ENDPOINT, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.getByStatus(${status}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Filtrar tareas por prioridad
   * @param {string} priority - Prioridad de la tarea (LOW, MEDIUM, HIGH, CRITICAL)
   * @returns {Promise<Array>}
   */
  static async getByPriority(priority) {
    try {
      const response = await apiClient.get(this.ENDPOINT, {
        params: { priority }
      });
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.getByPriority(${priority}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener tareas asignadas a un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>}
   */
  static async getByAssignee(userId) {
    try {
      const response = await apiClient.get(this.ENDPOINT, {
        params: { assignedTo: userId }
      });
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.getByAssignee(${userId}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar tareas con múltiples filtros
   * @param {Object} filters - Objeto con filtros { status, priority, assignedTo, dueDate, etc }
   * @returns {Promise<Array>}
   */
  static async search(filters = {}) {
    try {
      const response = await apiClient.get(this.ENDPOINT, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('TaskApiService.search error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener tareas con paginación
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
      console.error('TaskApiService.getPaginated error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cambiar estado de una tarea
   * @param {string} id - ID de la tarea
   * @param {string} newStatus - Nuevo estado
   * @returns {Promise<Object>}
   */
  static async changeStatus(id, newStatus) {
    try {
      const response = await apiClient.patch(`${this.ENDPOINT}/${id}`, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.changeStatus(${id}, ${newStatus}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Asignar tarea a un usuario
   * @param {string} id - ID de la tarea
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  static async assignTask(id, userId) {
    try {
      const response = await apiClient.patch(`${this.ENDPOINT}/${id}`, {
        assignedTo: userId,
        updatedAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.assignTask(${id}, ${userId}) error:`, error);
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
