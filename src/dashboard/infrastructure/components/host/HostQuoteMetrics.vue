<script setup>
import Card from 'primevue/card';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({ total: 0, approved: 0, pending: 0, declined: 0 }),
  },
});

const emit = defineEmits(['view-quotes']);

const { t } = useI18n();
</script>

<template>
  <section class="host-metrics">
    <Card class="metric-card">
      <template #content>
        <div class="metric-content">
          <h3 class="metric-title">{{ t('dashboard.host.metrics.totalQuotes') }}</h3>
          <p class="metric-value metric-value--primary">{{ props.stats.total }}</p>
          <p class="metric-subtitle">{{ t('dashboard.host.metrics.totalQuotesSubtitle') }}</p>
          <Button text class="metric-link" @click="emit('view-quotes')">
            {{ t('dashboard.host.actions.viewQuotes') }}
          </Button>
        </div>
      </template>
    </Card>

    <Card class="metric-card">
      <template #content>
        <div class="metric-content">
          <h3 class="metric-title">{{ t('dashboard.host.metrics.pendingQuotes') }}</h3>
          <p class="metric-value metric-value--warning">{{ props.stats.pending }}</p>
          <p class="metric-subtitle">{{ t('dashboard.host.metrics.pendingQuotesSubtitle') }}</p>
        </div>
      </template>
    </Card>

    <Card class="metric-card">
      <template #content>
        <div class="metric-content">
          <h3 class="metric-title">{{ t('dashboard.host.metrics.approvedQuotes') }}</h3>
          <p class="metric-value metric-value--success">{{ props.stats.approved }}</p>
          <p class="metric-subtitle">{{ t('dashboard.host.metrics.approvedQuotesSubtitle') }}</p>
        </div>
      </template>
    </Card>

    <Card class="metric-card">
      <template #content>
        <div class="metric-content">
          <h3 class="metric-title">{{ t('dashboard.host.metrics.declinedQuotes') }}</h3>
          <p class="metric-value metric-value--danger">{{ props.stats.declined }}</p>
          <p class="metric-subtitle">{{ t('dashboard.host.metrics.declinedQuotesSubtitle') }}</p>
        </div>
      </template>
    </Card>
  </section>
</template>

<style scoped>
.host-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(28, 37, 65, 0.08);
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric-title {
  font-size: 1rem;
  color: #4b5563;
  margin: 0;
  font-weight: 600;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}

.metric-value--primary {
  color: #4f46e5;
}

.metric-value--warning {
  color: #f59e0b;
}

.metric-value--success {
  color: #22c55e;
}

.metric-value--danger {
  color: #ef4444;
}

.metric-subtitle {
  margin: 0;
  color: #6b7280;
}

.metric-link {
  align-self: flex-start;
  padding: 0;
  color: #4f46e5;
  font-weight: 600;
}

.metric-link:hover {
  color: #4338ca;
}
</style>
