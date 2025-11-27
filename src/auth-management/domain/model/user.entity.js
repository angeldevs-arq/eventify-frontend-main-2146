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
                name,
                role = 'host',
                profileImage = '',
                status = 'active',
                emailVerified = false,
                createdAt = new Date().toISOString(),
                updatedAt = new Date().toISOString(),
              }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
    this.role = role;
    this.profileImage = profileImage;
    this.status = status;
    this.emailVerified = emailVerified;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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
    return this.role === 'organizer';
  }

  /**
   * Verifica si el usuario es administrador
   * @returns {boolean}
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Verifica si la cuenta está activa
   * @returns {boolean}
   */
  isActive() {
    return this.status === 'active';
  }

  /**
   * Actualiza la información del usuario
   * @param {Partial<User>} data
   */
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Cambia el estado del usuario
   * @param {string} newStatus
   */
  changeStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Marca el email como verificado
   */
  verifyEmail() {
    this.emailVerified = true;
    this.updatedAt = new Date().toISOString();
  }
}
