/**
 * Entidad User (Usuario)
 * Representa la información de un usuario en el sistema
 * Siguiendo DDD - Domain Model
 */

export class User {
  /**
   * @param {Object} params
   * @param {string} params.id - ID único del usuario
   * @param {string} params.email - Correo electrónico del usuario
   * @param {string} params.password - Contraseña (hasheada en producción)
   * @param {string} params.name - Nombre completo del usuario
   * @param {string} [params.role] - Rol del usuario (host | organizer | admin)
   * @param {string} [params.profileImage] - URL de imagen de perfil
   * @param {string} [params.status] - Estado del usuario (active | inactive | suspended)
   * @param {boolean} [params.emailVerified] - Si el email ha sido verificado
   * @param {string} [params.createdAt] - Fecha de creación
   * @param {string} [params.updatedAt] - Fecha de actualización
   */
  constructor({
                id,
                email,
                password,
                role = 'HOST',
              }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role;
  }

  /**
   * Valida que el usuario tenga datos requeridos
   * @returns {boolean}
   */
  isValid() {
    return this.id && this.email && this.name && this.password;
  }

  /**
   * Verifica si el usuario es un organizador
   * @returns {boolean}
   */
  isOrganizer() {
    return this.role === 'ORGANIZER';
  }


  /**
   * Actualiza la información del usuario
   * @param {Partial<User>} data
   */
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
  }
}
