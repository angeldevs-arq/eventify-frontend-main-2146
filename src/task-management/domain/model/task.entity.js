// src/task-management/domain/model/task.entity.js

/**
 * Entidad Task - Agregado raíz
 * Representa una tarea completa con todos sus atributos
 */
export class Task {
  constructor({
    id = null,
    title = '',
    description = '',
    status = 'TODO',
    priority = 'MEDIUM',
    assignedTo = null,
    dueDate = null,
    startDate = null,
    completedDate = null,
    estimatedHours = 0,
    tags = [],
    attachments = [],
    relatedEventId = null,
    createdBy = null,
    createdAt = null,
    updatedAt = null
  }) {
    this.id = id || this.generateId();
    this.title = title;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.assignedTo = assignedTo;
    this.dueDate = dueDate ? new Date(dueDate) : null;
    this.startDate = startDate ? new Date(startDate) : null;
    this.completedDate = completedDate ? new Date(completedDate) : null;
    this.estimatedHours = estimatedHours;
    this.tags = tags;
    this.attachments = attachments;
    this.relatedEventId = relatedEventId;
    this.createdBy = createdBy;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Estados disponibles
  static STATUS = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
    CANCELLED: 'CANCELLED'
  };

  // Prioridades disponibles
  static PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  };

  // Métodos de negocio - Gestión de estado
  canEdit() {
    return this.status !== Task.STATUS.DONE && this.status !== Task.STATUS.CANCELLED;
  }

  isDone() {
    return this.status === Task.STATUS.DONE;
  }

  isCancelled() {
    return this.status === Task.STATUS.CANCELLED;
  }

  isInProgress() {
    return this.status === Task.STATUS.IN_PROGRESS;
  }

  isTodo() {
    return this.status === Task.STATUS.TODO;
  }

  startTask() {
    if (this.isTodo()) {
      this.status = Task.STATUS.IN_PROGRESS;
      this.startDate = new Date();
      this.markAsUpdated();
    }
  }

  completeTask() {
    if (this.canEdit()) {
      this.status = Task.STATUS.DONE;
      this.completedDate = new Date();
      this.markAsUpdated();
    }
  }

  cancelTask() {
    if (this.canEdit()) {
      this.status = Task.STATUS.CANCELLED;
      this.markAsUpdated();
    }
  }

  reopenTask() {
    if (this.isDone() || this.isCancelled()) {
      this.status = Task.STATUS.TODO;
      this.completedDate = null;
      this.markAsUpdated();
    }
  }

  // Métodos de negocio - Prioridad
  isHighPriority() {
    return this.priority === Task.PRIORITY.HIGH || this.priority === Task.PRIORITY.CRITICAL;
  }

  isCritical() {
    return this.priority === Task.PRIORITY.CRITICAL;
  }

  increasePriority() {
    const priorities = [Task.PRIORITY.LOW, Task.PRIORITY.MEDIUM, Task.PRIORITY.HIGH, Task.PRIORITY.CRITICAL];
    const currentIndex = priorities.indexOf(this.priority);
    if (currentIndex < priorities.length - 1) {
      this.priority = priorities[currentIndex + 1];
      this.markAsUpdated();
    }
  }

  decreasePriority() {
    const priorities = [Task.PRIORITY.LOW, Task.PRIORITY.MEDIUM, Task.PRIORITY.HIGH, Task.PRIORITY.CRITICAL];
    const currentIndex = priorities.indexOf(this.priority);
    if (currentIndex > 0) {
      this.priority = priorities[currentIndex - 1];
      this.markAsUpdated();
    }
  }

  // Métodos de negocio - Fechas
  isOverdue() {
    if (!this.dueDate || this.isDone() || this.isCancelled()) return false;
    return new Date() > this.dueDate;
  }

  isDueSoon(daysThreshold = 3) {
    if (!this.dueDate || this.isDone() || this.isCancelled()) return false;
    const now = new Date();
    const diffTime = this.dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= daysThreshold;
  }

  getDaysUntilDue() {
    if (!this.dueDate) return null;
    const now = new Date();
    const diffTime = this.dueDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Métodos de negocio - Tags
  addTag(tag) {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.markAsUpdated();
    }
  }

  removeTag(tag) {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
      this.markAsUpdated();
    }
  }

  hasTag(tag) {
    return this.tags.includes(tag);
  }

  // Utilidades
  markAsUpdated() {
    this.updatedAt = new Date();
  }

  // Validaciones
  isValid() {
    return (
      this.title.trim().length > 0 &&
      Object.values(Task.STATUS).includes(this.status) &&
      Object.values(Task.PRIORITY).includes(this.priority)
    );
  }

  // Formatear fechas
  getFormattedDueDate() {
    if (!this.dueDate) return '';
    const day = String(this.dueDate.getDate()).padStart(2, '0');
    const month = String(this.dueDate.getMonth() + 1).padStart(2, '0');
    const year = this.dueDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getFormattedStartDate() {
    if (!this.startDate) return '';
    const day = String(this.startDate.getDate()).padStart(2, '0');
    const month = String(this.startDate.getMonth() + 1).padStart(2, '0');
    const year = this.startDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Obtener badge de estado para UI
  getStatusBadge() {
    const badges = {
      [Task.STATUS.TODO]: { severity: 'info', label: 'To Do' },
      [Task.STATUS.IN_PROGRESS]: { severity: 'warning', label: 'In Progress' },
      [Task.STATUS.DONE]: { severity: 'success', label: 'Done' },
      [Task.STATUS.CANCELLED]: { severity: 'danger', label: 'Cancelled' }
    };
    return badges[this.status] || badges[Task.STATUS.TODO];
  }

  // Obtener badge de prioridad para UI
  getPriorityBadge() {
    const badges = {
      [Task.PRIORITY.LOW]: { severity: 'success', label: 'Low', color: '#28A745' },
      [Task.PRIORITY.MEDIUM]: { severity: 'info', label: 'Medium', color: '#17A2B8' },
      [Task.PRIORITY.HIGH]: { severity: 'warning', label: 'High', color: '#FFC107' },
      [Task.PRIORITY.CRITICAL]: { severity: 'danger', label: 'Critical', color: '#DC3545' }
    };
    return badges[this.priority] || badges[Task.PRIORITY.MEDIUM];
  }

  // Factory method para crear desde JSON
  static fromJSON(data) {
    return new Task({
      id: data.id,
      title: data.title || '',
      description: data.description || '',
      status: data.status || Task.STATUS.TODO,
      priority: data.priority || Task.PRIORITY.MEDIUM,
      assignedTo: data.assignedTo,
      dueDate: data.dueDate,
      startDate: data.startDate,
      completedDate: data.completedDate,
      estimatedHours: data.estimatedHours || 0,
      tags: data.tags || [],
      attachments: data.attachments || [],
      relatedEventId: data.relatedEventId,
      createdBy: data.createdBy,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date()
    });
  }

  // Serialización para API
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      assignedTo: this.assignedTo,
      dueDate: this.dueDate ? this.dueDate.toISOString() : null,
      startDate: this.startDate ? this.startDate.toISOString() : null,
      completedDate: this.completedDate ? this.completedDate.toISOString() : null,
      estimatedHours: this.estimatedHours,
      tags: this.tags,
      attachments: this.attachments,
      relatedEventId: this.relatedEventId,
      createdBy: this.createdBy,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  // Clone
  clone() {
    return new Task({
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      assignedTo: this.assignedTo,
      dueDate: this.dueDate ? new Date(this.dueDate) : null,
      startDate: this.startDate ? new Date(this.startDate) : null,
      completedDate: this.completedDate ? new Date(this.completedDate) : null,
      estimatedHours: this.estimatedHours,
      tags: [...this.tags],
      attachments: [...this.attachments],
      relatedEventId: this.relatedEventId,
      createdBy: this.createdBy,
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt)
    });
  }
}
