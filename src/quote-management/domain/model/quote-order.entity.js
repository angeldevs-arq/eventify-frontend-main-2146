
import { Customer } from './customer.entity.js';
import { Event } from './event.entity.js';
import { Organizer } from './organizer.entity.js';
import { ServiceItem } from './service-item.entity.js';

/**
 * Entidad QuoteOrder - Agregado raíz
 * Representa una cotización completa con todos sus componentes
 */
export class QuoteOrder {
  constructor({
                id = null,
                customer = null,
                event = null,
                organizer = null,
                services = [],
                state = 'DRAFT',
                vatPercentage = 18,
                currency = 'S/.',
                createdAt = null,
                updatedAt = null,
                ownerId = null
              }) {
    this.id = id || this.generateId();
    this.customer = customer || new Customer({});
    this.event = event || new Event({});
    this.organizer = organizer || new Organizer({});
    this.services = services;
    this.state = state;
    this.vatPercentage = vatPercentage;
    this.currency = currency;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.ownerId = ownerId;
  }

  generateId() {
    return `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Estados disponibles
  static STATES = {
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    DECLINED: 'DECLINED'
  };

  // Computed properties - Cálculos financieros
  get subtotal() {
    return this.services.reduce((sum, service) => sum + service.total, 0);
  }

  get vat() {
    return (this.subtotal * this.vatPercentage) / 100;
  }

  get total() {
    return this.subtotal + this.vat;
  }

  // Formatear montos
  getFormattedSubtotal() {
    return `${this.currency} ${this.subtotal.toFixed(2)}`;
  }

  getFormattedVAT() {
    return `${this.currency} ${this.vat.toFixed(2)}`;
  }

  getFormattedTotal() {
    return `${this.currency} ${this.total.toFixed(2)}`;
  }

  // Métodos de negocio - Gestión de servicios
  addService(service) {
    if (!(service instanceof ServiceItem)) {
      throw new Error('El servicio debe ser una instancia de ServiceItem');
    }
    this.services.push(service);
    this.markAsUpdated();
  }

  removeService(serviceId) {
    const index = this.services.findIndex(s => s.id === serviceId);
    if (index !== -1) {
      this.services.splice(index, 1);
      this.markAsUpdated();
    }
  }

  updateService(serviceId, updates) {
    const service = this.services.find(s => s.id === serviceId);
    if (service) {
      Object.assign(service, updates);
      this.markAsUpdated();
    }
  }

  clearServices() {
    this.services = [];
    this.markAsUpdated();
  }

  // Métodos de negocio - Gestión de estado
  canEdit() {
    return this.state === QuoteOrder.STATES.DRAFT || this.state === QuoteOrder.STATES.PENDING;
  }

  isApproved() {
    return this.state === QuoteOrder.STATES.APPROVED;
  }

  isDeclined() {
    return this.state === QuoteOrder.STATES.DECLINED;
  }

  isPending() {
    return this.state === QuoteOrder.STATES.PENDING;
  }

  isDraft() {
    return this.state === QuoteOrder.STATES.DRAFT;
  }

  sendToPending() {
    if (this.canEdit()) {
      this.state = QuoteOrder.STATES.PENDING;
      this.markAsUpdated();
    }
  }

  approve() {
    if (this.isPending()) {
      this.state = QuoteOrder.STATES.APPROVED;
      this.markAsUpdated();
    }
  }

  decline() {
    if (this.isPending()) {
      this.state = QuoteOrder.STATES.DECLINED;
      this.markAsUpdated();
    }
  }

  backToDraft() {
    if (this.isPending()) {
      this.state = QuoteOrder.STATES.DRAFT;
      this.markAsUpdated();
    }
  }

  // Utilidades
  markAsUpdated() {
    this.updatedAt = new Date();
  }

  // Validaciones
  isValid() {
    return (
      this.customer.isValid() &&
      this.event.isValid() &&
      this.services.length > 0 &&
      this.services.every(s => s.isValid())
    );
  }

  // Obtener badge de estado para UI
  getStateBadge() {
    const badges = {
      [QuoteOrder.STATES.DRAFT]: { severity: 'info', label: 'Draft' },
      [QuoteOrder.STATES.PENDING]: { severity: 'warning', label: 'Pending' },
      [QuoteOrder.STATES.APPROVED]: { severity: 'success', label: 'Approved' },
      [QuoteOrder.STATES.DECLINED]: { severity: 'danger', label: 'Declined' }
    };
    return badges[this.state] || badges[QuoteOrder.STATES.DRAFT];
  }

  // Factory method para crear desde JSON (API fake)
  static fromJSON(data) {
    return new QuoteOrder({
      id: data.id,
      customer: data.customer
        ? Customer.fromJSON({
          ...data.customer,
          id: data.customer.id ?? data.customerId ?? null,
        })
        : new Customer({ id: data.customerId ?? null }),      event: data.event ? Event.fromJSON(data.event) : new Event({}),
      organizer: data.organizer ? Organizer.fromJSON(data.organizer) : new Organizer({}),
      services: data.services ? data.services.map(s => ServiceItem.fromJSON(s)) : [],
      state: data.state || QuoteOrder.STATES.DRAFT,
      vatPercentage: data.vatPercentage || 18,
      currency: data.currency || 'S/.',
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      ownerId: data.ownerId ?? data.organizerId ?? data.customerId ?? null });
  }

  // Serialización para API fake
  toJSON() {
    return {
      id: this.id,
      customer: this.customer.toJSON(),
      event: this.event.toJSON(),
      organizer: this.organizer.toJSON(),
      services: this.services.map(s => s.toJSON()),
      state: this.state,
      vatPercentage: this.vatPercentage,
      currency: this.currency,
      subtotal: this.subtotal,
      vat: this.vat,
      total: this.total,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      ownerId: this.ownerId || this.organizer?.id || null,
      organizerId: this.organizer?.id || null,
      customerId: this.customer?.id || null
    };
  }

  // Clone para inmutabilidad
  clone() {
    return new QuoteOrder({
      id: this.id,
      customer: this.customer.clone(),
      event: this.event.clone(),
      organizer: this.organizer.clone(),
      services: this.services.map(s => s.clone()),
      state: this.state,
      vatPercentage: this.vatPercentage,
      currency: this.currency,
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt),
      ownerId: this.ownerId
    });
  }
}
