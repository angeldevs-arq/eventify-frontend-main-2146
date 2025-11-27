// src/profile-management/domain/model/album.entity.js

/**
 * Entidad Album
 * Representa un álbum fotográfico perteneciente a un organizador
 */

export default class Album {
  /**
   * @param {Object} params
   * @param {string} params.id - ID único del álbum
   * @param {string} params.title - Título del álbum
   * @param {string} [params.description] - Descripción del álbum
   * @param {string} params.organizerId - ID del organizador propietario
   * @param {Array<string>} [params.images] - URLs de las imágenes del álbum
   * @param {Array<string>} [params.tags] - Etiquetas relacionadas al álbum
   * @param {string} [params.status] - Estado del álbum (active, inactive)
   * @param {string} [params.createdAt] - Fecha de creación
   * @param {string} [params.updatedAt] - Fecha de actualización
   */
  constructor({
    id,
    title,
    description = '',
    organizerId,
    images = [],
    tags = [],
    status = 'active',
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.organizerId = organizerId;
    this.images = images;
    this.tags = tags;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Actualiza parcialmente los campos del álbum
   * @param {Partial<Album>} data
   */
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Agrega una imagen al álbum
   * @param {string} imageUrl
   */
  addImage(imageUrl) {
    this.images.push(imageUrl);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Elimina una imagen del álbum
   * @param {string} imageUrl
   */
  removeImage(imageUrl) {
    this.images = this.images.filter(img => img !== imageUrl);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Cambia el estado del álbum
   * @param {string} newStatus
   */
  changeStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
  }
}
