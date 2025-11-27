
/**
 * Entidad Customer - Representa un cliente
 * Estructura simplificada para frontend con validaciones básicas
 */
export class Customer {
  constructor({ id = null, name = '', email = '', phone = '' }) {
    this.id = id || this.generateId();
    this.name = name;
    this.email = email;
    this.phone = phone;
  }

  generateId() {
    return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validaciones básicas
  isValid() {
    return this.name.trim().length > 0;
  }

  hasEmail() {
    return this.email && this.email.includes('@');
  }

  // Factory method para crear desde JSON
  static fromJSON(data) {
    return new Customer({
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || ''
    });
  }

  // Serialización para API
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone
    };
  }

  // Clone para inmutabilidad
  clone() {
    return new Customer({
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone
    });
  }
}
