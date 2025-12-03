/**
 * Quote API Service
 * Servicio para gestión de cotizaciones
 * Basado en el contrato OpenAPI del Event-Quote Service
 */

import { BaseApiService } from '@/shared/infrastructure/services/base-api.service.js';
import apiClient from '@/shared/infrastructure/http/axios.config.js';

export class QuoteApiService extends BaseApiService {
  /**
   * Endpoint base para quotes
   */
  static get baseEndpoint() {
    return '/api/v1/quotes';
  }

  /**
   * POST /api/v1/quotes
   * Crear nueva cotización
   * @param {CreateQuoteResource} quoteData - Datos de la cotización
   * @returns {Promise<QuoteResource>}
   * 
   * CreateQuoteResource = {
   *   title: string,
   *   eventType: string,
   *   guestQuantity: number,
   *   location: string,
   *   totalPrice: number,
   *   state: string,           // "PENDING" | "CONFIRMED" | "REJECTED"
   *   eventDate: string,       // ISO DateTime
   *   organizerId: number,
   *   hostId: number
   * }
   */
  static async createQuote(quoteData) {
    return this.create(quoteData);
  }

  /**
   * GET /api/v1/quotes/{quoteId}
   * Obtener cotización por ID
   * @param {string} quoteId - UUID de la cotización
   * @returns {Promise<QuoteResource>}
   */
  static async getQuoteById(quoteId) {
    return this.getById(quoteId);
  }

  /**
   * PUT /api/v1/quotes/{quoteId}
   * Actualizar cotización
   * @param {string} quoteId - UUID de la cotización
   * @param {UpdateQuoteResource} quoteData - Datos a actualizar
   * @returns {Promise<QuoteResource>}
   * 
   * UpdateQuoteResource = {
   *   title: string,
   *   eventType: string,
   *   guestQuantity: number,
   *   location: string,
   *   totalPrice: number,
   *   eventDate: string
   * }
   */
  static async updateQuote(quoteId, quoteData) {
    return this.update(quoteId, quoteData);
  }

  /**
   * DELETE /api/v1/quotes/{quoteId}
   * Eliminar cotización
   * @param {string} quoteId - UUID de la cotización
   * @returns {Promise<boolean>}
   */
  static async deleteQuote(quoteId) {
    return this.delete(quoteId);
  }

  /**
   * POST /api/v1/quotes/{quoteId}/confirmations
   * Confirmar/Aceptar cotización
   * @param {string} quoteId - UUID de la cotización
   * @returns {Promise<Object>}
   */
  static async confirmQuote(quoteId) {
    try {
      const response = await apiClient.post(`${this.baseEndpoint}/${quoteId}/confirmations`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al confirmar cotización ${quoteId}`);
    }
  }

  /**
   * POST /api/v1/quotes/{quoteId}/rejections
   * Rechazar cotización
   * @param {string} quoteId - UUID de la cotización
   * @returns {Promise<Object>}
   */
  static async rejectQuote(quoteId) {
    try {
      const response = await apiClient.post(`${this.baseEndpoint}/${quoteId}/rejections`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al rechazar cotización ${quoteId}`);
    }
  }

  /**
   * GET /api/v1/organizers/{organizerId}/quotes
   * Obtener cotizaciones de un organizador
   * @param {number} organizerId - ID del organizador
   * @returns {Promise<QuoteResource[]>}
   */
  static async getQuotesByOrganizer(organizerId) {
    try {
      const response = await apiClient.get(`/api/v1/organizers/${organizerId}/quotes`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al obtener cotizaciones del organizador ${organizerId}`);
    }
  }

  /**
   * Obtener cotizaciones por estado
   * @param {string} state - "PENDING" | "CONFIRMED" | "REJECTED"
   * @param {number} organizerId - ID del organizador (opcional)
   * @returns {Promise<QuoteResource[]>}
   */
  static async getQuotesByState(state, organizerId = null) {
    try {
      const quotes = organizerId 
        ? await this.getQuotesByOrganizer(organizerId)
        : await this.getAll();
      
      return quotes.filter(q => q.state === state);
    } catch (error) {
      throw this.handleError(error, `Error al filtrar cotizaciones por estado ${state}`);
    }
  }

  /**
   * Obtener cotizaciones pendientes
   * @param {number} organizerId - ID del organizador (opcional)
   * @returns {Promise<QuoteResource[]>}
   */
  static async getPendingQuotes(organizerId = null) {
    return this.getQuotesByState('PENDING', organizerId);
  }

  /**
   * Obtener cotizaciones confirmadas
   * @param {number} organizerId - ID del organizador (opcional)
   * @returns {Promise<QuoteResource[]>}
   */
  static async getConfirmedQuotes(organizerId = null) {
    return this.getQuotesByState('CONFIRMED', organizerId);
  }

  /**
   * Obtener cotizaciones rechazadas
   * @param {number} organizerId - ID del organizador (opcional)
   * @returns {Promise<QuoteResource[]>}
   */
  static async getRejectedQuotes(organizerId = null) {
    return this.getQuotesByState('REJECTED', organizerId);
  }

  /**
   * Calcular precio total basado en service items
   * @param {ServiceItemResource[]} serviceItems - Items de servicio
   * @returns {number}
   */
  static calculateTotalPrice(serviceItems) {
    return serviceItems.reduce((total, item) => {
      return total + (item.totalPrice || 0);
    }, 0);
  }

  /**
   * Validar fecha de evento
   * @param {string} eventDate - Fecha en formato ISO
   * @returns {boolean}
   */
  static isValidEventDate(eventDate) {
    const date = new Date(eventDate);
    const now = new Date();
    return date > now; // Fecha debe ser futura
  }

  /**
   * Formatear fecha de evento
   * @param {string} eventDate - Fecha en formato ISO
   * @returns {string} - Fecha formateada
   */
  static formatEventDate(eventDate) {
    const date = new Date(eventDate);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
