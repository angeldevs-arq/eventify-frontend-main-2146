// src/task-management/application/services/task-item.service.js

/**
 * Servicio de utilidad para operaciones relacionadas con tareas
 * Lógica de negocio no relacionada directamente con la API
 */

export class TaskItemService {
  /**
   * Calcular progreso de tareas
   * @param {Array} tasks - Lista de tareas
   * @returns {Object} - { total, completed, inProgress, todo, percentage }
   */
  static calculateProgress(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'DONE').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter(t => t.status === 'TODO').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      inProgress,
      todo,
      percentage
    };
  }

  /**
   * Verificar si una tarea está vencida
   * @param {Date} dueDate - Fecha de vencimiento
   * @returns {boolean}
   */
  static isOverdue(dueDate) {
    if (!dueDate) return false;
    const now = new Date();
    const due = new Date(dueDate);
    return due < now;
  }

  /**
   * Verificar si una tarea está próxima a vencer
   * @param {Date} dueDate - Fecha de vencimiento
   * @param {number} daysThreshold - Días de umbral (por defecto 3)
   * @returns {boolean}
   */
  static isDueSoon(dueDate, daysThreshold = 3) {
    if (!dueDate) return false;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= daysThreshold;
  }

  /**
   * Ordenar tareas por prioridad y fecha
   * @param {Array} tasks - Lista de tareas
   * @returns {Array} - Tareas ordenadas
   */
  static sortByPriorityAndDate(tasks) {
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    
    return [...tasks].sort((a, b) => {
      // Primero por prioridad
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Luego por fecha de vencimiento
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }

  /**
   * Filtrar tareas por búsqueda de texto
   * @param {Array} tasks - Lista de tareas
   * @param {string} query - Término de búsqueda
   * @returns {Array} - Tareas filtradas
   */
  static filterBySearchQuery(tasks, query) {
    if (!query || query.trim() === '') return tasks;
    
    const lowerQuery = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowerQuery) ||
      (task.description && task.description.toLowerCase().includes(lowerQuery)) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  /**
   * Agrupar tareas por estado
   * @param {Array} tasks - Lista de tareas
   * @returns {Object} - { TODO: [], IN_PROGRESS: [], DONE: [], CANCELLED: [] }
   */
  static groupByStatus(tasks) {
    return tasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {});
  }

  /**
   * Agrupar tareas por prioridad
   * @param {Array} tasks - Lista de tareas
   * @returns {Object} - { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] }
   */
  static groupByPriority(tasks) {
    return tasks.reduce((acc, task) => {
      if (!acc[task.priority]) {
        acc[task.priority] = [];
      }
      acc[task.priority].push(task);
      return acc;
    }, {});
  }

  /**
   * Obtener tareas vencidas
   * @param {Array} tasks - Lista de tareas
   * @returns {Array} - Tareas vencidas
   */
  static getOverdueTasks(tasks) {
    return tasks.filter(task => 
      task.status !== 'DONE' && 
      task.status !== 'CANCELLED' && 
      this.isOverdue(task.dueDate)
    );
  }

  /**
   * Obtener tareas de alta prioridad
   * @param {Array} tasks - Lista de tareas
   * @returns {Array} - Tareas de alta prioridad
   */
  static getHighPriorityTasks(tasks) {
    return tasks.filter(task => 
      task.priority === 'CRITICAL' || task.priority === 'HIGH'
    );
  }

  /**
   * Validar estructura de tarea
   * @param {Object} task - Datos de la tarea
   * @returns {Object} - { valid: boolean, errors: Array }
   */
  static validateTask(task) {
    const errors = [];

    if (!task.title || task.title.trim() === '') {
      errors.push('Title is required');
    }

    if (task.title && task.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (!task.priority || !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(task.priority)) {
      errors.push('Valid priority is required (LOW, MEDIUM, HIGH, CRITICAL)');
    }

    if (!task.status || !['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(task.status)) {
      errors.push('Valid status is required (TODO, IN_PROGRESS, DONE, CANCELLED)');
    }

    if (task.dueDate && isNaN(Date.parse(task.dueDate))) {
      errors.push('Invalid due date format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generar resumen de tareas para dashboard
   * @param {Array} tasks - Lista de tareas
   * @returns {Object} - Resumen completo
   */
  static generateSummary(tasks) {
    const progress = this.calculateProgress(tasks);
    const overdue = this.getOverdueTasks(tasks);
    const highPriority = this.getHighPriorityTasks(tasks);
    const byStatus = this.groupByStatus(tasks);
    const byPriority = this.groupByPriority(tasks);

    return {
      progress,
      overdueCount: overdue.length,
      highPriorityCount: highPriority.length,
      byStatus,
      byPriority,
      recentTasks: tasks.slice(0, 5)
    };
  }
}
