<template>
  <div class="task-edit-page">
    <div class="task-edit__container">
      <header class="task-edit__header">
        <button @click="handleBack" class="back-button">
          ← Volver
        </button>
        <h1 class="page-title">Editar Tarea</h1>
      </header>

      <div class="loading" v-if="loading">
        <p>Cargando tarea...</p>
      </div>

      <section v-else class="form-section">
        <h2 class="section-title">Información Básica</h2>
        <p>Formulario de edición (en desarrollo)</p>
        <button @click="handleBack" class="btn btn-secondary">
          Volver a la lista
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);

defineProps({
  id: {
    type: String,
    required: true
  }
});

const handleBack = () => {
  router.push({ name: 'tasks' });
};
</script>

<style scoped>
.task-edit-page {
  min-height: 100vh;
  background-color: #F8F9FA;
  padding: 2rem;
}

.task-edit__container {
  max-width: 1000px;
  margin: 0 auto;
}

.task-edit__header {
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
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  background-color: #FFFFFF;
  color: #6C757D;
  border: 1px solid #6C757D;
}

.btn-secondary:hover {
  background-color: #6C757D;
  color: #FFFFFF;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6C757D;
}
</style>
