<template>
  <div class="task-progress-view p-4">
    <Card>
      <template #header>
        <div class="card-header p-4">
          <h2 class="text-2xl font-bold m-0">{{ $t('tasks.progress.title') }}</h2>
          <p class="text-600 mt-2">{{ eventName }}</p>
        </div>
      </template>

      <template #content>
        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <ProgressSpinner />
        </div>

        <!-- Error State -->
        <Message v-else-if="error" severity="error" :closable="false">
          {{ error }}
        </Message>

        <!-- Progress Content -->
        <div v-else class="progress-content">
          <!-- Progress Bar -->
          <div class="mb-5">
            <div class="flex justify-content-between align-items-center mb-3">
              <span class="text-xl font-semibold">{{ $t('tasks.progress.overall') }}</span>
              <span class="text-3xl font-bold text-primary">{{ progressStats.percentage }}%</span>
            </div>
            
            <ProgressBar 
              :value="progressStats.percentage" 
              :showValue="false"
              class="custom-progress-bar"
            />
            
            <div class="flex justify-content-between mt-2 text-sm text-600">
              <span>{{ progressStats.completed }} {{ $t('tasks.progress.of') }} {{ progressStats.total }} {{ $t('tasks.progress.completed') }}</span>
            </div>
          </div>

          <!-- Stats Cards -->
          <div class="grid">
            <div class="col-12 md:col-4">
              <Card class="stat-card pending-stat">
                <template #content>
                  <div class="flex flex-column align-items-center text-center">
                    <i class="pi pi-circle-fill text-5xl text-blue-500 mb-3"></i>
                    <span class="text-4xl font-bold mb-2">{{ progressStats.pending }}</span>
                    <span class="text-600">{{ $t('tasks.status.pending') }}</span>
                  </div>
                </template>
              </Card>
            </div>

            <div class="col-12 md:col-4">
              <Card class="stat-card progress-stat">
                <template #content>
                  <div class="flex flex-column align-items-center text-center">
                    <i class="pi pi-clock text-5xl text-orange-500 mb-3"></i>
                    <span class="text-4xl font-bold mb-2">{{ progressStats.inProgress }}</span>
                    <span class="text-600">{{ $t('tasks.status.inProgress') }}</span>
                  </div>
                </template>
              </Card>
            </div>

            <div class="col-12 md:col-4">
              <Card class="stat-card completed-stat">
                <template #content>
                  <div class="flex flex-column align-items-center text-center">
                    <i class="pi pi-check-circle text-5xl text-green-500 mb-3"></i>
                    <span class="text-4xl font-bold mb-2">{{ progressStats.completed }}</span>
                    <span class="text-600">{{ $t('tasks.status.completed') }}</span>
                  </div>
                </template>
              </Card>
            </div>
          </div>

          <!-- Timeline visualization (optional) -->
          <div v-if="progressStats.total > 0" class="mt-5">
            <h3 class="text-xl font-semibold mb-3">{{ $t('tasks.progress.breakdown') }}</h3>
            <div class="progress-breakdown">
              <div 
                class="progress-segment pending-segment" 
                :style="{ width: pendingPercentage + '%' }"
              >
                <span v-if="pendingPercentage > 10" class="segment-label">
                  {{ pendingPercentage }}%
                </span>
              </div>
              <div 
                class="progress-segment progress-segment-in" 
                :style="{ width: inProgressPercentage + '%' }"
              >
                <span v-if="inProgressPercentage > 10" class="segment-label">
                  {{ inProgressPercentage }}%
                </span>
              </div>
              <div 
                class="progress-segment completed-segment" 
                :style="{ width: completedPercentage + '%' }"
              >
                <span v-if="completedPercentage > 10" class="segment-label">
                  {{ completedPercentage }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Refresh Button -->
          <div class="flex justify-content-center mt-5">
            <Button
              :label="$t('common.refresh')"
              icon="pi pi-refresh"
              @click="loadProgress"
              :loading="loading"
              outlined
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '../../application/services/task.store.js';
import { useAuthStore } from '@/auth-management/application/services/auth.store.js';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';

const router = useRouter();
const taskStore = useTaskStore();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const loading = ref(true);
const error = ref(null);
const eventId = ref(null);
const eventName = ref('');
const progressStats = ref({
  total: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
  percentage: 0
});

const pendingPercentage = computed(() => {
  if (progressStats.value.total === 0) return 0;
  return Math.round((progressStats.value.pending / progressStats.value.total) * 100);
});

const inProgressPercentage = computed(() => {
  if (progressStats.value.total === 0) return 0;
  return Math.round((progressStats.value.inProgress / progressStats.value.total) * 100);
});

const completedPercentage = computed(() => {
  if (progressStats.value.total === 0) return 0;
  return Math.round((progressStats.value.completed / progressStats.value.total) * 100);
});

onMounted(async () => {
  await checkAccess();
  await loadProgress();
});

async function checkAccess() {
  if (!authStore.isHost) {
    toast.add({
      severity: 'warn',
      summary: t('tasks.messages.accessDenied'),
      detail: t('tasks.messages.hostOnly'),
      life: 3000
    });
    router.push('/');
  }
}

async function loadProgress() {
  try {
    loading.value = true;
    error.value = null;

    // TODO: Obtener el eventId del host desde el perfil o API
    const storedEventId = localStorage.getItem('hostEventId');
    
    if (!storedEventId) {
      error.value = t('tasks.messages.noEvent');
      return;
    }

    eventId.value = storedEventId;
    
    // Cargar progreso del evento
    const progress = await taskStore.getEventProgress(eventId.value);
    progressStats.value = progress;

    // TODO: Cargar nombre del evento desde API
    eventName.value = 'Mi Evento'; // Placeholder

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
.task-progress-view {
  min-height: calc(100vh - 80px);
  background: var(--surface-ground);
}

.card-header {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.progress-content {
  padding: 1rem;
}

.custom-progress-bar {
  height: 30px;
  border-radius: 15px;
}

.custom-progress-bar :deep(.p-progressbar-value) {
  background: linear-gradient(90deg, var(--primary-400) 0%, var(--primary-600) 100%);
  border-radius: 15px;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card :deep(.p-card-body) {
  padding: 2rem 1rem;
}

.progress-breakdown {
  display: flex;
  height: 60px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.segment-label {
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.pending-segment {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
}

.progress-segment-in {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
}

.completed-segment {
  background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
}
</style>
