<template>
  <div class="task-form">
    <div class="task-form__container">
      <div class="task-form__main">
        <header class="task-form__header">
          <h1 class="page-title">
            {{ isEditMode ? 'Editar Tarea' : 'Crear Nueva Tarea' }}
          </h1>
          <Button
            icon="pi pi-arrow-left"
            label="Volver"
            text
            @click="handleBack"
            class="back-button"
          />
        </header>

        <section class="form-section">
          <h2 class="section-title">Información Básica</h2>

          <div class="form-grid">
            <div class="form-field full-width">
              <label for="task-title">Título *</label>
              <InputText
                id="task-title"
                v-model="task.title"
                placeholder="Ingrese el título de la tarea"
                class="w-full"
              />
            </div>

            <div class="form-field full-width">
              <label for="task-description">Descripción</label>
              <Textarea
                id="task-description"
                v-model="task.description"
                placeholder="Describe los detalles de la tarea..."
                rows="4"
                class="w-full"
              />
            </div>

            <div class="form-field">
              <label for="task-priority">Prioridad *</label>
              <Dropdown
                id="task-priority"
                v-model="task.priority"
                :options="priorityOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione prioridad"
                class="w-full"
              />
            </div>

            <div class="form-field">
              <label for="task-status">Estado</label>
              <Dropdown
                id="task-status"
                v-model="task.status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccione estado"
                class="w-full"
              />
            </div>

            <div class="form-field">
              <label for="task-due-date">Fecha de Vencimiento</label>
              <Calendar
                id="task-due-date"
                v-model="task.dueDate"
                placeholder="Seleccione fecha"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                :minDate="new Date()"
                class="w-full"
              />
            </div>

            <div class="form-field">
              <label for="task-hours">Horas Estimadas</label>
              <InputNumber
                id="task-hours"
                v-model="task.estimatedHours"
                :min="0"
                :max="999"
                placeholder="0"
                suffix=" hrs"
                class="w-full"
                showButtons
              />
            </div>

            <div class="form-field full-width">
              <label for="task-tags">Etiquetas</label>
              <Chips
                id="task-tags"
                v-model="task.tags"
                placeholder="Presione Enter para agregar etiquetas"
                separator=","
                class="w-full"
              />
            </div>
          </div>
        </section>
      </div>

      <aside class="task-form__sidebar">
        <div class="task-actions">
          <h3 class="task-actions__title">Acciones</h3>

          <div class="task-actions__buttons">
            <Button
              label="Guardar"
              icon="pi pi-save"
              :disabled="!canSave"
              :loading="isSaving"
              @click="handleSave"
              class="action-button save-button"
            />

            <Button
              label="Cancelar"
              icon="pi pi-times"
              @click="handleCancel"
              class="action-button cancel-button"
              severity="danger"
              outlined
            />
          </div>

          <div v-if="task.status" class="task-actions__state">
            <span class="state-label">Estado Actual:</span>
            <TaskStateBadge :status="task.status" />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Chips from 'primevue/chips';
import Button from 'primevue/button';
import { Task, TaskPriority } from '../../domain/model';
import TaskStateBadge from '../pages/TaskStateBadge.vue';
import { TaskApiService } from '../../application/services/task-api.service.js';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const task = ref(new Task({}));
const isSaving = ref(false);

const isEditMode = computed(() => {
  return route.name === 'task-edit' && route.params.id;
});

const priorityOptions = computed(() => {
  return TaskPriority.getAllPriorities();
});

const statusOptions = computed(() => [
  { label: 'Por Hacer', value: 'TODO' },
  { label: 'En Progreso', value: 'IN_PROGRESS' },
  { label: 'Completada', value: 'DONE' },
  { label: 'Cancelada', value: 'CANCELLED' }
]);

const canSave = computed(() => {
  return task.value.title.trim().length > 0 && task.value.priority && task.value.status;
});

const handleSave = async () => {
  if (!canSave.value) return;

  isSaving.value = true;

  try {
    const taskData = task.value.toJSON();
    taskData.updatedAt = new Date().toISOString();

    if (isEditMode.value) {
      await TaskApiService.update(route.params.id, taskData);
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Tarea actualizada exitosamente',
        life: 3000
      });
    } else {
      await TaskApiService.create(taskData);
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Tarea creada exitosamente',
        life: 3000
      });
    }

    router.push({ name: 'tasks' });
  } catch (error) {
    console.error('Error saving task:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al guardar la tarea',
      life: 5000
    });
  } finally {
    isSaving.value = false;
  }
};

const handleCancel = () => {
  router.push({ name: 'tasks' });
};

const handleBack = () => {
  router.push({ name: 'tasks' });
};

const loadTask = async (taskId) => {
  try {
    const data = await TaskApiService.getById(taskId);
    task.value = Task.fromJSON(data);
  } catch (error) {
    console.error('Error loading task:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al cargar la tarea',
      life: 5000
    });
    router.push({ name: 'tasks' });
  }
};

onMounted(() => {
  if (isEditMode.value) {
    loadTask(route.params.id);
  }
});
</script>

<style scoped>
.task-form {
  min-height: 100vh;
  background-color: #F8F9FA;
  padding: 2rem;
}

.task-form__container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
}

.task-form__main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.task-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #3A506B;
  margin: 0;
}

.back-button {
  color: #6C757D;
}

.back-button:hover {
  color: #3A506B;
}

.form-section {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #3A506B;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #5BC0BE;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9375rem;
}

.w-full {
  width: 100%;
}

.task-form__sidebar {
  position: relative;
}

.task-actions {
  position: sticky;
  top: 2rem;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-actions__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #3A506B;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #E9ECEF;
}

.task-actions__buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-button {
  width: 100%;
  justify-content: center;
  font-weight: 500;
}

.save-button {
  background-color: #3A506B;
  border-color: #3A506B;
  color: #6FFFE9;
}

.save-button:hover:not(:disabled) {
  background-color: #5BC0BE;
  border-color: #5BC0BE;
  color: #FFFFFF;
}

.cancel-button {
  margin-top: 0.5rem;
}

.task-actions__state {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E9ECEF;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.state-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6C757D;
}

@media (max-width: 1024px) {
  .task-form__container {
    grid-template-columns: 1fr;
  }

  .task-form__sidebar {
    order: -1;
  }

  .task-actions {
    position: relative;
    top: 0;
  }
}

@media (max-width: 768px) {
  .task-form {
    padding: 1rem;
  }

  .task-form__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
