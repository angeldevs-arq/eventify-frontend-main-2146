
/**
 * Entidad ServiceItem - Representa un servicio en la cotización
 * Estructura simplificada para frontend con cálculos automáticos
 */
export class ServiceItem {
  constructor({
                id = null,
                description = '',
                quantity = 1,
                unitPrice = 0,
                currency = 'S/.'
              }) {
    this.id = id || this.generateId();
    this.description = description;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.currency = currency;
  }

  generateId() {
    return `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Computed property - Total del servicio
  get total() {
    return this.quantity * this.unitPrice;
  }

  // Validaciones básicas
  isValid() {
    return (
      this.description.trim().length > 0 &&
      this.quantity > 0 &&
      this.unitPrice >= 0
    );
  }

  // Formatear precio para mostrar
  getFormattedUnitPrice() {
    return `${this.currency} ${this.unitPrice.toFixed(2)}`;
  }

  getFormattedTotal() {
    return `${this.currency} ${this.total.toFixed(2)}`;
  }

  // Factory method para crear desde JSON
  static fromJSON(data) {
    return new ServiceItem({
      id: data.id,
      description: data.description || '',
      quantity: data.quantity || 1,
      unitPrice: data.unitPrice || 0,
      currency: data.currency || 'S/.'
    });
  }

  // Serialización para API
  toJSON() {
    return {
      id: this.id,
      description: this.description,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      currency: this.currency,
      total: this.total
    };
  }

  // Clone
  clone() {
    return new ServiceItem({
      id: this.generateId(), // Nuevo ID para el clon
      description: this.description,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      currency: this.currency
    });
  }
}
