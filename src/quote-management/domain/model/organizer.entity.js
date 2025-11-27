
/**
 * Entidad Organizer - Representa al organizador del evento
 * Estructura simplificada para frontend
 */
export class Organizer {
  constructor({
                id = null,
                name = '',
                role = '',
                phone = '',
                avatar = ''
              }) {
    this.id = id || this.generateId();
    this.name = name;
    this.role = role;
    this.phone = phone;
    this.avatar = avatar;
  }

  generateId() {
    return `organizer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validaciones básicas
  isValid() {
    return this.name.trim().length > 0 && this.role.trim().length > 0;
  }

  // Factory method para crear desde JSON
  static fromJSON(data) {
    return new Organizer({
      id: data.id,
      name: data.name || '',
      role: data.role || '',
      phone: data.phone || '',
      avatar: data.avatar || ''
    });
  }

  // Serialización para API
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      phone: this.phone,
      avatar: this.avatar
    };
  }

  // Clone
  clone() {
    return new Organizer({
      id: this.id,
      name: this.name,
      role: this.role,
      phone: this.phone,
      avatar: this.avatar
    });
  }
}
