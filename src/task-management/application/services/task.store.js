// src/task-management/application/services/task.store.js

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { TaskApiService } from '../../infrastructure/services/task-api.service.js';
import { useAuthStore } from '@/auth-management/application/services/auth.store.js';

// MODO MOCK TEMPORAL
const USE_MOCK_DATA = false; // Cambiar a false cuando el backend funcione

export const useTaskStore = defineStore('task', () => {
  const tasks = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const currentEventId = ref(null);

  // Getters
  const pendingTasks = computed(() =>
    tasks.value.filter(task => task.status === 'PENDING')
  );

  const inProgressTasks = computed(() =>
    tasks.value.filter(task => task.status === 'IN_PROGRESS')
  );

  const completedTasks = computed(() =>
    tasks.value.filter(task => task.status === 'COMPLETED')
  );

  const tasksByStatus = computed(() => ({
    PENDING: pendingTasks.value,
    IN_PROGRESS: inProgressTasks.value,
    COMPLETED: completedTasks.value
  }));

  const totalTasks = computed(() => tasks.value.length);

  const completionPercentage = computed(() => {
    if (totalTasks.value === 0) return 0;
    return Math.round((completedTasks.value.length / totalTasks.value) * 100);
  });

  const progressStats = computed(() => ({
    total: totalTasks.value,
    pending: pendingTasks.value.length,
    inProgress: inProgressTasks.value.length,
    completed: completedTasks.value.length,
    percentage: completionPercentage.value
  }));

  // Mock data generator
  function generateMockTasks() {
    return [
      {
        id: '1',
        title: 'Confirmar lugar del evento',
        description: 'Contactar con el venue para confirmar disponibilidad',
        status: 'PENDING',
        dueDate: '2025-12-10',
        eventId: currentEventId.value,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Enviar invitaciones',
        description: 'Diseñar y enviar invitaciones digitales',
        status: 'IN_PROGRESS',
        dueDate: '2025-12-15',
        eventId: currentEventId.value,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Contratar catering',
        description: 'Seleccionar menú y confirmar servicio de catering',
        status: 'COMPLETED',
        dueDate: '2025-12-05',
        eventId: currentEventId.value,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Actions
  async function loadTasksByEvent(eventId) {
    loading.value = true;
    error.value = null;
    currentEventId.value = eventId;

    try {
      if (USE_MOCK_DATA) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 500));
        tasks.value = generateMockTasks();
        return tasks.value;
      }

      const data = await TaskApiService.getTasksByEvent(eventId);
      tasks.value = data;
      return data;
    } catch (err) {
      if (USE_MOCK_DATA) {
        tasks.value = generateMockTasks();
        return tasks.value;
      }
      error.value = err.message;
      console.error('Error loading tasks:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createTask(eventId, taskData) {
    loading.value = true;
    error.value = null;

    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newTask = {
          id: Date.now().toString(),
          ...taskData,
          status: 'PENDING',
          eventId: eventId,
          createdAt: new Date().toISOString()
        };
        tasks.value.push(newTask);
        return newTask;
      }

      const authStore = useAuthStore();
      const newTask = await TaskApiService.createTask(eventId, {
        ...taskData,
        assignedUserId: authStore.user?.id
      });

      tasks.value.push(newTask);
      return newTask;
    } catch (err) {
      error.value = err.message;
      console.error('Error creating task:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateTaskStatus(taskId, newStatus) {
    loading.value = true;
    error.value = null;

    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const index = tasks.value.findIndex(t => t.id === taskId);
        if (index !== -1) {
          tasks.value[index].status = newStatus;
        }
        return tasks.value[index];
      }

      const updatedTask = await TaskApiService.updateTaskStatus(taskId, newStatus);

      const index = tasks.value.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks.value[index] = updatedTask;
      }

      return updatedTask;
    } catch (err) {
      error.value = err.message;
      console.error('Error updating task status:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteTask(taskId) {
    loading.value = true;
    error.value = null;

    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 200));
        tasks.value = tasks.value.filter(t => t.id !== taskId);
        return true;
      }

      await TaskApiService.deleteTask(taskId);
      tasks.value = tasks.value.filter(t => t.id !== taskId);
      return true;
    } catch (err) {
      error.value = err.message;
      console.error('Error deleting task:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateTask(taskId, eventId, taskData) {
    loading.value = true;
    error.value = null;

    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const index = tasks.value.findIndex(t => t.id === taskId);
        if (index !== -1) {
          tasks.value[index] = { ...tasks.value[index], ...taskData };
        }
        return tasks.value[index];
      }

      const updatedTask = await TaskApiService.updateTask(taskId, eventId, taskData);

      const index = tasks.value.findIndex(t => t.id === taskId);
      if (index !== -1) {
        tasks.value[index] = updatedTask;
      }

      return updatedTask;
    } catch (err) {
      error.value = err.message;
      console.error('Error updating task:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getEventProgress(eventId) {
    try {
      if (USE_MOCK_DATA) {
        return {
          total: totalTasks.value,
          completed: completedTasks.value.length,
          inProgress: inProgressTasks.value.length,
          pending: pendingTasks.value.length,
          percentage: completionPercentage.value,
          tasks: tasks.value
        };
      }

      return await TaskApiService.getEventProgress(eventId);
    } catch (err) {
      error.value = err.message;
      console.error('Error getting event progress:', err);
      throw err;
    }
  }

  function clearTasks() {
    tasks.value = [];
    currentEventId.value = null;
    error.value = null;
  }

  function clearError() {
    error.value = null;
  }

  return {
    tasks,
    loading,
    error,
    currentEventId,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    tasksByStatus,
    totalTasks,
    completionPercentage,
    progressStats,
    loadTasksByEvent,
    createTask,
    updateTaskStatus,
    deleteTask,
    updateTask,
    getEventProgress,
    clearTasks,
    clearError
  };
});
