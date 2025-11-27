<template>
  <div class="task-card" :class="{ 'overdue': task.isOverdue(), 'high-priority': task.isHighPriority() }">
    <!-- Card Header -->
    <div class="task-card__header">
      <div class="header-left">
        <TaskStateBadge :status="task.status" />
        <div class="priority-indicator" :style="{ backgroundColor: getPriorityColor() }">
          <i :class="`pi ${getPriorityIcon()}`"></i>
        </div>
      </div>
      <div class="header-actions">
        <Button
          icon="pi pi-pencil"
          text
          rounded
          size="small"
          @click="$emit('edit', task.id)"
          class="card-action-btn"
        />
        <Button
          icon="pi pi-ellipsis-v"
          text
          rounded
          size="small"
          @click="toggleMenu"
          class="card-action-btn"
        />
      </div>
    </div>

    <!-- Card Body -->
    <div class="task-card__body" @click="$emit('view', task.id)">
      <h3 class="task-title">{{ task.title }}</h3>
      <p v-if="task.description" class="task-description">
        {{ truncateDescription(task.description, 100) }}
      </p>

      <!-- Tags -->
      <div v-if="task.tags && task.tags.length > 0" class="task-tags">
        <span v-for="tag in task.tags.slice(0, 3)" :key="tag" class="task-tag">
          {{ tag }}
        </span>
        <span v-if="task.tags.length > 3" class="task-tag-more">
          +{{ task.tags.length - 3 }}
        </span>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="task-card__footer">
      <div class="footer-info">
        <div v-if="task.dueDate" class="due-date" :class="{ 'overdue': task.isOverdue(), 'due-soon': task.isDueSoon() }">
          <i class="pi pi-calendar"></i>
          <span>{{ formatDate(task.dueDate) }}</span>
          <i v-if="task.isOverdue()" class="pi pi-exclamation-triangle warning-icon"></i>
        </div>
        
        <div v-if="task.estimatedHours > 0" class="estimated-hours">
          <i class="pi pi-clock"></i>
          <span>{{ task.estimatedHours }}h</span>
        </div>
      </div>

      <div v-if="task.assignedTo" class="assigned-user">
        <Avatar
          :label="task.assignedTo.charAt(0)"
          size="small"
          shape="circle"
          class="user-avatar"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import TaskStateBadge from '../pages/TaskStateBadge.vue';
import { TaskPriority } from '../../domain/model';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['view', 'edit', 'delete']);

const showMenu = ref(false);

// Métodos
const getPriorityColor = () => {
  return TaskPriority.getConfig(props.task.priority).color;
};

const getPriorityIcon = () => {
  return TaskPriority.getConfig(props.task.priority).icon;
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

const truncateDescription = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};
</script>

<style scoped>
.task-card {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  cursor: pointer;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.task-card.high-priority {
  border-left-color: #FFC107;
}

.task-card.overdue {
  border-left-color: #DC3545;
  background-color: #FFF5F5;
}

/* Header */
.task-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.priority-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 0.75rem;
}

.header-actions {
  display: flex;
  gap: 0.25rem;
}

.card-action-btn {
  color: #6C757D;
}

.card-action-btn:hover {
  background-color: rgba(108, 117, 125, 0.1);
}

/* Body */
.task-card__body {
  margin-bottom: 0.75rem;
}

.task-title {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.task-description {
  font-size: 0.875rem;
  color: #6C757D;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.task-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.task-tag {
  background-color: #E9ECEF;
  color: #495057;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.task-tag-more {
  background-color: #6C757D;
  color: #FFFFFF;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Footer */
.task-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #E9ECEF;
}

.footer-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.due-date,
.estimated-hours {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6C757D;
}

.due-date i,
.estimated-hours i {
  font-size: 0.875rem;
}

.due-date.overdue {
  color: #DC3545;
  font-weight: 600;
}

.due-date.due-soon {
  color: #FFC107;
  font-weight: 600;
}

.warning-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.assigned-user {
  display: flex;
  align-items: center;
}

.user-avatar {
  background-color: #3A506B;
  color: #6FFFE9;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 480px) {
  .task-card {
    padding: 0.75rem;
  }

  .task-title {
    font-size: 0.9375rem;
  }

  .footer-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
