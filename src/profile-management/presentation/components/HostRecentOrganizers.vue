<!-- HostRecentOrganizers.vue -->
<!-- src/profile-management/infrastructure/components/host/HostRecentOrganizers.vue -->

<template>
  <section class="recent-organizers">
    <h2 class="section-title">{{ $t('host-profile.sections.recentOrganizers') }}</h2>

    <div v-if="organizers.length > 0" class="organizers-list">
      <div v-for="organizer in organizers" :key="organizer.id" class="organizer-item">
        <div class="organizer-header">
          <Avatar
            :label="organizer.initials"
            size="large"
            :style="{ backgroundColor: organizer.avatarColor, color: '#fff' }"
            shape="circle"
          />
          <h3 class="organizer-name">{{ organizer.name }}</h3>
        </div>

        <Button
          :label="$t('host-profile.actions.addService')"
          @click="handleRequestQuote(organizer)"
          icon="pi pi-plus"
          class="request-button"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <i class="pi pi-users"></i>
      <p>{{ $t('host-profile.empty.organizers') }}</p>
    </div>

    <!-- Modal para nueva cotización -->
    <Dialog
      v-model:visible="showQuoteDialog"
      :header="$t('quotes.createTitle')"
      modal
      :style="{ width: '90vw' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    >
      <CreateQuoteForm
        :organizer-id="selectedOrganizerForQuote?.id"
        :organizer-name="selectedOrganizerForQuote?.name"
        @close="showQuoteDialog = false"
        @success="handleQuoteSuccess"
      />
    </Dialog>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import CreateQuoteForm from '@/quote-management/presentation/components/create-and-edit-quotes.vue';

defineProps({
  organizers: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['quote-created']);

const showQuoteDialog = ref(false);
const selectedOrganizerForQuote = ref(null);

const handleRequestQuote = (organizer) => {
  selectedOrganizerForQuote.value = organizer;
  showQuoteDialog.value = true;
};

const handleQuoteSuccess = () => {
  showQuoteDialog.value = false;
  selectedOrganizerForQuote.value = null;
  emit('quote-created');
};
</script>

<style scoped>
.recent-organizers {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #3A506B;
}

.organizers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.organizer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  transition: background 0.3s;
}

.organizer-item:hover {
  background: #f0f1f3;
}

.organizer-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.organizer-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #3A506B;
}

.request-button {
  background-color: #5BC0BE;
  border: none;
  color: #fff;
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

.request-button:hover {
  background-color: #3A506B;
  color: #5BC0BE;
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
  .recent-organizers {
    padding: 1rem;
  }

  .organizer-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .request-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
