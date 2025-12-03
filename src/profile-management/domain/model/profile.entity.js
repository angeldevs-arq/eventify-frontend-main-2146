/**
 * Profile Entity
 * Entidad de dominio para perfiles (Host/Organizer)
 * Basada en ProfileResource del backend
 */

export class Profile {
  constructor(data = {}) {
    this.id = data.id || null;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.street = data.street || '';
    this.number = data.number || '';
    this.city = data.city || '';
    this.postalCode = data.postalCode || '';
    this.country = data.country || '';
    this.type = data.type || 'HOST'; // "HOST" | "ORGANIZER"
    this.profileImageUrl = data.profileImageUrl || '';
    this.profileImagePublicId = data.profileImagePublicId || '';
    this.userId = data.userId || null;
  }

  /**
   * Obtener nombre completo
   * @returns {string}
   */
  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Obtener iniciales
   * @returns {string}
   */
  get initials() {
    const first = this.firstName.charAt(0).toUpperCase();
    const last = this.lastName.charAt(0).toUpperCase();
    return `${first}${last}`;
  }

  /**
   * Obtener dirección completa
   * @returns {string}
   */
  get fullAddress() {
    const parts = [
      this.street && this.number ? `${this.street} ${this.number}` : '',
      this.city,
      this.postalCode,
      this.country
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * Obtener dirección corta (ciudad, país)
   * @returns {string}
   */
  get shortAddress() {
    return [this.city, this.country].filter(Boolean).join(', ');
  }

  /**
   * Verificar si es Host
   * @returns {boolean}
   */
  isHost() {
    return this.type === 'HOST';
  }

  /**
   * Verificar si es Organizer
   * @returns {boolean}
   */
  isOrganizer() {
    return this.type === 'ORGANIZER';
  }

  /**
   * Verificar si tiene imagen de perfil
   * @returns {boolean}
   */
  hasProfileImage() {
    return !!this.profileImageUrl;
  }

  /**
   * Verificar si el perfil está completo
   * @returns {boolean}
   */
  isComplete() {
    return !!(
      this.firstName &&
      this.lastName &&
      this.email &&
      this.city &&
      this.country
    );
  }

  /**
   * Obtener porcentaje de completitud del perfil
   * @returns {number} - Porcentaje entre 0-100
   */
  getCompletionPercentage() {
    const fields = [
      'firstName',
      'lastName',
      'email',
      'street',
      'number',
      'city',
      'postalCode',
      'country',
      'profileImageUrl'
    ];

    const completedFields = fields.filter(field => !!this[field]).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Convertir a DTO para crear perfil
   * @returns {CreateProfileResource}
   */
  toCreateDTO() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      street: this.street,
      number: this.number,
      city: this.city,
      postalCode: this.postalCode,
      country: this.country,
      profileImageUrl: this.profileImageUrl,
      profileImagePublicId: this.profileImagePublicId,
      type: this.type,
      userId: this.userId
    };
  }

  /**
   * Convertir a DTO para actualizar perfil
   * @returns {UpdateProfileResource}
   */
  toUpdateDTO() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      street: this.street,
      number: this.number,
      city: this.city,
      postalCode: this.postalCode,
      country: this.country,
      profileImageUrl: this.profileImageUrl,
      profileImagePublicId: this.profileImagePublicId,
      type: this.type
    };
  }

  /**
   * Validar datos del perfil
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.firstName?.trim()) {
      errors.push('El nombre es obligatorio');
    }

    if (!this.lastName?.trim()) {
      errors.push('El apellido es obligatorio');
    }

    if (!this.email?.trim()) {
      errors.push('El email es obligatorio');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('El email no es válido');
    }

    if (!['HOST', 'ORGANIZER'].includes(this.type)) {
      errors.push('El tipo de perfil debe ser HOST u ORGANIZER');
    }

    if (!this.userId) {
      errors.push('El userId es obligatorio');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar formato de email
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Crear instancia desde datos del backend
   * @param {Object} data - ProfileResource del backend
   * @returns {Profile}
   */
  static fromBackend(data) {
    return new Profile(data);
  }

  /**
   * Crear instancia desde datos del usuario IAM
   * @param {Object} user - Usuario del IAM
   * @param {string} type - "HOST" | "ORGANIZER"
   * @returns {Profile}
   */
  static fromIAMUser(user, type = 'HOST') {
    return new Profile({
      email: user.email || user.username,
      type: type,
      userId: user.id
    });
  }

  /**
   * Crear perfil vacío
   * @param {number} userId - ID del usuario
   * @param {string} type - "HOST" | "ORGANIZER"
   * @returns {Profile}
   */
  static empty(userId, type = 'HOST') {
    return new Profile({
      userId,
      type
    });
  }
}
