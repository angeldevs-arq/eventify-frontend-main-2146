// src/task-management/domain/model/task-priority.entity.js

/**
 * Entidad TaskPriority - Value Object para prioridades
 * Encapsula la lógica y configuración de prioridades
 */
export class TaskPriority {
  constructor(level = 'MEDIUM') {
    this.level = level;
  }

  static LEVELS = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  };

  // Obtener todas las prioridades disponibles
  static getAllPriorities() {
    return [
      { value: 'LOW', label: 'Low', color: '#28A745', weight: 1, icon: 'pi-arrow-down' },
      { value: 'MEDIUM', label: 'Medium', color: '#17A2B8', weight: 2, icon: 'pi-minus' },
      { value: 'HIGH', label: 'High', color: '#FFC107', weight: 3, icon: 'pi-arrow-up' },
      { value: 'CRITICAL', label: 'Critical', color: '#DC3545', weight: 4, icon: 'pi-exclamation-triangle' }
    ];
  }

  // Obtener configuración de una prioridad
  static getConfig(level) {
    const configs = {
      LOW: { 
        label: 'Low', 
        color: '#28A745', 
        severity: 'success', 
        weight: 1,
        icon: 'pi-arrow-down'
      },
      MEDIUM: { 
        label: 'Medium', 
        color: '#17A2B8', 
        severity: 'info', 
        weight: 2,
        icon: 'pi-minus'
      },
      HIGH: { 
        label: 'High', 
        color: '#FFC107', 
        severity: 'warning', 
        weight: 3,
        icon: 'pi-arrow-up'
      },
      CRITICAL: { 
        label: 'Critical', 
        color: '#DC3545', 
        severity: 'danger', 
        weight: 4,
        icon: 'pi-exclamation-triangle'
      }
    };
    return configs[level] || configs.MEDIUM;
  }

  // Comparar prioridades
  static compare(priority1, priority2) {
    const config1 = this.getConfig(priority1);
    const config2 = this.getConfig(priority2);
    return config1.weight - config2.weight;
  }

  // Verificar si es alta prioridad
  static isHighPriority(level) {
    return level === this.LEVELS.HIGH || level === this.LEVELS.CRITICAL;
  }

  // Validar prioridad
  static isValid(level) {
    return Object.values(this.LEVELS).includes(level);
  }
}
