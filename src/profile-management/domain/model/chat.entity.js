// src/profile-management/domain/model/chat.entity.js

/**
 * Entidad Chat
 * Representa una conversación entre un organizador y un cliente
 */

export default class Chat {
  /**
   * @param {Object} params
   * @param {string} params.id - ID único de la conversación
   * @param {string} params.organizerId - ID del organizador
   * @param {string} params.customerId - ID del cliente
   * @param {Array<Object>} [params.messages] - Lista de mensajes en la conversación
   * @param {string} [params.createdAt] - Fecha de creación de la conversación
   * @param {string} [params.updatedAt] - Última fecha de actualización
   */
  constructor({
    id,
    organizerId,
    customerId,
    messages = [],
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id;
    this.organizerId = organizerId;
    this.customerId = customerId;
    this.messages = messages;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Agrega un nuevo mensaje a la conversación
   * @param {Object} message - { id, senderId, receiverId, content, timestamp, status }
   */
  addMessage(message) {
    this.messages.push({
      ...message,
      timestamp: message.timestamp || new Date().toISOString(),
      status: message.status || 'sent' // sent | delivered | read
    });
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Marca un mensaje como leído
   * @param {string} messageId
   */
  markMessageAsRead(messageId) {
    const msg = this.messages.find(m => m.id === messageId);
    if (msg) {
      msg.status = 'read';
      this.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Elimina un mensaje de la conversación
   * @param {string} messageId
   */
  deleteMessage(messageId) {
    this.messages = this.messages.filter(m => m.id !== messageId);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Obtiene los mensajes ordenados por fecha
   * @returns {Array<Object>}
   */
  getMessagesSorted() {
    return this.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
}
