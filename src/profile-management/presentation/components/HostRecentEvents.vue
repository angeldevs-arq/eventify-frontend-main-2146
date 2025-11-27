<!-- HostRecentEvents.vue -->
<!-- src/profile-management/infrastructure/components/host/HostRecentEvents.vue -->

<template>
  <section class="recent-events">
    <div class="section-header">
      <h2 class="section-title">{{ $t('host-profile.sections.recentEvents') }}</h2>
      <RouterLink :to="`/events`" class="view-all-link">
        {{ $t('host-profile.actions.viewAllQuotes') }}
      </RouterLink>
    </div>

    <div v-if="events.length > 0" class="events-list">
      <div v-for="event in events" :key="event.id" class="event-item">
        <div class="event-header">
          <h3 class="event-title">{{ event.title }}</h3>
          <span :class="['event-badge', `badge-${event.status}`]">
            {{ $t(`quote.status.${event.status}`) }}
          </span>
        </div>
        <p class="event-date">
          <i class="pi pi-calendar"></i>
          {{ event.date }}
        </p>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <i class="pi pi-inbox"></i>
      <p>{{ $t('host-profile.empty.events') }}</p>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  events: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped>
.recent-events {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #3A506B;
}

.view-all-link {
  font-size: 0.85rem;
  color: #5BC0BE;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.view-all-link:hover {
  color: #3A506B;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #5BC0BE;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.event-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #3A506B;
}

.event-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-pending {
  background-color: #FFF3CD;
  color: #856404;
}

.badge-approved {
  background-color: #D4EDDA;
  color: #155724;
}

.badge-declined {
  background-color: #F8D7DA;
  color: #721C24;
}

.event-date {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-date i {
  font-size: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #999;
}

.empty-state i {
  display: block;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .recent-events {
    padding: 1rem;
  }

  .event-header {
    flex-direction: column;
  }

  .event-badge {
    align-self: flex-start;
  }
}
</style>
