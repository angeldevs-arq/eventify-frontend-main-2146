/**
 * Media API Service
 * Servicio para gestión de imágenes usando Cloudinary
 * Basado en el contrato OpenAPI del Profile Service
 */

import { BaseApiService } from '@/shared/infrastructure/services/base-api.service.js';
import apiClient from '@/shared/infrastructure/http/axios.config.js';

export class MediaApiService extends BaseApiService {
  /**
   * Endpoint base para media
   */
  static get baseEndpoint() {
    return '/api/v1/media';
  }

  /**
   * POST /api/v1/media/upload?folder={folder}
   * Subir imagen a Cloudinary
   * @param {File} imageFile - Archivo de imagen
   * @param {string} folder - Carpeta en Cloudinary
   * @returns {Promise<MediaResource>}
   * 
   * MediaResource = {
   *   imageUrl: string,
   *   imagePublicId: string
   * }
   */
  static async uploadImage(imageFile, folder) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.post(
        `${this.baseEndpoint}/upload`,
        formData,
        {
          params: { folder },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al subir imagen');
    }
  }

  /**
   * PUT /api/v1/media/update?publicId={publicId}&folder={folder}
   * Actualizar imagen existente en Cloudinary
   * @param {string} publicId - Public ID de Cloudinary
   * @param {File} imageFile - Nuevo archivo de imagen
   * @param {string} folder - Carpeta en Cloudinary
   * @returns {Promise<MediaResource>}
   */
  static async updateImage(publicId, imageFile, folder) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await apiClient.put(
        `${this.baseEndpoint}/update`,
        formData,
        {
          params: { publicId, folder },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error, 'Error al actualizar imagen');
    }
  }

  /**
   * DELETE /api/v1/media/delete?publicId={publicId}
   * Eliminar imagen de Cloudinary
   * @param {string} publicId - Public ID de Cloudinary
   * @returns {Promise<boolean>}
   */
  static async deleteImage(publicId) {
    try {
      await apiClient.delete(`${this.baseEndpoint}/delete`, {
        params: { publicId }
      });
      return true;
    } catch (error) {
      throw this.handleError(error, 'Error al eliminar imagen');
    }
  }

  /**
   * Subir imagen de perfil
   * @param {File} imageFile - Archivo de imagen
   * @param {number} userId - ID del usuario
   * @returns {Promise<MediaResource>}
   */
  static async uploadProfileImage(imageFile, userId) {
    const folder = `profiles/${userId}`;
    return this.uploadImage(imageFile, folder);
  }

  /**
   * Actualizar imagen de perfil
   * @param {string} publicId - Public ID actual
   * @param {File} imageFile - Nuevo archivo
   * @param {number} userId - ID del usuario
   * @returns {Promise<MediaResource>}
   */
  static async updateProfileImage(publicId, imageFile, userId) {
    const folder = `profiles/${userId}`;
    return this.updateImage(publicId, imageFile, folder);
  }

  /**
   * Subir foto de álbum
   * @param {File} imageFile - Archivo de imagen
   * @param {number} profileId - ID del perfil
   * @param {number} albumId - ID del álbum
   * @returns {Promise<MediaResource>}
   */
  static async uploadAlbumPhoto(imageFile, profileId, albumId) {
    const folder = `albums/${profileId}/${albumId}`;
    return this.uploadImage(imageFile, folder);
  }

  /**
   * Subir múltiples imágenes
   * @param {File[]} imageFiles - Array de archivos
   * @param {string} folder - Carpeta en Cloudinary
   * @returns {Promise<MediaResource[]>}
   */
  static async uploadMultipleImages(imageFiles, folder) {
    try {
      const uploadPromises = imageFiles.map(file => 
        this.uploadImage(file, folder)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw this.handleError(error, 'Error al subir múltiples imágenes');
    }
  }

  /**
   * Validar archivo de imagen
   * @param {File} file - Archivo a validar
   * @param {number} maxSizeMB - Tamaño máximo en MB (default: 5MB)
   * @returns {Object} { valid: boolean, error?: string }
   */
  static validateImageFile(file, maxSizeMB = 5) {
    if (!file) {
      return { valid: false, error: 'No se seleccionó ningún archivo' };
    }

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Formato de imagen inválido. Use JPG, PNG, GIF o WEBP' 
      };
    }

    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { 
        valid: false, 
        error: `La imagen debe ser menor a ${maxSizeMB}MB` 
      };
    }

    return { valid: true };
  }

  /**
   * Crear preview de imagen antes de subir
   * @param {File} file - Archivo de imagen
   * @returns {Promise<string>} - Data URL de la imagen
   */
  static async createImagePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extraer publicId de una URL de Cloudinary
   * @param {string} imageUrl - URL de Cloudinary
   * @returns {string|null} - Public ID extraído
   */
  static extractPublicId(imageUrl) {
    try {
      // Ejemplo: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/publicId.jpg
      const match = imageUrl.match(/\/v\d+\/(.+)\.\w+$/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }
}
