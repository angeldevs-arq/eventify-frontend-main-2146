<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    header="Vista Previa de Tarea"
    :modal="true"
    :closable="true"
    :dismissableMask="true"
    class="task-preview-dialog"
    :style="{ width: '90vw', maxWidth: '800px' }"
  >
    <div class="preview-content">
      <!-- Header con información principal -->
      <div class="preview-header">
        <div class="header-left">
          <h2 class="task-title">{{ task.title }}</h2>
          <div class="task-meta">
            <TaskStateBadge :status="task.status" />
            <div class="priority-badge" :style="{ backgroundColor: getPriorityColor() }">
              <i :class="`pi ${getPriorityIcon()}`"></i>
              <span>{{ getPriorityLabel() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div v-if="task.description" class="preview-section">
        <h3 class="section-title">Descripción</h3>
        <p class="task-description">{{ task.description }}</p>
      </div>

      <!-- Details Grid -->
      <div class="preview-section">
        <h3 class="section-title">Detalles</h3>
        <div class="details-grid">
          <!-- Due Date -->
          <div class="detail-item">
            <div class="detail-label">
              <i class="pi pi-calendar"></i>
              <span>Fecha de Vencimiento</span>
            </div>
            <div class="detail-value" :class="{ 'overdue': task.isOverdue(), 'due-soon': task.isDueSoon() }">
              {{ formatDate(task.dueDate) || 'Sin fecha de vencimiento' }}
              <i v-if="task.isOverdue()" class="pi pi-exclamation-triangle warning-icon"></i>
            </div>
          </div>

          <!-- Estimated Hours -->
          <div class="detail-item">
            <div class="detail-label">
              <i class="pi pi-clock"></i>
              <span>Horas Estimadas</span>
            </div>
            <div class="detail-value">
              {{ task.estimatedHours > 0 ? `${task.estimatedHours} hrs` : 'No estimado' }}
            </div>
          </div>

          <!-- Assigned To -->
          <div class="detail-item">
            <div class="detail-label">
              <i class="pi pi-user"></i>
              <span>Asignado a</span>
            </div>
            <div class="detail-value">
              <div v-if="task.assignedTo" class="assigned-user-info">
                <Avatar
                  :label="task.assignedTo.charAt(0)"
                  size="small"
                  shape="circle"
                  class="user-avatar"
                />
                <span>{{ task.assignedTo }}</span>
              </div>
              <span v-else class="unassigned">Sin asignar</span>
            </div>
          </div>

          <!-- Created At -->
          <div class="detail-item">
            <div class="detail-label">
              <i class="pi pi-calendar-plus"></i>
              <span>Creada el</span>
            </div>
            <div class="detail-value">
              {{ formatDateTime(task.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="task.tags && task.tags.length > 0" class="preview-section">
        <h3 class="section-title">Etiquetas</h3>
        <div class="tags-container">
          <span v-for="tag in task.tags" :key="tag" class="task-tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Timeline -->
      <div class="preview-section">
        <h3 class="section-title">Historial</h3>
        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-icon created">
              <i class="pi pi-plus-circle"></i>
            </div>
            <div class="timeline-content">
              <span class="timeline-label">Tarea creada</span>
              <span class="timeline-date">{{ formatDateTime(task.createdAt) }}</span>
            </div>
          </div>

          <div v-if="task.startDate" class="timeline-item">
            <div class="timeline-icon started">
              <i class="pi pi-play-circle"></i>
            </div>
            <div class="timeline-content">
              <span class="timeline-label">Tarea iniciada</span>
              <span class="timeline-date">{{ formatDateTime(task.startDate) }}</span>
            </div>
          </div>

          <div v-if="task.completedDate" class="timeline-item">
            <div class="timeline-icon completed">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="timeline-content">
              <span class="timeline-label">Tarea completada</span>
              <span class="timeline-date">{{ formatDateTime(task.completedDate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="preview-footer">
        <Button
          label="Editar Tarea"
          icon="pi pi-pencil"
          @click="handleEdit"
          outlined
          class="edit-btn"
        />
        <Button
          label="Cerrar"
          icon="pi pi-times"
          @click="$emit('update:visible', false)"
          class="close-btn"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Dialog
