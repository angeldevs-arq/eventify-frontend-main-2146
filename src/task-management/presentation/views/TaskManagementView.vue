<template>
  <div class="task-management-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>

    <!-- Error State -->
    <Message v-else-if="error" severity="error" :closable="false">
      {{ error }}
    </Message>

    <!-- Main Content -->
    <div v-else>
      <TaskBoard :event-id="currentEventId" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/auth-management/application/services/auth.store.js';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import TaskBoard from '../components/TaskBoard.vue';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const loading = ref(true);
const error = ref(null);
const currentEventId = ref(null);

onMounted(async () => {
  await checkAccess();
  await loadCurrentEvent();
});

async function checkAccess() {
  if (!authStore.isOrganizer) {
    toast.add({
      severity: 'warn',
      summary: t('tasks.messages.accessDenied'),
      detail: t('tasks.messages.organizerOnly'),
      life: 3000
    });
    router.push('/');
  }
}

async function loadCurrentEvent() {
  try {
    loading.value = true;
    
    // TODO: Obtener el evento activo del organizador
    // Por ahora usamos un eventId mock o del localStorage
    const storedEventId = localStorage.getItem('currentEventId');
    
    if (!storedEventId) {
      error.value = t('tasks.messages.noActiveEvent');
      return;
    }

    currentEventId.value = storedEventId;
  } catch (err) {
    error.value = err.message;
    toast.add({
      severity: 'error',
      summary: t('tasks.messages.loadError'),
      detail: err.message,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.task-management-view {
  min-height: calc(100vh - 80px);
  background: var(--surface-ground);
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
