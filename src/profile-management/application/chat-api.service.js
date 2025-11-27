// src/profile-management/application/chat-api.service.js


import apiClient from '@/shared/infrastructure/components/http/axios.config.js'

export class ChatApiService {
  static ENDPOINT = '/chat';

  /**
   * Obtener todas las conversaciones
   * @returns {Promise<Array>}
   */
  static async getAllConversations() {
    try {
      const response = await apiClient.get(`${this.ENDPOINT}/conversations`);
      return response.data;
    } catch (error) {
      console.error('ChatApiService.getAllConversations error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener mensajes de una conversación específica
   * @param {string} conversationId - ID de la conversación
   * @returns {Promise<Array>}
   */
  static async getMessages(conversationId) {
    try {
      const response = await apiClient.get(`${this.ENDPOINT}/conversations/${conversationId}/messages`);
      return response.data;
    } catch (error) {
      console.error(`ChatApiService.getMessages(${conversationId}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Enviar un mensaje
   * @param {Object} messageData - { conversationId, senderId, receiverId, text }
   * @returns {Promise<Object>}
   */
  static async sendMessage(messageData) {
    try {
      const response = await apiClient.post(`${this.ENDPOINT}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error('ChatApiService.sendMessage error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Editar un mensaje existente (por ejemplo, si se permite corregir)
   * @param {string} messageId - ID del mensaje
   * @param {Object} updatedData
   * @returns {Promise<Object>}
   */
  static async updateMessage(messageId, updatedData) {
    try {
      const response = await apiClient.put(`${this.ENDPOINT}/messages/${messageId}`, updatedData);
      return response.data;
    } catch (error) {
      console.error(`ChatApiService.updateMessage(${messageId}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar un mensaje
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<boolean>}
   */
  static async deleteMessage(messageId) {
    try {
      await apiClient.delete(`${this.ENDPOINT}/messages/${messageId}`);
      return true;
    } catch (error) {
      console.error(`ChatApiService.deleteMessage(${messageId}) error:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Filtrar conversaciones por organizador o cliente
   * @param {Object} filters - { organizerId, customerId }
   * @returns {Promise<Array>}
   */
  static async searchConversations(filters = {}) {
    try {
      const response = await apiClient.get(`${this.ENDPOINT}/conversations`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('ChatApiService.searchConversations error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener mensajes con paginación
   * @param {string} conversationId
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<Object>} { data: Array, total: number, page: number }
   */
  static async getPaginatedMessages(conversationId, page = 1, limit = 20) {
    try {
      const response = await apiClient.get(
        `${this.ENDPOINT}/conversations/${conversationId}/messages`,
        {
          params: {
            _page: page,
            _limit: limit
          }
        }
      );

      return {
        data: response.data,
        total: parseInt(response.headers['x-total-count'] || '0'),
        page,
        limit
      };
    } catch (error) {
      console.error('ChatApiService.getPaginatedMessages error:', error);
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
