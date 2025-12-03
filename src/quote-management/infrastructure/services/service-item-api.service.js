/**
 * Service Item API Service
 * Servicio para gestión de items de servicio en cotizaciones
 * Basado en el contrato OpenAPI del Event-Quote Service
 */

import { BaseApiService } from '@/shared/infrastructure/services/base-api.service.js';
import apiClient from '@/shared/infrastructure/http/axios.config.js';

export class ServiceItemApiService extends BaseApiService {
  /**
   * Endpoint base dinámico (depende del quoteId)
   */
  static get baseEndpoint() {
    return '/api/v1/quotes';
  }

  /**
   * GET /api/v1/quotes/{quoteId}/service-items
   * Obtener items de servicio de una cotización
   * @param {string} quoteId - UUID de la cotización
   * @returns {Promise<ServiceItemResource[]>}
   */
  static async getServiceItemsByQuote(quoteId) {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/${quoteId}/service-items`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al obtener items de la cotización ${quoteId}`);
    }
  }

  /**
   * POST /api/v1/quotes/{quoteId}/service-items
   * Crear nuevo item de servicio
   * @param {string} quoteId - UUID de la cotización
   * @param {CreateServiceItemResource} itemData - Datos del item
   * @returns {Promise<ServiceItemResource>}
   * 
   * CreateServiceItemResource = {
   *   description: string,
   *   quantity: number,
   *   unitPrice: number,
   *   totalPrice: number,
   *   quoteId: string
   * }
   */
  static async createServiceItem(quoteId, itemData) {
    try {
      // Asegurar que el quoteId esté en el body
      const dataWithQuoteId = {
        ...itemData,
        quoteId
      };

      const response = await apiClient.post(
        `${this.baseEndpoint}/${quoteId}/service-items`,
        dataWithQuoteId
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al crear item de servicio');
    }
  }

  /**
   * PUT /api/v1/quotes/{quoteId}/service-items/{serviceItemId}
   * Actualizar item de servicio
   * @param {string} quoteId - UUID de la cotización
   * @param {string} serviceItemId - UUID del item
   * @param {UpdateServiceItemResource} itemData - Datos a actualizar
   * @returns {Promise<ServiceItemResource>}
   * 
   * UpdateServiceItemResource = {
   *   description: string,
   *   quantity: number,
   *   unitPrice: number,
   *   totalPrice: number
   * }
   */
  static async updateServiceItem(quoteId, serviceItemId, itemData) {
    try {
      const response = await apiClient.put(
        `${this.baseEndpoint}/${quoteId}/service-items/${serviceItemId}`,
        itemData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al actualizar item ${serviceItemId}`);
    }
  }

  /**
   * DELETE /api/v1/quotes/{quoteId}/service-items/{serviceItemId}
   * Eliminar item de servicio
   * @param {string} quoteId - UUID de la cotización
   * @param {string} serviceItemId - UUID del item
   * @returns {Promise<boolean>}
   */
  static async deleteServiceItem(quoteId, serviceItemId) {
    try {
      await apiClient.delete(
        `${this.baseEndpoint}/${quoteId}/service-items/${serviceItemId}`
      );
      return true;
    } catch (error) {
      throw this.handleError(error, `Error al eliminar item ${serviceItemId}`);
    }
  }

  /**
   * Calcular precio total de un item
   * @param {number} quantity - Cantidad
   * @param {number} unitPrice - Precio unitario
   * @returns {number}
   */
  static calculateItemTotal(quantity, unitPrice) {
    return quantity * unitPrice;
  }

  /**
   * Validar item de servicio
   * @param {Object} item - Item a validar
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  static validateServiceItem(item) {
    const errors = [];

    if (!item.description?.trim()) {
      errors.push('La descripción es obligatoria');
    }

    if (!item.quantity || item.quantity <= 0) {
      errors.push('La cantidad debe ser mayor a 0');
    }

    if (!item.unitPrice || item.unitPrice <= 0) {
      errors.push('El precio unitario debe ser mayor a 0');
    }

    const calculatedTotal = this.calculateItemTotal(item.quantity, item.unitPrice);
    if (item.totalPrice && Math.abs(item.totalPrice - calculatedTotal) > 0.01) {
      errors.push('El precio total no coincide con cantidad × precio unitario');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Crear item con cálculo automático del total
   * @param {string} quoteId - UUID de la cotización
   * @param {string} description - Descripción del servicio
   * @param {number} quantity - Cantidad
   * @param {number} unitPrice - Precio unitario
   * @returns {Promise<ServiceItemResource>}
   */
  static async createServiceItemAuto(quoteId, description, quantity, unitPrice) {
    const totalPrice = this.calculateItemTotal(quantity, unitPrice);
    
    const itemData = {
      description,
      quantity,
      unitPrice,
      totalPrice,
      quoteId
    };

    return this.createServiceItem(quoteId, itemData);
  }

  /**
   * Actualizar item con recálculo automático del total
   * @param {string} quoteId - UUID de la cotización
   * @param {string} serviceItemId - UUID del item
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<ServiceItemResource>}
   */
  static async updateServiceItemAuto(quoteId, serviceItemId, updates) {
    // Recalcular total si cambia cantidad o precio
    if (updates.quantity || updates.unitPrice) {
      const currentItem = await this.getServiceItemsByQuote(quoteId)
        .then(items => items.find(i => i.id === serviceItemId));
      
      const quantity = updates.quantity || currentItem.quantity;
      const unitPrice = updates.unitPrice || currentItem.unitPrice;
      
      updates.totalPrice = this.calculateItemTotal(quantity, unitPrice);
    }

    return this.updateServiceItem(quoteId, serviceItemId, updates);
  }

  /**
   * Obtener total de todos los items de una cotización
   * @param {string} quoteId - UUID de la cotización
   * @returns {Promise<number>}
   */
  static async getTotalForQuote(quoteId) {
    try {
      const items = await this.getServiceItemsByQuote(quoteId);
      return items.reduce((total, item) => total + (item.totalPrice || 0), 0);
    } catch (error) {
      return 0;
    }
  }
}
