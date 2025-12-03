/**
 * Social Event Entity
 * Entidad de dominio para eventos sociales
 * Basada en SocialEventResource del backend
 */

export class SocialEvent {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.date = data.date || null;  // ISO Date (YYYY-MM-DD)
    this.customerName = data.customerName || '';
    this.place = data.place || '';
    this.status = data.status || 'PENDING';
  }

  /**
   * Obtener fecha formateada
   * @returns {string}
   */
  get formattedDate() {
    if (!this.date) return '';
    
    const date = new Date(this.date);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Verificar si el evento es futuro
   * @returns {boolean}
   */
  isFuture() {
    if (!this.date) return false;
    const eventDate = new Date(this.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate > today;
  }

  /**
   * Verificar si el evento es hoy
   * @returns {boolean}
   */
  isToday() {
    if (!this.date) return false;
    const eventDate = new Date(this.date);
    const today = new Date();
    
    return eventDate.toDateString() === today.toDateString();
  }

  /**
   * Verificar si el evento es pasado
   * @returns {boolean}
   */
  isPast() {
    if (!this.date) return false;
    const eventDate = new Date(this.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  }

  /**
   * Obtener días hasta/desde el evento
   * @returns {number} - Positivo si es futuro, negativo si es pasado
   */
  getDaysFromNow() {
    if (!this.date) return 0;
    
    const eventDate = new Date(this.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Obtener etiqueta de tiempo relativo
   * @returns {string}
   */
  getRelativeTimeLabel() {
    const days = this.getDaysFromNow();
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    if (days === -1) return 'Ayer';
    if (days > 0) return `En ${days} días`;
    if (days < 0) return `Hace ${Math.abs(days)} días`;
    
    return '';
  }

  /**
   * Obtener color según el estado del tiempo
   * @returns {string}
   */
  getTimeStatusColor() {
    if (this.isToday()) return 'success';
    if (this.isFuture()) return 'info';
    return 'secondary';
  }

  /**
   * Obtener color según el estado
   * @returns {string}
   */
  getStatusColor() {
    const colors = {
      'PENDING': 'warning',
      'CONFIRMED': 'success',
      'CANCELLED': 'danger',
      'COMPLETED': 'info'
    };
    return colors[this.status] || 'secondary';
  }

  /**
   * Convertir a DTO para crear
   * @returns {CreateSocialEventResource}
   */
  toCreateDTO() {
    return {
      title: this.title,
      place: this.place,
      date: this.date,
      customerName: this.customerName,
      status: this.status
    };
  }

  /**
   * Convertir a DTO para actualizar
   * @returns {UpdateSocialEventResource}
   */
  toUpdateDTO() {
    return {
      title: this.title,
      date: this.date,
      customerName: this.customerName,
      place: this.place,
      status: this.status
    };
  }

  /**
   * Validar datos del evento
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.title?.trim()) {
      errors.push('El título es obligatorio');
    }

    if (this.title?.length > 200) {
      errors.push('El título no puede exceder 200 caracteres');
    }

    if (!this.place?.trim()) {
      errors.push('El lugar es obligatorio');
    }

    if (!this.date) {
      errors.push('La fecha es obligatoria');
    }

    if (!this.customerName?.trim()) {
      errors.push('El nombre del cliente es obligatorio');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Crear instancia desde datos del backend
   * @param {Object} data - SocialEventResource del backend
   * @returns {SocialEvent}
   */
  static fromBackend(data) {
    return new SocialEvent(data);
  }

  /**
   * Crear evento vacío
   * @returns {SocialEvent}
   */
  static empty() {
    return new SocialEvent({
      status: 'PENDING'
    });
  }

  /**
   * Crear evento desde cotización
   * @param {Quote} quote - Cotización confirmada
   * @param {string} customerName - Nombre del cliente
   * @returns {SocialEvent}
   */
  static fromQuote(quote, customerName) {
    return new SocialEvent({
      title: quote.title,
      place: quote.location,
      date: quote.eventDate.split('T')[0], // Extraer solo fecha
      customerName: customerName,
      status: 'CONFIRMED'
    });
  }

  /**
   * Estados comunes de eventos
   * @returns {string[]}
   */
  static getCommonStatuses() {
    return [
      'PENDING',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED'
    ];
  }

  /**
   * Etiquetas de estados en español
   * @returns {Object}
   */
  static getStatusLabels() {
    return {
      'PENDING': 'Pendiente',
      'CONFIRMED': 'Confirmado',
      'IN_PROGRESS': 'En Progreso',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado'
    };
  }
}
