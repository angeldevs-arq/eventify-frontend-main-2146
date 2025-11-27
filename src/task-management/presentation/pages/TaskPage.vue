<template>
  <main class="task-page">
    <div class="task-page__container">
      <header class="task-page__header">
        <h1 class="page-title">Gestión de Tareas</h1>
        <p class="page-subtitle">Organiza y gestiona todas las tareas de tus eventos</p>
      </header>

      <tasks-list />
    </div>
  </main>
</template>

<script setup>
import TasksList from '../components/tasks-list.vue';
</script>

<style scoped>
.task-page {
  min-height: 100vh;
  background-color: #F8F9FA;
}

.task-page__container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #3A506B;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #6C757D;
  margin: 0 0 2rem 0;
}
</style>
