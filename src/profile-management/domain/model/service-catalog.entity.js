/**
 * Service Catalog Entity
 * Entidad de dominio para catálogos de servicios del organizador
 * Basada en ServiceCatalogResource del backend
 */

export class ServiceCatalog {
  constructor(data = {}) {
    this.id = data.id || null;
    this.profileId = data.profileId || null;
    this.title = data.title || '';
    this.description = data.description || '';
    this.category = data.category || '';
    this.priceFrom = data.priceFrom || 0;
    this.priceTo = data.priceTo || 0;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  /**
   * Obtener rango de precio formateado
   * @param {string} currency - Símbolo de moneda (default: $)
   * @returns {string}
   */
  getPriceRange(currency = '$') {
    if (this.priceFrom === this.priceTo) {
      return `${currency}${this.priceFrom.toFixed(2)}`;
    }
    return `${currency}${this.priceFrom.toFixed(2)} - ${currency}${this.priceTo.toFixed(2)}`;
  }

  /**
   * Obtener precio promedio
   * @returns {number}
   */
  get averagePrice() {
    return (this.priceFrom + this.priceTo) / 2;
  }

  /**
   * Verificar si tiene rango de precio
   * @returns {boolean}
   */
  hasPriceRange() {
    return this.priceFrom !== this.priceTo;
  }

  /**
   * Verificar si está dentro de un rango de precio
   * @param {number} minPrice
   * @param {number} maxPrice
   * @returns {boolean}
   */
  isInPriceRange(minPrice, maxPrice) {
    return this.priceFrom >= minPrice && this.priceTo <= maxPrice;
  }

  /**
   * Verificar si pertenece a una categoría
   * @param {string} category
   * @returns {boolean}
   */
  isInCategory(category) {
    return this.category?.toLowerCase() === category?.toLowerCase();
  }

  /**
   * Convertir a DTO para crear/actualizar
   * @returns {CreateServiceCatalogResource}
   */
  toCreateDTO() {
    return {
      profileId: this.profileId,
      title: this.title,
      description: this.description,
      category: this.category,
      priceFrom: this.priceFrom,
      priceTo: this.priceTo
    };
  }

  /**
   * Validar datos del catálogo
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.profileId) {
      errors.push('El profileId es obligatorio');
    }

    if (!this.title?.trim()) {
      errors.push('El título es obligatorio');
    }

    if (this.title?.length > 100) {
      errors.push('El título no puede exceder 100 caracteres');
    }

    if (!this.category?.trim()) {
      errors.push('La categoría es obligatoria');
    }

    if (this.priceFrom < 0) {
      errors.push('El precio mínimo no puede ser negativo');
    }

    if (this.priceTo < 0) {
      errors.push('El precio máximo no puede ser negativo');
    }

    if (this.priceTo < this.priceFrom) {
      errors.push('El precio máximo debe ser mayor o igual al precio mínimo');
    }

    if (this.description?.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Crear instancia desde datos del backend
   * @param {Object} data - ServiceCatalogResource del backend
   * @returns {ServiceCatalog}
   */
  static fromBackend(data) {
    return new ServiceCatalog(data);
  }

  /**
   * Crear catálogo vacío
   * @param {number} profileId - ID del perfil
   * @returns {ServiceCatalog}
   */
  static empty(profileId) {
    return new ServiceCatalog({
      profileId,
      priceFrom: 0,
      priceTo: 0
    });
  }

  /**
   * Categorías predefinidas comunes
   * @returns {string[]}
   */
  static getCommonCategories() {
    return [
      'Fotografía',
      'Catering',
      'Música y DJ',
      'Decoración',
      'Floristería',
      'Entretenimiento',
      'Vestuario',
      'Transporte',
      'Venue/Lugar',
      'Video',
      'Maquillaje y Estilismo',
      'Pastelería',
      'Bebidas',
      'Coordinación',
      'Iluminación',
      'Sonido',
      'Mobiliario',
      'Invitaciones',
      'Otros'
    ];
  }
}
