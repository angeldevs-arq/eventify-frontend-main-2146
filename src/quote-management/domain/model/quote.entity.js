/**
 * Quote Entity
 * Entidad de dominio para cotizaciones
 * Basada en QuoteResource del backend
 */

export class Quote {
  constructor(data = {}) {
    this.quoteId = data.quoteId || null;  // UUID
    this.title = data.title || '';
    this.eventType = data.eventType || '';
    this.guestQuantity = data.guestQuantity || 0;
    this.location = data.location || '';
    this.totalPrice = data.totalPrice || 0;
    this.state = data.state || 'PENDING';  // "PENDING" | "CONFIRMED" | "REJECTED"
    this.eventDate = data.eventDate || null;  // ISO DateTime
    this.organizerId = data.organizerId || null;
    this.hostId = data.hostId || null;
  }

  /**
   * Verificar si está pendiente
   * @returns {boolean}
   */
  isPending() {
    return this.state === 'PENDING';
  }

  /**
   * Verificar si está confirmada
   * @returns {boolean}
   */
  isConfirmed() {
    return this.state === 'CONFIRMED';
  }

  /**
   * Verificar si está rechazada
   * @returns {boolean}
   */
  isRejected() {
    return this.state === 'REJECTED';
  }

  /**
   * Obtener fecha formateada
   * @returns {string}
   */
  get formattedEventDate() {
    if (!this.eventDate) return '';
    
    const date = new Date(this.eventDate);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtener precio formateado
   * @param {string} currency - Símbolo de moneda (default: S/)
   * @returns {string}
   */
  getFormattedPrice(currency = 'S/') {
    return `${currency} ${this.totalPrice.toFixed(2)}`;
  }

  /**
   * Verificar si la fecha del evento es futura
   * @returns {boolean}
   */
  isFutureEvent() {
    if (!this.eventDate) return false;
    return new Date(this.eventDate) > new Date();
  }

  /**
   * Verificar si la fecha del evento es pasada
   * @returns {boolean}
   */
  isPastEvent() {
    if (!this.eventDate) return false;
    return new Date(this.eventDate) < new Date();
  }

  /**
   * Obtener días hasta el evento
   * @returns {number}
   */
  getDaysUntilEvent() {
    if (!this.eventDate) return 0;
    
    const now = new Date();
    const eventDate = new Date(this.eventDate);
    const diffTime = eventDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Obtener color según el estado
   * @returns {string}
   */
  getStateColor() {
    const colors = {
      'PENDING': 'warning',
      'CONFIRMED': 'success',
      'REJECTED': 'danger'
    };
    return colors[this.state] || 'info';
  }

  /**
   * Obtener etiqueta del estado en español
   * @returns {string}
   */
  getStateLabel() {
    const labels = {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmada',
      'REJECTED': 'Rechazada'
    };
    return labels[this.state] || this.state;
  }

  /**
   * Convertir a DTO para crear
   * @returns {CreateQuoteResource}
   */
  toCreateDTO() {
    return {
      title: this.title,
      eventType: this.eventType,
      guestQuantity: this.guestQuantity,
      location: this.location,
      totalPrice: this.totalPrice,
      state: this.state,
      eventDate: this.eventDate,
      organizerId: this.organizerId,
      hostId: this.hostId
    };
  }

  /**
   * Convertir a DTO para actualizar
   * @returns {UpdateQuoteResource}
   */
  toUpdateDTO() {
    return {
      title: this.title,
      eventType: this.eventType,
      guestQuantity: this.guestQuantity,
      location: this.location,
      totalPrice: this.totalPrice,
      eventDate: this.eventDate
    };
  }

  /**
   * Validar datos de la cotización
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.title?.trim()) {
      errors.push('El título es obligatorio');
    }

    if (!this.eventType?.trim()) {
      errors.push('El tipo de evento es obligatorio');
    }

    if (!this.guestQuantity || this.guestQuantity <= 0) {
      errors.push('La cantidad de invitados debe ser mayor a 0');
    }

    if (!this.location?.trim()) {
      errors.push('La ubicación es obligatoria');
    }

    if (!this.eventDate) {
      errors.push('La fecha del evento es obligatoria');
    } else if (!this.isFutureEvent()) {
      errors.push('La fecha del evento debe ser futura');
    }

    if (!this.organizerId) {
      errors.push('El ID del organizador es obligatorio');
    }

    if (!this.hostId) {
      errors.push('El ID del host es obligatorio');
    }

    if (this.totalPrice < 0) {
      errors.push('El precio total no puede ser negativo');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Crear instancia desde datos del backend
   * @param {Object} data - QuoteResource del backend
   * @returns {Quote}
   */
  static fromBackend(data) {
    return new Quote(data);
  }

  /**
   * Crear cotización vacía
   * @param {number} organizerId - ID del organizador
   * @param {number} hostId - ID del host
   * @returns {Quote}
   */
  static empty(organizerId, hostId) {
    return new Quote({
      organizerId,
      hostId,
      state: 'PENDING',
      totalPrice: 0,
      guestQuantity: 1
    });
  }

  /**
   * Tipos de eventos comunes
   * @returns {string[]}
   */
  static getCommonEventTypes() {
    return [
      'Boda',
      'Cumpleaños',
      'Aniversario',
      'Baby Shower',
      'Graduación',
      'Compromiso',
      'Bautizo',
      'Primera Comunión',
      'Quinceañera',
      'Corporativo',
      'Reunión Familiar',
      'Otro'
    ];
  }
}
