
/**
 * Entidad Event - Representa un evento
 * Estructura simplificada para frontend
 */
export class Event {
  constructor({
                id = null,
                type = '',
                name = '',
                date = null,
                location = '',
                numberOfGuests = 0
              }) {
    this.id = id || this.generateId();
    this.type = type;
    this.name = name;
    this.date = date ? new Date(date) : null;
    this.location = location;
    this.numberOfGuests = numberOfGuests;
  }

  generateId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validaciones básicas
  isValid() {
    return (
      this.type.trim().length > 0 &&
      this.name.trim().length > 0 &&
      this.date !== null &&
      this.location.trim().length > 0 &&
      this.numberOfGuests > 0
    );
  }

  // Formatear fecha para mostrar
  getFormattedDate() {
    if (!this.date) return '';

    const day = String(this.date.getDate()).padStart(2, '0');
    const month = String(this.date.getMonth() + 1).padStart(2, '0');
    const year = this.date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // Tipos de eventos disponibles
  static getEventTypes() {
    return [
      { value: 'WEDDING', label: 'Wedding' },
      { value: 'CONFERENCE', label: 'Conference' },
      { value: 'CORPORATE_PARTY', label: 'Corporate Party' },
      { value: 'BABY_SHOWER', label: 'Baby Shower' },
      { value: 'GRADUATION', label: 'Graduation' },
      { value: 'BIRTHDAY', label: 'Birthday' },
      { value: 'FIFTEEN_YEARS', label: 'Fifteen Years' },
      { value: 'OTHER', label: 'Other' }
    ];
  }

  // Factory method para crear desde JSON
  static fromJSON(data) {
    return new Event({
      id: data.id,
      type: data.type || '',
      name: data.name || '',
      date: data.date,
      location: data.location || '',
      numberOfGuests: data.numberOfGuests || 0
    });
  }

  // Serialización para API
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      date: this.date ? this.date.toISOString() : null,
      location: this.location,
      numberOfGuests: this.numberOfGuests
    };
  }

  // Clone
  clone() {
    return new Event({
      id: this.id,
      type: this.type,
      name: this.name,
      date: this.date ? new Date(this.date) : null,
      location: this.location,
      numberOfGuests: this.numberOfGuests
    });
  }
}
