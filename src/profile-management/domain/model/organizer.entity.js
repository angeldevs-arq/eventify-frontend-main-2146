// src/profile-management/domain/model/organizer.entity.js

/**
 * Entidad Organizer
 * Representa la información de un organizador (perfil)
 */

export class Organizer {
  /**
   * @param {Object} params
   * @param {string} params.id - ID único del organizador
   * @param {string} params.name - Nombre del organizador o empresa
   * @param {string} params.email - Correo de contacto
   * @param {string} [params.phone] - Teléfono de contacto
   * @param {string} [params.city] - Ciudad o ubicación
   * @param {string} [params.description] - Descripción o bio del organizador
   * @param {string} [params.profileImage] - URL de imagen de perfil
   * @param {Array<Object>} [params.socialLinks] - Redes sociales [{ type: 'instagram', url: '...' }]
   * @param {string} [params.status] - Estado del perfil (active | inactive)
   * @param {string} [params.createdAt] - Fecha de creación
   * @param {string} [params.updatedAt] - Fecha de actualización
   */
  constructor({
                id,
                firstName,
                lastName,
                email,
                street = '',
    number = '',
    postalCode = '',
    country = '',
    type = '',

                city = '',

                profileImageUrl = '',
    profileImagePublicId ='',
    userId = 0,
                status = 'active'
              }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.street = street;
    this.number = number;
    this.postalCode = postalCode;
    this.country = country;
    this.type = type;
    this.city = city;
    this.profileImageUrl = profileImageUrl;
    this.profileImagePublicId = profileImagePublicId;
    this.userId = userId;
    this.status = status;
  }

  /**
   * Actualiza información básica del organizador
   * @param {Partial<Organizer>} data
   */
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Cambia el estado del perfil
   * @param {string} newStatus
   */
  changeStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Agrega o actualiza un link de red social
   * @param {string} type - tipo (ej. 'instagram', 'facebook')
   * @param {string} url
   */
  setSocialLink(type, url) {
    const existing = this.socialLinks.find(link => link.type === type);
    if (existing) {
      existing.url = url;
    } else {
      this.socialLinks.push({ type, url });
    }
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Elimina un link de red social
   * @param {string} type
   */
  removeSocialLink(type) {
    this.socialLinks = this.socialLinks.filter(link => link.type !== type);
    this.updatedAt = new Date().toISOString();
  }
}
