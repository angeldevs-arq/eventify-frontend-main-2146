/**
 * Social Event API Service
 * Servicio para gestión de eventos sociales
 * Basado en el contrato OpenAPI del Event-Quote Service
 */

import { BaseApiService } from '@/shared/infrastructure/services/base-api.service.js';
import apiClient from '@/shared/infrastructure/http/axios.config.js';

export class SocialEventApiService extends BaseApiService {
  /**
   * Endpoint base para social events
   */
  static get baseEndpoint() {
    return '/api/v1/social-events';
  }

  /**
   * GET /api/v1/social-events
   * Obtener todos los eventos sociales
   * @returns {Promise<SocialEventResource[]>}
   */
  static async getAllSocialEvents() {
    return this.getAll();
  }

  /**
   * GET /api/v1/social-events/{socialEventId}
   * Obtener evento social por ID
   * @param {number} socialEventId - ID del evento
   * @returns {Promise<SocialEventResource>}
   */
  static async getSocialEventById(socialEventId) {
    return this.getById(socialEventId);
  }

  /**
   * POST /api/v1/social-events
   * Crear nuevo evento social
   * @param {CreateSocialEventResource} eventData - Datos del evento
   * @returns {Promise<SocialEventResource>}
   * 
   * CreateSocialEventResource = {
   *   title: string,
   *   place: string,
   *   date: string,         // ISO Date (YYYY-MM-DD)
   *   customerName: string,
   *   status: string
   * }
   */
  static async createSocialEvent(eventData) {
    return this.create(eventData);
  }

  /**
   * PUT /api/v1/social-events/{socialEventId}
   * Actualizar evento social
   * @param {number} socialEventId - ID del evento
   * @param {UpdateSocialEventResource} eventData - Datos a actualizar
   * @returns {Promise<SocialEventResource>}
   * 
   * UpdateSocialEventResource = {
   *   title: string,
   *   date: string,
   *   customerName: string,
   *   place: string,
   *   status: string
   * }
   */
  static async updateSocialEvent(socialEventId, eventData) {
    return this.update(socialEventId, eventData);
  }

  /**
   * DELETE /api/v1/social-events/{socialEventId}
   * Eliminar evento social
   * @param {number} socialEventId - ID del evento
   * @returns {Promise<boolean>}
   */
  static async deleteSocialEvent(socialEventId) {
    return this.delete(socialEventId);
  }

  /**
   * GET /api/v1/social-events/title/{title}
   * Buscar eventos por título
   * @param {string} title - Título a buscar
   * @returns {Promise<SocialEventResource[]>}
   */
  static async getSocialEventsByTitle(title) {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/title/${title}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al buscar eventos con título ${title}`);
    }
  }

  /**
   * GET /api/v1/social-events/status/{status}
   * Buscar eventos por estado
   * @param {string} status - Estado del evento
   * @returns {Promise<SocialEventResource[]>}
   */
  static async getSocialEventsByStatus(status) {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/status/${status}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al buscar eventos con estado ${status}`);
    }
  }

  /**
   * GET /api/v1/customers/{customerName}/social-events
   * Obtener eventos de un cliente
   * @param {string} customerName - Nombre del cliente
   * @returns {Promise<SocialEventResource[]>}
   */
  static async getSocialEventsByCustomer(customerName) {
    try {
      const response = await apiClient.get(`/api/v1/customers/${customerName}/social-events`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al obtener eventos del cliente ${customerName}`);
    }
  }

  /**
   * Buscar eventos por rango de fechas
   * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha fin (YYYY-MM-DD)
   * @returns {Promise<SocialEventResource[]>}
   */
  static async getSocialEventsByDateRange(startDate, endDate) {
    try {
      const events = await this.getAllSocialEvents();
      
      return events.filter(event => {
        const eventDate = new Date(event.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return eventDate >= start && eventDate <= end;
      });
    } catch (error) {
      throw this.handleError(error, 'Error al filtrar eventos por fecha');
    }
  }

  /**
   * Obtener eventos del mes actual
   * @returns {Promise<SocialEventResource[]>}
   */
  static async getCurrentMonthEvents() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.getSocialEventsByDateRange(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    );
  }

  /**
   * Obtener eventos próximos (siguientes 30 días)
   * @returns {Promise<SocialEventResource[]>}
   */
  static async getUpcomingEvents() {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    return this.getSocialEventsByDateRange(
      now.toISOString().split('T')[0],
      futureDate.toISOString().split('T')[0]
    );
  }

  /**
   * Obtener eventos pasados
   * @returns {Promise<SocialEventResource[]>}
   */
  static async getPastEvents() {
    try {
      const events = await this.getAllSocialEvents();
      const now = new Date();

      return events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate < now;
      });
    } catch (error) {
      throw this.handleError(error, 'Error al obtener eventos pasados');
    }
  }

  /**
   * Formatear fecha de evento
   * @param {string} date - Fecha en formato ISO (YYYY-MM-DD)
   * @returns {string} - Fecha formateada
   */
  static formatEventDate(date) {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Validar fecha de evento
   * @param {string} date - Fecha en formato ISO
   * @returns {boolean}
   */
  static isValidEventDate(date) {
    const eventDate = new Date(date);
    return !isNaN(eventDate.getTime());
  }

  /**
   * Obtener estado del evento según la fecha
   * @param {string} date - Fecha del evento
   * @returns {string} - "upcoming" | "today" | "past"
   */
  static getEventTimeStatus(date) {
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDay = new Date(eventDate);
    eventDay.setHours(0, 0, 0, 0);

    if (eventDay > today) return 'upcoming';
    if (eventDay.getTime() === today.getTime()) return 'today';
    return 'past';
  }

  /**
   * Crear evento desde una cotización confirmada
   * @param {QuoteResource} quote - Cotización confirmada
   * @returns {Promise<SocialEventResource>}
   */
  static async createEventFromQuote(quote) {
    const eventData = {
      title: quote.title,
      place: quote.location,
      date: quote.eventDate.split('T')[0], // Extraer solo la fecha
      customerName: '', // Debe obtenerse del Profile Service usando hostId
      status: 'CONFIRMED'
    };

    return this.createSocialEvent(eventData);
  }
}
