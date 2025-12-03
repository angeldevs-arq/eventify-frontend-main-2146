/**
 * Profile API Service
 * Servicio para gestión de perfiles (Host/Organizer)
 * Basado en el contrato OpenAPI del Profile Service
 */

import { BaseApiService } from '@/shared/infrastructure/services/base-api.service.js';
import apiClient from '@/shared/infrastructure/http/axios.config.js';

export class ProfileApiService extends BaseApiService {
  /**
   * Endpoint base para perfiles
   */
  static get baseEndpoint() {
    return '/api/v1/profiles';
  }

  /**
   * GET /api/v1/profiles
   * Obtener todos los perfiles
   * @returns {Promise<ProfileResource[]>}
   */
  static async getAllProfiles() {
    return this.getAll();
  }

  /**
   * GET /api/v1/profiles/{profileId}
   * Obtener perfil por ID
   * @param {number} profileId - ID del perfil
   * @returns {Promise<ProfileResource>}
   */
  static async getProfileById(profileId) {
    return this.getById(profileId);
  }

  /**
   * GET /api/v1/profiles/email/{email}
   * Obtener perfil por email
   * @param {string} email - Email del perfil
   * @returns {Promise<ProfileResource>}
   */
  static async getProfileByEmail(email) {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/email/${email}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al obtener perfil con email ${email}`);
    }
  }

  /**
   * POST /api/v1/profiles
   * Crear nuevo perfil
   * @param {CreateProfileResource} profileData - Datos del perfil
   * @returns {Promise<Object>}
   * 
   * CreateProfileResource = {
   *   firstName: string,
   *   lastName: string,
   *   email: string,
   *   street: string,
   *   number: string,
   *   city: string,
   *   postalCode: string,
   *   country: string,
   *   profileImageUrl: string,
   *   profileImagePublicId: string,
   *   type: string, // "HOST" | "ORGANIZER"
   *   userId: number
   * }
   */
  static async createProfile(profileData) {
    return this.create(profileData);
  }

  /**
   * PUT /api/v1/profiles/{id}
   * Actualizar perfil existente
   * @param {number} id - ID del perfil
   * @param {UpdateProfileResource} profileData - Datos a actualizar
   * @returns {Promise<ProfileResource>}
   * 
   * UpdateProfileResource = {
   *   firstName: string,
   *   lastName: string,
   *   email: string,
   *   street: string,
   *   number: string,
   *   city: string,
   *   postalCode: string,
   *   country: string,
   *   profileImageUrl: string,
   *   profileImagePublicId: string,
   *   type: string
   * }
   */
  static async updateProfile(id, profileData) {
    return this.update(id, profileData);
  }

  /**
   * Obtener perfil del usuario autenticado
   * Usa el userId del token para obtener el perfil
   * @param {number} userId - ID del usuario del IAM
   * @returns {Promise<ProfileResource|null>}
   */
  static async getMyProfile(userId) {
    try {
      // Obtener todos los perfiles y filtrar por userId
      const profiles = await this.getAllProfiles();
      const profile = profiles.find(p => p.userId === userId);
      return profile || null;
    } catch (error) {
      throw this.handleError(error, 'Error al obtener mi perfil');
    }
  }

  /**
   * Validar si existe un perfil para un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<boolean>}
   */
  static async hasProfile(userId) {
    try {
      const profile = await this.getMyProfile(userId);
      return !!profile;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener perfiles por tipo
   * @param {string} type - "HOST" | "ORGANIZER"
   * @returns {Promise<ProfileResource[]>}
   */
  static async getProfilesByType(type) {
    try {
      const profiles = await this.getAllProfiles();
      return profiles.filter(p => p.type === type);
    } catch (error) {
      throw this.handleError(error, `Error al obtener perfiles tipo ${type}`);
    }
  }

  /**
   * Buscar perfiles por ciudad
   * @param {string} city - Ciudad a buscar
   * @returns {Promise<ProfileResource[]>}
   */
  static async getProfilesByCity(city) {
    try {
      const profiles = await this.getAllProfiles();
      return profiles.filter(p => 
        p.city?.toLowerCase().includes(city.toLowerCase())
      );
    } catch (error) {
      throw this.handleError(error, `Error al buscar perfiles en ${city}`);
    }
  }
}
