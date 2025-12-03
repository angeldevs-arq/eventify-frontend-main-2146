/**
 * Album API Service
 * Servicio para gestión de álbumes y fotos del organizador
 * Basado en el contrato OpenAPI del Profile Service
 */

import { BaseApiService } from '@/shared/infrastructure/services/base-api.service.js';
import apiClient from '@/shared/infrastructure/http/axios.config.js';

export class AlbumApiService extends BaseApiService {
  /**
   * Endpoint base para álbumes
   */
  static get baseEndpoint() {
    return '/api/v1/albums';
  }

  /**
   * GET /api/v1/albums?profileId={profileId}
   * Obtener álbumes por perfil
   * @param {number} profileId - ID del perfil
   * @returns {Promise<AlbumResource[]>}
   */
  static async getAlbumsByProfile(profileId) {
    try {
      const response = await apiClient.get(this.baseEndpoint, {
        params: { profileId }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al obtener álbumes del perfil ${profileId}`);
    }
  }

  /**
   * GET /api/v1/albums/{albumId}
   * Obtener álbum específico por ID
   * @param {number} albumId - ID del álbum
   * @returns {Promise<AlbumResource>}
   */
  static async getAlbumById(albumId) {
    return this.getById(albumId);
  }

  /**
   * POST /api/v1/albums
   * Crear nuevo álbum
   * @param {CreateAlbumResource} albumData - Datos del álbum
   * @returns {Promise<Object>}
   * 
   * CreateAlbumResource = {
   *   profileId: number,
   *   title: string,
   *   description: string,
   *   photos: PhotoResource[] // Opcional
   * }
   */
  static async createAlbum(albumData) {
    return this.create(albumData);
  }

  /**
   * PUT /api/v1/albums/{albumId}
   * Actualizar álbum existente
   * @param {number} albumId - ID del álbum
   * @param {CreateAlbumResource} albumData - Datos del álbum
   * @returns {Promise<Object>}
   */
  static async updateAlbum(albumId, albumData) {
    return this.update(albumId, albumData);
  }

  /**
   * DELETE /api/v1/albums/{albumId}
   * Eliminar álbum
   * @param {number} albumId - ID del álbum
   * @returns {Promise<boolean>}
   */
  static async deleteAlbum(albumId) {
    return this.delete(albumId);
  }

  /**
   * POST /api/v1/albums/{albumId}/photos
   * Agregar foto a un álbum
   * @param {number} albumId - ID del álbum
   * @param {CreatePhotoResource} photoData - Datos de la foto
   * @returns {Promise<Object>}
   * 
   * CreatePhotoResource = {
   *   photoUrl: string,
   *   photoPublicId: string
   * }
   */
  static async addPhotoToAlbum(albumId, photoData) {
    try {
      const response = await apiClient.post(
        `${this.baseEndpoint}/${albumId}/photos`,
        photoData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, `Error al agregar foto al álbum ${albumId}`);
    }
  }

  /**
   * DELETE /api/v1/albums/{albumId}/photos/{publicId}
   * Eliminar foto de un álbum
   * @param {number} albumId - ID del álbum
   * @param {string} publicId - Public ID de Cloudinary
   * @returns {Promise<boolean>}
   */
  static async deletePhotoFromAlbum(albumId, publicId) {
    try {
      await apiClient.delete(`${this.baseEndpoint}/${albumId}/photos/${publicId}`);
      return true;
    } catch (error) {
      throw this.handleError(error, `Error al eliminar foto ${publicId} del álbum ${albumId}`);
    }
  }

  /**
   * Agregar múltiples fotos a un álbum
   * @param {number} albumId - ID del álbum
   * @param {CreatePhotoResource[]} photos - Array de fotos
   * @returns {Promise<Object[]>}
   */
  static async addMultiplePhotos(albumId, photos) {
    try {
      const promises = photos.map(photo => 
        this.addPhotoToAlbum(albumId, photo)
      );
      return await Promise.all(promises);
    } catch (error) {
      throw this.handleError(error, `Error al agregar múltiples fotos al álbum ${albumId}`);
    }
  }

  /**
   * Obtener total de álbumes de un perfil
   * @param {number} profileId - ID del perfil
   * @returns {Promise<number>}
   */
  static async getTotalAlbums(profileId) {
    try {
      const albums = await this.getAlbumsByProfile(profileId);
      return albums.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtener total de fotos de un perfil
   * @param {number} profileId - ID del perfil
   * @returns {Promise<number>}
   */
  static async getTotalPhotos(profileId) {
    try {
      const albums = await this.getAlbumsByProfile(profileId);
      return albums.reduce((total, album) => {
        return total + (album.photos?.length || 0);
      }, 0);
    } catch (error) {
      return 0;
    }
  }
}
