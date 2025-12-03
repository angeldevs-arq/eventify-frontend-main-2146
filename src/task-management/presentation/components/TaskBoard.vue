<template>
  <div class="task-board">
    <!-- Header con botón Nueva Tarea -->
    <div class="board-header flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold m-0">{{ $t('tasks.board.title') }}</h2>
      <Button
        :label="$t('tasks.actions.newTask')"
        icon="pi pi-plus"
        @click="showCreateDialog = true"
        severity="success"
      />
    </div>

    <!-- Estadísticas rápidas -->
    <div class="grid mb-4">
      <div class="col-12 md:col-4">
        <Card class="stats-card">
          <template #content>
            <div class="flex align-items-center">
              <i class="pi pi-list text-4xl text-blue-500 mr-3"></i>
              <div>
                <div class="text-500 text-sm">{{ $t('tasks.stats.total') }}</div>
                <div class="text-2xl font-bold">{{ progressStats.total }}</div>
              </div>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-4">
        <Card class="stats-card">
          <template #content>
            <div class="flex align-items-center">
              <i class="pi pi-clock text-4xl text-orange-500 mr-3"></i>
              <div>
                <div class="text-500 text-sm">{{ $t('tasks.stats.inProgress') }}</div>
                <div class="text-2xl font-bold">{{ progressStats.inProgress }}</div>
              </div>
            </div>
          </template>
        </Card>
      </div>
      <div class="col-12 md:col-4">
        <Card class="stats-card">
          <template #content>
            <div class="flex align-items-center">
              <i class="pi pi-check-circle text-4xl text-green-500 mr-3"></i>
              <div>
                <div class="text-500 text-sm">{{ $t('tasks.stats.completed') }}</div>
                <div class="text-2xl font-bold">{{ progressStats.completed }}</div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Board de 3 columnas -->
    <div class="grid">
      <!-- Columna: Por Hacer (PENDING) -->
      <div class="col-12 md:col-4">
        <Card class="kanban-column pending-column">
          <template #header>
            <div class="column-header pending-header p-3">
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-circle-fill text-blue-500"></i>
                  <span class="font-bold">{{ $t('tasks.status.pending') }}</span>
                </div>
                <span class="badge">{{ pendingTasks.length }}</span>
              </div>
            </div>
          </template>
          <template #content>
            <draggable
              v-model="pendingTasks"
              group="tasks"
              @end="onDragEnd"
              item-key="id"
              class="draggable-list"
              :disabled="!canManageTasks"
            >
              <template #item="{ element }">
                <TaskCard
                  :task="element"
                  @delete="confirmDelete"
                  @edit="editTask"
                  class="mb-3"
                />
              </template>
            </draggable>
            <div v-if="pendingTasks.length === 0" class="empty-column">
              <i class="pi pi-inbox text-4xl text-400"></i>
              <p class="text-500 mt-2">{{ $t('tasks.board.noTasks') }}</p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Columna: En Proceso (IN_PROGRESS) -->
      <div class="col-12 md:col-4">
        <Card class="kanban-column progress-column">
          <template #header>
            <div class="column-header progress-header p-3">
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-circle-fill text-orange-500"></i>
                  <span class="font-bold">{{ $t('tasks.status.inProgress') }}</span>
                </div>
                <span class="badge">{{ inProgressTasks.length }}</span>
              </div>
            </div>
          </template>
          <template #content>
            <draggable
              v-model="inProgressTasks"
              group="tasks"
              @end="onDragEnd"
              item-key="id"
              class="draggable-list"
              :disabled="!canManageTasks"
            >
              <template #item="{ element }">
                <TaskCard
                  :task="element"
                  @delete="confirmDelete"
                  @edit="editTask"
                  class="mb-3"
                />
              </template>
            </draggable>
            <div v-if="inProgressTasks.length === 0" class="empty-column">
              <i class="pi pi-inbox text-4xl text-400"></i>
              <p class="text-500 mt-2">{{ $t('tasks.board.noTasks') }}</p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Columna: Completado (COMPLETED) -->
      <div class="col-12 md:col-4">
        <Card class="kanban-column completed-column">
          <template #header>
            <div class="column-header completed-header p-3">
              <div class="flex justify-content-between align-items-center">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-circle-fill text-green-500"></i>
                  <span class="font-bold">{{ $t('tasks.status.completed') }}</span>
                </div>
                <span class="badge">{{ completedTasks.length }}</span>
              </div>
            </div>
          </template>
          <template #content>
            <draggable
              v-model="completedTasks"
              group="tasks"
              @end="onDragEnd"
              item-key="id"
              class="draggable-list"
              :disabled="!canManageTasks"
            >
              <template #item="{ element }">
                <TaskCard
                  :task="element"
                  @delete="confirmDelete"
                  @edit="editTask"
                  class="mb-3"
                />
              </template>
            </draggable>
            <div v-if="completedTasks.length === 0" class="empty-column">
              <i class="pi pi-inbox text-4xl text-400"></i>
              <p class="text-500 mt-2">{{ $t('tasks.board.noTasks') }}</p>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Dialog: Crear/Editar Tarea -->
    <TaskFormDialog
      v-model:visible="showCreateDialog"
      :event-id="eventId"
      :task="selectedTask"
      @task-saved="handleTaskSaved"
    />

    <!-- Dialog: Confirmar Eliminación -->
    <Dialog
      v-model:visible="showDeleteDialog"
      :header="$t('tasks.actions.confirmDelete')"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex align-items-center gap-3">
        <i class="pi pi-exclamation-triangle text-4xl text-orange-500"></i>
        <span>{{ $t('tasks.messages.deleteConfirm') }}</span>
      </div>
      <template #footer>
        <Button
          :label="$t('common.cancel')"
          icon="pi pi-times"
          @click="showDeleteDialog = false"
          text
        />
        <Button
          :label="$t('common.delete')"
          icon="pi pi-trash"
          @click="handleDelete"
          severity="danger"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTaskStore } from '../../application/services/task.store.js';
import { useAuthStore } from '@/auth-management/application/services/auth.store.js';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import draggable from 'vuedraggable';
import TaskCard from './TaskCard.vue';
import TaskFormDialog from './TaskFormDialog.vue';




const props = defineProps({
  eventId: {
    type: String,
    required: true
  }
});

const taskStore = useTaskStore();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const { progressStats } = storeToRefs(taskStore);

const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedTask = ref(null);
const taskToDelete = ref(null);
const activeEvents = ref([]);
const eventDateRange = ref(null);
// Computed para las listas de tareas (necesario para vuedraggable)
const pendingTasks = computed({
  get: () => taskStore.pendingTasks,
  set: (value) => {
    // La actualización se maneja en onDragEnd
  }
});

const inProgressTasks = computed({
  get: () => taskStore.inProgressTasks,
  set: (value) => {
    // La actualización se maneja en onDragEnd
  }
});

const completedTasks = computed({
  get: () => taskStore.completedTasks,
  set: (value) => {
    // La actualización se maneja en onDragEnd
  }
});

const canManageTasks = computed(() => authStore.isOrganizer);

onMounted(async () => {
  await loadTasks();
  loadMockEvents();
});
// Función para cargar eventos mock
function loadMockEvents() {
  const stored = localStorage.getItem('mockActiveEvents');
  if (stored) {
    activeEvents.value = JSON.parse(stored);

    if (activeEvents.value.length > 0) {
      const firstEvent = activeEvents.value[0];
      eventDateRange.value = {
        startDate: firstEvent.startDate,
        endDate: firstEvent.endDate
      };
    }
  }
}
async function loadTasks() {
  try {
    await taskStore.loadTasksByEvent(props.eventId);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('tasks.messages.loadError'),
      detail: error.message,
      life: 3000
    });
  }
}

async function onDragEnd(event) {
  if (!canManageTasks.value) return;

  const { item, to } = event;
  const taskId = item.getAttribute('data-id');

  // Determinar el nuevo estado según la columna destino
  let newStatus = 'PENDING';
  if (to.classList.contains('draggable-list')) {
    const columnCard = to.closest('.kanban-column');
    if (columnCard.classList.contains('progress-column')) {
      newStatus = 'IN_PROGRESS';
    } else if (columnCard.classList.contains('completed-column')) {
      newStatus = 'COMPLETED';
    }
  }

  try {
    await taskStore.updateTaskStatus(taskId, newStatus);
    toast.add({
      severity: 'success',
      summary: t('tasks.messages.statusUpdated'),
      life: 2000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('tasks.messages.statusUpdateError'),
      detail: error.message,
      life: 3000
    });
    // Recargar tareas para restaurar el estado anterior
    await loadTasks();
  }
}

function editTask(task) {
  selectedTask.value = task;
  showCreateDialog.value = true;
}

function confirmDelete(task) {
  taskToDelete.value = task;
  showDeleteDialog.value = true;
}

async function handleDelete() {
  try {
    await taskStore.deleteTask(taskToDelete.value.id);
    toast.add({
      severity: 'success',
      summary: t('tasks.messages.deleted'),
      life: 2000
    });
    showDeleteDialog.value = false;
    taskToDelete.value = null;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('tasks.messages.deleteError'),
      detail: error.message,
      life: 3000
    });
  }
}

function handleTaskSaved() {
  showCreateDialog.value = false;
  selectedTask.value = null;
  loadTasks();
  toast.add({
    severity: 'success',
    summary: t('tasks.messages.saved'),
    life: 2000
  });
}
</script>

<style scoped>
.task-board {
  padding: 1rem;
}

.board-header {
  background: var(--surface-card);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stats-card {
  height: 100%;
}

.stats-card :deep(.p-card-body) {
  padding: 1rem;
}

.kanban-column {
  height: calc(100vh - 400px);
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.kanban-column :deep(.p-card-header) {
  padding: 0;
}

.kanban-column :deep(.p-card-content) {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.column-header {
  border-radius: 12px 12px 0 0;
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
}

.pending-header {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.progress-header {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
}

.completed-header {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.badge {
  background: rgba(255, 255, 255, 0.9);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 0.875rem;
}

.draggable-list {
  min-height: 100px;
}

.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

:deep(.sortable-ghost) {
  opacity: 0.4;
}

:deep(.sortable-drag) {
  opacity: 0.8;
}
</style>
