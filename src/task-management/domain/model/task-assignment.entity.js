// src/task-management/domain/model/task-assignment.entity.js

/**
 * Entidad TaskAssignment - Representa la asignación de una tarea a un usuario
 */
export class TaskAssignment {
  constructor({
    id = null,
    userId = '',
    userName = '',
    userEmail = '',
    userAvatar = '',
    role = 'MEMBER',
    assignedAt = null,
    assignedBy = null
  }) {
    this.id = id || this.generateId();
    this.userId = userId;
    this.userName = userName;
    this.userEmail = userEmail;
    this.userAvatar = userAvatar;
    this.role = role;
    this.assignedAt = assignedAt || new Date();
    this.assignedBy = assignedBy;
  }

  generateId() {
    return `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Roles disponibles
  static ROLES = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
    VIEWER: 'VIEWER'
  };

  // Validaciones
  isValid() {
    return this.userId.trim().length > 0 && this.userName.trim().length > 0;
  }

  hasEmail() {
    return this.userEmail && this.userEmail.includes('@');
  }

  // Permisos
  canEdit() {
    return this.role === TaskAssignment.ROLES.OWNER || this.role === TaskAssignment.ROLES.ADMIN;
  }

  canView() {
    return Object.values(TaskAssignment.ROLES).includes(this.role);
  }

  // Factory method para crear desde JSON
  static fromJSON(data) {
    return new TaskAssignment({
      id: data.id,
      userId: data.userId || '',
      userName: data.userName || '',
      userEmail: data.userEmail || '',
      userAvatar: data.userAvatar || '',
      role: data.role || TaskAssignment.ROLES.MEMBER,
      assignedAt: data.assignedAt ? new Date(data.assignedAt) : new Date(),
      assignedBy: data.assignedBy
    });
  }

  // Serialización para API
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      userName: this.userName,
      userEmail: this.userEmail,
      userAvatar: this.userAvatar,
      role: this.role,
      assignedAt: this.assignedAt.toISOString(),
      assignedBy: this.assignedBy
    };
  }

  // Clone
  clone() {
    return new TaskAssignment({
      id: this.id,
      userId: this.userId,
      userName: this.userName,
      userEmail: this.userEmail,
      userAvatar: this.userAvatar,
      role: this.role,
      assignedAt: new Date(this.assignedAt),
      assignedBy: this.assignedBy
    });
  }
}
