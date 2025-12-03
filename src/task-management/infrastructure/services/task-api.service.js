// src/task-management/application/services/task-api.service.js

/**
 * Servicio para comunicación con la API de tareas
 * Integrado con microservicio task-event-services
 */

import apiClient from '/src/shared/infrastructure/http/axios.config.js';

export class TaskApiService {
  static BASE_URL = '/api/v1';

  /**
   * Obtener todas las tareas de un evento específico
   * @param {string} eventId - ID del evento
   * @returns {Promise<Array>}
   */
  static async getTasksByEvent(eventId) {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/events/${eventId}/tasks`);
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.getTasksByEvent(${eventId}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear una nueva tarea asociada a un evento
   * @param {string} eventId - ID del evento
   * @param {Object} taskData - Datos de la tarea
   * @returns {Promise<Object>}
   */
  static async createTask(eventId, taskData) {
    try {
      const payload = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        status: taskData.status || 'PENDING',
        assignedUserId: taskData.assignedUserId
      };

      const response = await apiClient.post(
        `${this.BASE_URL}/events/${eventId}/tasks`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('TaskApiService.createTask error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar el estado de una tarea (para drag & drop)
   * @param {string} taskId - ID de la tarea
   * @param {string} newStatus - Nuevo estado (PENDING, IN_PROGRESS, COMPLETED)
   * @returns {Promise<Object>}
   */
  static async updateTaskStatus(taskId, newStatus) {
    try {
      const response = await apiClient.put(
        `${this.BASE_URL}/tasks/${taskId}/status`,
        { status: newStatus }
      );
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.updateTaskStatus(${taskId}, ${newStatus}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar una tarea
   * @param {string} taskId - ID de la tarea
   * @returns {Promise<boolean>}
   */
  static async deleteTask(taskId) {
    try {
      await apiClient.delete(`${this.BASE_URL}/tasks/${taskId}`);
      return true;
    } catch (error) {
      console.error(`TaskApiService.deleteTask(${taskId}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener una tarea por ID
   * @param {string} taskId - ID de la tarea
   * @returns {Promise<Object>}
   */
  static async getTaskById(taskId) {
    try {
      const response = await apiClient.get(`${this.BASE_URL}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.getTaskById(${taskId}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar una tarea completa
   * @param {string} taskId - ID de la tarea
   * @param {string} eventId - ID del evento
   * @param {Object} taskData - Datos de la tarea
   * @returns {Promise<Object>}
   */
  static async updateTask(taskId, eventId, taskData) {
    try {
      const payload = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        status: taskData.status,
        assignedUserId: taskData.assignedUserId
      };

      const response = await apiClient.put(
        `${this.BASE_URL}/tasks/${taskId}`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error(`TaskApiService.updateTask(${taskId}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Calcular progreso de un evento basado en sus tareas
   * @param {string} eventId - ID del evento
   * @returns {Promise<Object>}
   */
  static async getEventProgress(eventId) {
    try {
      const tasks = await this.getTasksByEvent(eventId);
      
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'COMPLETED').length;
      const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const pending = tasks.filter(t => t.status === 'PENDING').length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        total,
        completed,
        inProgress,
        pending,
        percentage,
        tasks
      };
    } catch (error) {
      console.error(`TaskApiService.getEventProgress(${eventId}) error:`, error);
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
      return new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      return new Error(`Error en la solicitud: ${error.message}`);
    }
  }
}
