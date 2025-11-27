<!-- HostPreferencesChips.vue -->
<!-- src/profile-management/infrastructure/components/host/HostPreferencesChips.vue -->

<template>
  <section class="preferences-section">
    <h2 class="section-title">{{ $t('host-profile.sections.preferences') }}</h2>

    <div class="chips-container">
      <Chip
        v-for="pref in preferences"
        :key="pref.id"
        :label="pref.name"
        :style="{ backgroundColor: pref.color, color: '#fff' }"
        class="preference-chip"
      />
    </div>

    <!-- Empty state -->
    <p v-if="preferences.length === 0" class="empty-message">
      {{ $t('host-profile.empty.preferences') }}
    </p>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import Chip from 'primevue/chip';

defineProps({
  user: {
    type: Object,
    default: null,
  },
});

// Mock data - Reemplazar con datos del usuario
const preferences = ref([
  { id: 1, name: 'Bodas', color: '#FF9A56' },
  { id: 2, name: 'Corporativos', color: '#54A0FF' },
  { id: 3, name: 'Cumpleaños', color: '#48DBFB' },
]);
</script>

<style scoped>
.preferences-section {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #3A506B;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preference-chip {
  cursor: pointer;
  font-weight: 500;
  border-radius: 20px;
}

.preference-chip:hover {
  opacity: 0.8;
}

.empty-message {
  margin: 1rem 0 0 0;
  font-size: 0.9rem;
  color: #999;
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .preferences-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .chips-container {
    gap: 0.4rem;
  }
}
</style>
