<template>
  <div class="task-create-page">
    <div class="task-create__container">
      <header class="task-create__header">
        <button @click="handleBack" class="back-button">
          ← Volver
        </button>
        <h1 class="page-title">Crear Nueva Tarea</h1>
      </header>

      <section class="form-section">
        <h2 class="section-title">Información Básica</h2>

        <div class="form-grid">
          <div class="form-field full-width">
            <label for="task-title">Título *</label>
            <input
              id="task-title"
              v-model="task.title"
              placeholder="Ingrese el título de la tarea"
              class="form-input"
            />
          </div>

          <div class="form-field full-width">
            <label for="task-description">Descripción</label>
            <textarea
              id="task-description"
              v-model="task.description"
              placeholder="Describe los detalles de la tarea..."
              rows="4"
              class="form-input"
            ></textarea>
          </div>

          <div class="form-field">
            <label for="task-priority">Prioridad *</label>
            <select
              id="task-priority"
              v-model="task.priority"
              class="form-input"
            >
              <option value="">Seleccione prioridad</option>
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </select>
          </div>

          <div class="form-field">
            <label for="task-status">Estado</label>
            <select
              id="task-status"
              v-model="task.status"
              class="form-input"
            >
              <option value="TODO">Por Hacer</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="DONE">Completada</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>

          <div class="form-field">
            <label for="task-due-date">Fecha de Vencimiento</label>
            <input
              id="task-due-date"
              v-model="task.dueDate"
              type="date"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label for="task-hours">Horas Estimadas</label>
            <input
              id="task-hours"
              v-model.number="task.estimatedHours"
              type="number"
              min="0"
              placeholder="0"
              class="form-input"
            />
          </div>
        </div>

        <div class="form-actions">
          <button
            @click="handleSave"
            :disabled="!canSave"
            class="btn btn-primary"
          >
            Guardar
          </button>
          <button
            @click="handleCancel"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const task = ref({
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: null,
  estimatedHours: 0,
});

const canSave = computed(() => {
  return task.value.title.trim().length > 0 && task.value.priority;
});

const handleSave = async () => {
  if (!canSave.value) return;

  try {
    // Aquí irá la lógica de guardado
    console.log('Guardando tarea:', task.value);
    alert('Tarea creada exitosamente (mock)');
    router.push({ name: 'tasks' });
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar la tarea');
  }
};

const handleCancel = () => {
  router.push({ name: 'tasks' });
};

const handleBack = () => {
  router.push({ name: 'tasks' });
};
</script>

<style scoped>
.task-create-page {
  min-height: 100vh;
  background-color: #F8F9FA;
  padding: 2rem;
}

.task-create__container {
  max-width: 1000px;
  margin: 0 auto;
}

.task-create__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-button {
  background: none;
  border: none;
  color: #6C757D;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
}

.back-button:hover {
  color: #3A506B;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #3A506B;
  margin: 0;
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
  margin-bottom: 2rem;
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

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #DEE2E6;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #5BC0BE;
}

textarea.form-input {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #3A506B;
  color: #6FFFE9;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5BC0BE;
  color: #FFFFFF;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #FFFFFF;
  color: #DC3545;
  border: 1px solid #DC3545;
}

.btn-secondary:hover {
  background-color: #DC3545;
  color: #FFFFFF;
}

@media (max-width: 768px) {
  .task-create-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
