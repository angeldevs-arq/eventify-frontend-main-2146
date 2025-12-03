// src/task-management/domain/model/task.entity.js

/**
 * Entidad Task - Adaptada al backend task-event-services
 * Representa una tarea asociada a un evento
 */
export class Task {
  constructor({
    id = null,
    title = '',
    description = '',
    status = 'PENDING',
    dueDate = null,
    eventId = null,
    assignedUserId = null,
    createdAt = null,
    updatedAt = null
  }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.dueDate = dueDate ? new Date(dueDate) : null;
    this.eventId = eventId;
    this.assignedUserId = assignedUserId;
    this.createdAt = createdAt ? new Date(createdAt) : new Date();
    this.updatedAt = updatedAt ? new Date(updatedAt) : new Date();
  }

  // Estados disponibles según el backend
  static STATUS = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED'
  };

  // Métodos de negocio - Gestión de estado
  canEdit() {
    return this.status !== Task.STATUS.COMPLETED;
  }

  isCompleted() {
    return this.status === Task.STATUS.COMPLETED;
  }

  isInProgress() {
    return this.status === Task.STATUS.IN_PROGRESS;
  }

  isPending() {
    return this.status === Task.STATUS.PENDING;
  }

  startTask() {
    if (this.isPending()) {
      this.status = Task.STATUS.IN_PROGRESS;
      this.markAsUpdated();
    }
  }

  completeTask() {
    if (this.canEdit()) {
      this.status = Task.STATUS.COMPLETED;
      this.markAsUpdated();
    }
  }

  reopenTask() {
    if (this.isCompleted()) {
      this.status = Task.STATUS.PENDING;
      this.markAsUpdated();
    }
  }

  // Métodos de negocio - Fechas
  isOverdue() {
    if (!this.dueDate || this.isCompleted()) return false;
    return new Date() > this.dueDate;
  }

  isDueSoon(daysThreshold = 3) {
    if (!this.dueDate || this.isCompleted()) return false;
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

  // Utilidades
  markAsUpdated() {
    this.updatedAt = new Date();
  }

  // Validaciones
  isValid() {
    return (
      this.title.trim().length > 0 &&
      Object.values(Task.STATUS).includes(this.status) &&
      this.dueDate !== null
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

  // Obtener badge de estado para UI
  getStatusBadge() {
    const badges = {
      [Task.STATUS.PENDING]: { severity: 'info', label: 'Por Hacer', color: '#2196F3' },
      [Task.STATUS.IN_PROGRESS]: { severity: 'warning', label: 'En Proceso', color: '#FF9800' },
      [Task.STATUS.COMPLETED]: { severity: 'success', label: 'Completado', color: '#4CAF50' }
    };
    return badges[this.status] || badges[Task.STATUS.PENDING];
  }

  // Factory method para crear desde JSON
  static fromJSON(data) {
    return new Task({
      id: data.id,
      title: data.title || '',
      description: data.description || '',
      status: data.status || Task.STATUS.PENDING,
      dueDate: data.dueDate,
      eventId: data.eventId,
      assignedUserId: data.assignedUserId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }

  // Serialización para API
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      dueDate: this.dueDate ? this.dueDate.toISOString().split('T')[0] : null,
      eventId: this.eventId,
      assignedUserId: this.assignedUserId,
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
      dueDate: this.dueDate ? new Date(this.dueDate) : null,
      eventId: this.eventId,
      assignedUserId: this.assignedUserId,
      createdAt: new Date(this.createdAt),
      updatedAt: new Date(this.updatedAt)
    });
  }
}
