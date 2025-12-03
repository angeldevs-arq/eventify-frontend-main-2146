/**
 * Album Entity
 * Entidad de dominio para álbumes de fotos
 * Basada en AlbumResource del backend
 */

export class Album {
  constructor(data = {}) {
    this.id = data.id || null;
    this.profileId = data.profileId || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.photos = data.photos || [];
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  /**
   * Obtener número de fotos
   * @returns {number}
   */
  get photoCount() {
    return this.photos.length;
  }

  /**
   * Verificar si el álbum tiene fotos
   * @returns {boolean}
   */
  hasPhotos() {
    return this.photos.length > 0;
  }

  /**
   * Verificar si el álbum está vacío
   * @returns {boolean}
   */
  isEmpty() {
    return this.photos.length === 0;
  }

  /**
   * Obtener primera foto como cover
   * @returns {Photo|null}
   */
  get coverPhoto() {
    return this.photos[0] || null;
  }

  /**
   * Agregar foto al álbum
   * @param {Object} photo - { photoUrl, photoPublicId }
   */
  addPhoto(photo) {
    this.photos.push(photo);
  }

  /**
   * Eliminar foto del álbum por publicId
   * @param {string} publicId
   * @returns {boolean} - true si se eliminó
   */
  removePhoto(publicId) {
    const index = this.photos.findIndex(p => p.photoPublicId === publicId);
    if (index !== -1) {
      this.photos.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Obtener foto por publicId
   * @param {string} publicId
   * @returns {Photo|null}
   */
  getPhoto(publicId) {
    return this.photos.find(p => p.photoPublicId === publicId) || null;
  }

  /**
   * Convertir a DTO para crear álbum
   * @returns {CreateAlbumResource}
   */
  toCreateDTO() {
    return {
      profileId: this.profileId,
      title: this.title,
      description: this.description,
      photos: this.photos
    };
  }

  /**
   * Validar datos del álbum
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.profileId) {
      errors.push('El profileId es obligatorio');
    }

    if (!this.title?.trim()) {
      errors.push('El título es obligatorio');
    }

    if (this.title?.length > 100) {
      errors.push('El título no puede exceder 100 caracteres');
    }

    if (this.description?.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Crear instancia desde datos del backend
   * @param {Object} data - AlbumResource del backend
   * @returns {Album}
   */
  static fromBackend(data) {
    return new Album(data);
  }

  /**
   * Crear álbum vacío
   * @param {number} profileId - ID del perfil
   * @returns {Album}
   */
  static empty(profileId) {
    return new Album({
      profileId,
      photos: []
    });
  }
}

/**
 * Photo Entity
 * Entidad para fotos dentro de álbumes
 */
export class Photo {
  constructor(data = {}) {
    this.photoUrl = data.photoUrl || '';
    this.photoPublicId = data.photoPublicId || '';
  }

  /**
   * Verificar si la foto tiene URL válida
   * @returns {boolean}
   */
  hasValidUrl() {
    return !!this.photoUrl && this.photoUrl.startsWith('http');
  }

  /**
   * Obtener nombre del archivo desde publicId
   * @returns {string}
   */
  get filename() {
    return this.photoPublicId.split('/').pop();
  }

  /**
   * Convertir a DTO para crear foto
   * @returns {CreatePhotoResource}
   */
  toCreateDTO() {
    return {
      photoUrl: this.photoUrl,
      photoPublicId: this.photoPublicId
    };
  }

  /**
   * Validar datos de la foto
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.photoUrl?.trim()) {
      errors.push('La URL de la foto es obligatoria');
    }

    if (!this.photoPublicId?.trim()) {
      errors.push('El publicId es obligatorio');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Crear instancia desde datos del backend
   * @param {Object} data - PhotoResource del backend
   * @returns {Photo}
   */
  static fromBackend(data) {
    return new Photo(data);
  }

  /**
   * Crear foto desde respuesta de Cloudinary
   * @param {Object} mediaResponse - { imageUrl, imagePublicId }
   * @returns {Photo}
   */
  static fromMediaResponse(mediaResponse) {
    return new Photo({
      photoUrl: mediaResponse.imageUrl,
      photoPublicId: mediaResponse.imagePublicId
    });
  }
}
