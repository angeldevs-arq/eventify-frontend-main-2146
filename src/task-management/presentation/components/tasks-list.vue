<template>
  <section class="tasks-list">
    <div class="tasks-header">
      <h2>Lista de Tareas</h2>
      <button @click="handleNewTask" class="new-task-btn">
        Nueva Tarea
      </button>
    </div>

    <div class="tasks-content">
      <p v-if="loading">Cargando tareas...</p>
      <p v-else-if="tasks.length === 0">No hay tareas disponibles</p>
      <ul v-else class="task-list">
        <li v-for="task in tasks" :key="task.id" class="task-item">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const tasks = ref([]);
const loading = ref(false);

const handleNewTask = () => {
  router.push({ name: 'task-create' });
};

const loadTasks = async () => {
  loading.value = true;
  try {
    // Simulación temporal
    tasks.value = [
      { id: 1, title: 'Tarea 1', description: 'Descripción de tarea 1' },
      { id: 2, title: 'Tarea 2', description: 'Descripción de tarea 2' },
    ];
  } catch (error) {
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadTasks();
});
</script>

<style scoped>
.tasks-list {
  background: white;
  padding: 2rem;
  border-radius: 8px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.new-task-btn {
  background-color: #3A506B;
  color: #6FFFE9;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.new-task-btn:hover {
  background-color: #5BC0BE;
  color: #FFFFFF;
}

.task-list {
  list-style: none;
  padding: 0;
}

.task-item {
  padding: 1rem;
  border: 1px solid #E9ECEF;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.task-item h3 {
  margin: 0 0 0.5rem 0;
  color: #3A506B;
}

.task-item p {
  margin: 0;
  color: #6C757D;
}
</style>
