/**
 * Service Item Entity
 * Entidad de dominio para items de servicio en cotizaciones
 * Basada en ServiceItemResource del backend
 */

export class ServiceItem {
  constructor(data = {}) {
    this.id = data.id || null;  // UUID
    this.description = data.description || '';
    this.quantity = data.quantity || 1;
    this.unitPrice = data.unitPrice || 0;
    this.totalPrice = data.totalPrice || 0;
    this.quoteId = data.quoteId || null;
  }

  /**
   * Calcular precio total
   * @returns {number}
   */
  calculateTotal() {
    return this.quantity * this.unitPrice;
  }

  /**
   * Verificar si el total calculado coincide con el almacenado
   * @returns {boolean}
   */
  isTotalValid() {
    const calculated = this.calculateTotal();
    return Math.abs(this.totalPrice - calculated) < 0.01;
  }

  /**
   * Actualizar precio total automáticamente
   */
  updateTotal() {
    this.totalPrice = this.calculateTotal();
  }

  /**
   * Obtener precio unitario formateado
   * @param {string} currency - Símbolo de moneda (default: S/)
   * @returns {string}
   */
  getFormattedUnitPrice(currency = 'S/') {
    return `${currency} ${this.unitPrice.toFixed(2)}`;
  }

  /**
   * Obtener precio total formateado
   * @param {string} currency - Símbolo de moneda (default: S/)
   * @returns {string}
   */
  getFormattedTotalPrice(currency = 'S/') {
    return `${currency} ${this.totalPrice.toFixed(2)}`;
  }

  /**
   * Convertir a DTO para crear
   * @returns {CreateServiceItemResource}
   */
  toCreateDTO() {
    return {
      description: this.description,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      totalPrice: this.totalPrice,
      quoteId: this.quoteId
    };
  }

  /**
   * Convertir a DTO para actualizar
   * @returns {UpdateServiceItemResource}
   */
  toUpdateDTO() {
    return {
      description: this.description,
      quantity: this.quantity,
      unitPrice: this.unitPrice,
      totalPrice: this.totalPrice
    };
  }

  /**
   * Validar datos del item
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.description?.trim()) {
      errors.push('La descripción es obligatoria');
    }

    if (this.description?.length > 200) {
      errors.push('La descripción no puede exceder 200 caracteres');
    }

    if (!this.quantity || this.quantity <= 0) {
      errors.push('La cantidad debe ser mayor a 0');
    }

    if (this.quantity > 1000) {
      errors.push('La cantidad no puede exceder 1000 unidades');
    }

    if (!this.unitPrice || this.unitPrice <= 0) {
      errors.push('El precio unitario debe ser mayor a 0');
    }

    if (this.unitPrice > 1000000) {
      errors.push('El precio unitario es demasiado alto');
    }

    if (!this.isTotalValid()) {
      errors.push('El precio total no coincide con cantidad × precio unitario');
    }

    if (!this.quoteId) {
      errors.push('El ID de la cotización es obligatorio');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Crear instancia desde datos del backend
   * @param {Object} data - ServiceItemResource del backend
   * @returns {ServiceItem}
   */
  static fromBackend(data) {
    return new ServiceItem(data);
  }

  /**
   * Crear item vacío
   * @param {string} quoteId - UUID de la cotización
   * @returns {ServiceItem}
   */
  static empty(quoteId) {
    return new ServiceItem({
      quoteId,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    });
  }

  /**
   * Crear item con cálculo automático
   * @param {string} quoteId - UUID de la cotización
   * @param {string} description - Descripción del servicio
   * @param {number} quantity - Cantidad
   * @param {number} unitPrice - Precio unitario
   * @returns {ServiceItem}
   */
  static create(quoteId, description, quantity, unitPrice) {
    const item = new ServiceItem({
      quoteId,
      description,
      quantity,
      unitPrice
    });
    item.updateTotal();
    return item;
  }

  /**
   * Categorías comunes de servicios
   * @returns {string[]}
   */
  static getCommonServiceCategories() {
    return [
      'Catering',
      'Fotografía',
      'Video',
      'Música/DJ',
      'Decoración',
      'Flores',
      'Pastel',
      'Bebidas',
      'Mobiliario',
      'Iluminación',
      'Sonido',
      'Entretenimiento',
      'Transporte',
      'Invitaciones',
      'Vestuario',
      'Maquillaje',
      'Venue/Lugar',
      'Coordinación',
      'Seguridad',
      'Otros'
    ];
  }
}
