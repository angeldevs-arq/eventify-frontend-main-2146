<template>
  <Card class="task-card" :data-id="task.id">
    <template #content>
      <div class="task-content">
        <!-- Título -->
        <h4 class="task-title mb-2">{{ task.title }}</h4>

        <!-- Descripción -->
        <p v-if="task.description" class="task-description mb-3 text-sm text-600">
          {{ truncatedDescription }}
        </p>

        <!-- Fecha de vencimiento -->
        <div v-if="task.dueDate" class="flex align-items-center gap-2 mb-3">
          <i class="pi pi-calendar text-sm" :class="dueDateClass"></i>
          <span class="text-sm" :class="dueDateClass">
            {{ formatDate(task.dueDate) }}
          </span>
          <span v-if="isOverdue" class="badge-overdue">
            {{ $t('tasks.labels.overdue') }}
          </span>
        </div>

        <!-- Acciones -->
        <div class="flex justify-content-between align-items-center">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              size="small"
              text
              rounded
              @click="$emit('edit', task)"
              v-tooltip.top="$t('common.edit')"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              rounded
              severity="danger"
              @click="$emit('delete', task)"
              v-tooltip.top="$t('common.delete')"
            />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

defineEmits(['edit', 'delete']);

const { t, d } = useI18n();

const truncatedDescription = computed(() => {
  if (!props.task.description) return '';
  return props.task.description.length > 100
    ? props.task.description.substring(0, 100) + '...'
    : props.task.description;
});

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.status === 'COMPLETED') return false;
  return new Date(props.task.dueDate) < new Date();
});

const dueDateClass = computed(() => {
  if (isOverdue.value) return 'text-red-500';
  if (isDueSoon.value) return 'text-orange-500';
  return 'text-600';
});

const isDueSoon = computed(() => {
  if (!props.task.dueDate || props.task.status === 'COMPLETED') return false;
  const now = new Date();
  const due = new Date(props.task.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return d(date, 'short');
}
</script>

<style scoped>
.task-card {
  cursor: move;
  transition: all 0.2s ease;
  border-left: 4px solid var(--primary-color);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-card :deep(.p-card-body) {
  padding: 0;
}

.task-card :deep(.p-card-content) {
  padding: 1rem;
}

.task-content {
  display: flex;
  flex-direction: column;
}

.task-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-color);
  margin: 0;
  line-height: 1.4;
}

.task-description {
  color: var(--text-color-secondary);
  line-height: 1.5;
  margin: 0;
}

.badge-overdue {
  background: #fee;
  color: #d32f2f;
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.text-red-500 {
  color: #d32f2f !important;
}

.text-orange-500 {
  color: #f57c00 !important;
}
</style>
