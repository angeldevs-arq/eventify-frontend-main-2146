// src/task-management/infrastructure/composables/useTask.js

import { computed } from 'vue';
import { useTaskStore } from '@/task-management/application/services/task.store.js';

export const useTask = () => {
  const taskStore = useTaskStore();

  // State reactivo
  const tasks = computed(() => taskStore.tasks);
  const loading = computed(() => taskStore.loading);
  const error = computed(() => taskStore.error);
  const currentEventId = computed(() => taskStore.currentEventId);

  // Tareas agrupadas por estado
  const pendingTasks = computed(() => taskStore.pendingTasks);
  const inProgressTasks = computed(() => taskStore.inProgressTasks);
  const completedTasks = computed(() => taskStore.completedTasks);
  const tasksByStatus = computed(() => taskStore.tasksByStatus);

  // Estadísticas
  const totalTasks = computed(() => taskStore.totalTasks);
  const completionPercentage = computed(() => taskStore.completionPercentage);
  const progressStats = computed(() => taskStore.progressStats);

  // Acciones
  const loadTasksByEvent = async (eventId) => {
    return await taskStore.loadTasksByEvent(eventId);
  };

  const createTask = async (eventId, taskData) => {
    return await taskStore.createTask(eventId, taskData);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    return await taskStore.updateTaskStatus(taskId, newStatus);
  };

  const deleteTask = async (taskId) => {
    return await taskStore.deleteTask(taskId);
  };

  const updateTask = async (taskId, eventId, taskData) => {
    return await taskStore.updateTask(taskId, eventId, taskData);
  };

  const getEventProgress = async (eventId) => {
    return await taskStore.getEventProgress(eventId);
  };

  const clearTasks = () => {
    taskStore.clearTasks();
  };

  const clearError = () => {
    taskStore.clearError();
  };

  // Helpers
  const getTaskById = (taskId) => {
    return tasks.value.find(t => t.id === taskId);
  };

  const hasOverdueTasks = computed(() => {
    return tasks.value.some(task => 
      !task.isCompleted() && task.isOverdue()
    );
  });

  return {
    // State
    tasks,
    loading,
    error,
    currentEventId,

    // Grouped tasks
    pendingTasks,
    inProgressTasks,
    completedTasks,
    tasksByStatus,

    // Stats
    totalTasks,
    completionPercentage,
    progressStats,

    // Actions
    loadTasksByEvent,
    createTask,
    updateTaskStatus,
    deleteTask,
    updateTask,
    getEventProgress,
    clearTasks,
    clearError,

    // Helpers
    getTaskById,
    hasOverdueTasks
  };
};
