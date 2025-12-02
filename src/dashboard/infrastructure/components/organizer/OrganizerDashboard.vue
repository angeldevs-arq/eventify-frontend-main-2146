<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import { useToast } from 'primevue/usetoast';

import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';
import { AuthApiService } from '@/auth-management/application/auth-api.service.js';
import { QuoteApiService } from '@/quote-management/application/services/quote-api.service.js';
import { QuoteOrder } from '@/quote-management/domain/model';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const { user, restoreSession, isOrganizer } = useAuth();

const selectedDate = ref(new Date());
const isLoading = ref(false);
const organizerDashboard = ref({
  activeEvents: 0,
  eventsThisWeek: 0,
  pendingTasks: 0,
  tasksToday: 0,
  quotes: 0,
  newQuotesWeek: 0,
});
const organizerMessages = ref([]);
const organizerDataLoaded = ref(false);

const ensureSession = async () => {
  if (!user.value) {
    await restoreSession();
  }
};

const loadOrganizerDashboard = async () => {
  isLoading.value = true;
  organizerDataLoaded.value = false;
  try {
    await ensureSession();

    const [quotesResponse, apiUser] = await Promise.all([
      QuoteApiService.getAll(),
      user.value?.id ? AuthApiService.fetchUsers({ id: user.value.id }) : [],
    ]);

    const userId = user.value?.id ? String(user.value.id) : null;
    const organizerQuotes = Array.isArray(quotesResponse)
      ? quotesResponse
          .map((data) => QuoteOrder.fromJSON(data))
          .filter((quoteOrder) => {
            const organizerId = quoteOrder.organizer?.id
              ? String(quoteOrder.organizer.id)
              : null;
            const ownerId = quoteOrder.ownerId ? String(quoteOrder.ownerId) : null;
            return organizerId === userId || ownerId === userId;
          })
      : [];

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const metrics = organizerQuotes.reduce(
      (acc, quoteOrder) => {
        if (quoteOrder.state === QuoteOrder.STATES.APPROVED) {
          acc.approvedQuotes += 1;
        } else if (quoteOrder.state === QuoteOrder.STATES.PENDING) {
          acc.pendingQuotes += 1;
        }

        if (quoteOrder.event?.date) {
          const eventDate = new Date(quoteOrder.event.date);
          if (eventDate >= startOfWeek && eventDate <= endOfWeek) {
            acc.eventsThisWeek += 1;
          }
        }
        return acc;
      },
      { approvedQuotes: 0, pendingQuotes: 0, eventsThisWeek: 0 },
    );

    const [organizerRecord] = Array.isArray(apiUser) ? apiUser : [];
    const dashboardData = organizerRecord?.dashboard || {};

    organizerDashboard.value = {
      activeEvents: dashboardData.activeEvents ?? metrics.approvedQuotes,
      eventsThisWeek: dashboardData.eventsThisWeek ?? metrics.eventsThisWeek,
      pendingTasks: dashboardData.pendingTasks ?? 0,
      tasksToday: dashboardData.tasksToday ?? 0,
      quotes: organizerQuotes.length,
      newQuotesWeek: dashboardData.newQuotesWeek ?? metrics.pendingQuotes,
    };

    organizerMessages.value = dashboardData.recentMessages || [];
    organizerDataLoaded.value = true;
  } catch (error) {
    console.error('Error loading organizer dashboard:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('dashboard.messages.loadError'),
      life: 5000,
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadOrganizerDashboard();
});

watch(isOrganizer, (value) => {
  if (value) {
    loadOrganizerDashboard();
  }
});

const goToQuotes = () => {
  router.push({ name: 'quotes' });
};
</script>

<template>
  <main class="organizer-dashboard">
    <div v-if="isLoading" class="dashboard-loading">
      <Skeleton height="220px" class="mb-3" borderRadius="16px" />
      <Skeleton height="380px" borderRadius="16px" />
    </div>

    <template v-else>
      <section v-if="organizerDataLoaded" class="metrics-section">
        <Card class="metric-card">
          <template #content>
            <div class="metric-content">
              <h2 class="section-title">
                {{ t('dashboard.metrics.activeEvents.title') }}
              </h2>
              <p class="metric-value metric-value--purple">
                {{ organizerDashboard.activeEvents }}
              </p>
              <p class="metric-subtitle">
                {{
                  t('dashboard.metrics.activeEvents.subtitle', {
                    count: organizerDashboard.eventsThisWeek,
                  })
                }}
              </p>
              <Button text class="metric-link" @click="router.push('/events')">
                {{ t('dashboard.seeAll') }}
              </Button>
            </div>
          </template>
        </Card>

        <Card class="metric-card">
          <template #content>
            <div class="metric-content">
              <h2 class="section-title">
                {{ t('dashboard.metrics.pendingTasks.title') }}
              </h2>
              <p class="metric-value metric-value--orange">
                {{ organizerDashboard.pendingTasks }}
              </p>
              <p class="metric-subtitle">
                {{
                  t('dashboard.metrics.pendingTasks.subtitle', {
                    count: organizerDashboard.tasksToday,
                  })
                }}
              </p>
              <Button text class="metric-link" @click="router.push('/tasks')">
                {{ t('dashboard.viewAll') }}
              </Button>
            </div>
          </template>
        </Card>

        <Card class="metric-card">
          <template #content>
            <div class="metric-content">
              <h2 class="section-title">
                {{ t('dashboard.metrics.quotes.title') }}
              </h2>
              <p class="metric-value metric-value--green">
                {{ organizerDashboard.quotes }}
              </p>
              <p class="metric-subtitle">
                {{
                  t('dashboard.metrics.quotes.subtitle', {
                    count: organizerDashboard.newQuotesWeek,
                  })
                }}
              </p>
              <Button text class="metric-link" @click="goToQuotes">
                {{ t('dashboard.seeAll') }}
              </Button>
            </div>
          </template>
        </Card>
      </section>

      <section v-else class="dashboard-loading">
        <Skeleton height="220px" class="mb-3" borderRadius="16px" />
      </section>

      <section class="content-grid">
        <div class="calendar-container">
          <Card class="calendar-card">
            <template #content>
              <Calendar
                v-model="selectedDate"
                inline
                :showWeek="true"
                class="dashboard-calendar"
              />
            </template>
          </Card>
        </div>

        <aside class="messages-container">
          <h2 class="section-title">{{ "Recents Notifications" }}</h2>


        </aside>
      </section>
    </template>
  </main>
</template>

<style scoped>
.organizer-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.dashboard-loading {
  display: grid;
  gap: 1.5rem;
}

.mb-3 {
  margin-bottom: 1.5rem;
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(28, 37, 65, 0.08);
  border: none;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1c2541;
  margin: 0;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
}

.metric-value--purple {
  color: #6b21a8;
}

.metric-value--orange {
  color: #f97316;
}

.metric-value--green {
  color: #15803d;
}

.metric-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.metric-link {
  align-self: flex-start;
  color: #3a506b;
  font-weight: 600;
  padding: 0;
}

.metric-link:hover {
  color: #5bc0be;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1.5rem;
}

.calendar-card,
.messages-container {
  border-radius: 16px;
  box-shadow: 0 16px 32px rgba(28, 37, 65, 0.08);
  border: none;
  background: #ffffff;
}

.dashboard-calendar {
  width: 100%;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.message-card {
  border: none;
  box-shadow: none;
  background-color: #f9fafb;
}

.message-card--empty {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message-sender {
  font-weight: 600;
  color: #1c2541;
  margin: 0;
}

.message-preview {
  color: #4b5563;
  font-size: 0.95rem;
  margin: 0;
}

.message-time {
  color: #9ca3af;
  font-size: 0.85rem;
}

.messages-link {
  align-self: flex-start;
  color: #3a506b;
  font-weight: 600;
  padding: 0;
}

.messages-link:hover {
  color: #5bc0be;
}

@media (max-width: 992px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .organizer-dashboard {
    gap: 2rem;
  }

  .metrics-section {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
</style>
