/**
 * Service Catalog API Service
 * Servicio para gestión de catálogos de servicios del organizador
 * Basado en el contrato OpenAPI del Profile Service
 */

import { BaseApiService } from '@/shared/infrastructure/services/base-api.service.js';
import apiClient from '@/shared/infrastructure/http/axios.config.js';

export class ServiceCatalogApiService extends BaseApiService {
  /**
   * Endpoint base dinámico para catálogos
   * Depende del profileId
   */
  static get baseEndpoint() {
    return '/api/v1';
  }

  /**
   * GET /api/v1/{profileId}/service-catalogs
   * Obtener catálogos de servicios de un perfil
   * @param {number} profileId - ID del perfil
   * @returns {Promise<ServiceCatalogResource[]>}
   */
  static async getCatalogsByProfile(profileId) {
    try {
      const endpoint = `${this.baseEndpoint}/${profileId}/service-catalogs`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al obtener catálogos del perfil ${profileId}`);
    }
  }

  /**
   * GET /api/v1/{profileId}/service-catalogs/{catalogId}
   * Obtener catálogo específico
   * @param {number} profileId - ID del perfil
   * @param {number} catalogId - ID del catálogo
   * @returns {Promise<ServiceCatalogResource>}
   */
  static async getCatalogById(profileId, catalogId) {
    try {
      const endpoint = `${this.baseEndpoint}/${profileId}/service-catalogs/${catalogId}`;
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al obtener catálogo ${catalogId}`);
    }
  }

  /**
   * POST /api/v1/{profileId}/service-catalogs
   * Crear nuevo catálogo de servicios
   * @param {number} profileId - ID del perfil
   * @param {CreateServiceCatalogResource} catalogData - Datos del catálogo
   * @returns {Promise<Object>}
   * 
   * CreateServiceCatalogResource = {
   *   profileId: number,
   *   title: string,
   *   description: string,
   *   category: string,
   *   priceFrom: number,
   *   priceTo: number
   * }
   */
  static async createCatalog(profileId, catalogData) {
    try {
      const endpoint = `${this.baseEndpoint}/${profileId}/service-catalogs`;
      const response = await apiClient.post(endpoint, catalogData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al crear catálogo');
    }
  }

  /**
   * PUT /api/v1/{profileId}/service-catalogs/{catalogId}
   * Actualizar catálogo existente
   * @param {number} profileId - ID del perfil
   * @param {number} catalogId - ID del catálogo
   * @param {CreateServiceCatalogResource} catalogData - Datos del catálogo
   * @returns {Promise<Object>}
   */
  static async updateCatalog(profileId, catalogId, catalogData) {
    try {
      const endpoint = `${this.baseEndpoint}/${profileId}/service-catalogs/${catalogId}`;
      const response = await apiClient.put(endpoint, catalogData);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al actualizar catálogo ${catalogId}`);
    }
  }

  /**
   * DELETE /api/v1/{profileId}/service-catalogs/{catalogId}
   * Eliminar catálogo
   * @param {number} profileId - ID del perfil
   * @param {number} catalogId - ID del catálogo
   * @returns {Promise<boolean>}
   */
  static async deleteCatalog(profileId, catalogId) {
    try {
      const endpoint = `${this.baseEndpoint}/${profileId}/service-catalogs/${catalogId}`;
      await apiClient.delete(endpoint);
      return true;
    } catch (error) {
      throw this.handleError(error, `Error al eliminar catálogo ${catalogId}`);
    }
  }

  /**
   * Buscar catálogos por categoría
   * @param {number} profileId - ID del perfil
   * @param {string} category - Categoría a buscar
   * @returns {Promise<ServiceCatalogResource[]>}
   */
  static async getCatalogsByCategory(profileId, category) {
    try {
      const catalogs = await this.getCatalogsByProfile(profileId);
      return catalogs.filter(c => 
        c.category?.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      throw this.handleError(error, `Error al buscar catálogos de categoría ${category}`);
    }
  }

  /**
   * Buscar catálogos por rango de precio
   * @param {number} profileId - ID del perfil
   * @param {number} minPrice - Precio mínimo
   * @param {number} maxPrice - Precio máximo
   * @returns {Promise<ServiceCatalogResource[]>}
   */
  static async getCatalogsByPriceRange(profileId, minPrice, maxPrice) {
    try {
      const catalogs = await this.getCatalogsByProfile(profileId);
      return catalogs.filter(c => {
        const catalogMin = c.priceFrom || 0;
        const catalogMax = c.priceTo || Infinity;
        return catalogMin >= minPrice && catalogMax <= maxPrice;
      });
    } catch (error) {
      throw this.handleError(error, 'Error al buscar catálogos por precio');
    }
  }

  /**
   * Obtener categorías únicas de los catálogos
   * @param {number} profileId - ID del perfil
   * @returns {Promise<string[]>}
   */
  static async getUniqueCategories(profileId) {
    try {
      const catalogs = await this.getCatalogsByProfile(profileId);
      const categories = catalogs
        .map(c => c.category)
        .filter(Boolean);
      return [...new Set(categories)];
    } catch (error) {
      return [];
    }
  }

  /**
   * Obtener estadísticas de catálogos
   * @param {number} profileId - ID del perfil
   * @returns {Promise<Object>}
   */
  static async getCatalogStats(profileId) {
    try {
      const catalogs = await this.getCatalogsByProfile(profileId);
      
      return {
        total: catalogs.length,
        categories: await this.getUniqueCategories(profileId),
        avgPriceFrom: catalogs.reduce((sum, c) => sum + (c.priceFrom || 0), 0) / catalogs.length || 0,
        avgPriceTo: catalogs.reduce((sum, c) => sum + (c.priceTo || 0), 0) / catalogs.length || 0,
        minPrice: Math.min(...catalogs.map(c => c.priceFrom || 0)),
        maxPrice: Math.max(...catalogs.map(c => c.priceTo || 0))
      };
    } catch (error) {
      return {
        total: 0,
        categories: [],
        avgPriceFrom: 0,
        avgPriceTo: 0,
        minPrice: 0,
        maxPrice: 0
      };
    }
  }
}
