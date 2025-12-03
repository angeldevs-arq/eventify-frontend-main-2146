<script setup>
import { computed } from 'vue';
import Tag from 'primevue/tag';

const props = defineProps({
  state: {
    type: String,
    required: true,
    validator: (value) => ['PENDING', 'CONFIRMED', 'REJECTED'].includes(value)
  }
});

const badgeConfig = computed(() => {
  const configs = {
    PENDING: {
      severity: 'warning',
      label: 'Pendiente',
      icon: 'pi pi-clock'
    },
    CONFIRMED: {
      severity: 'success',
      label: 'Confirmada',
      icon: 'pi pi-check-circle'
    },
    REJECTED: {
      severity: 'danger',
      label: 'Rechazada',
      icon: 'pi pi-times-circle'
    }
  };

  return configs[props.state] || configs.PENDING;
});
</script>

<template>
  <Tag
    :severity="badgeConfig.severity"
    :value="badgeConfig.label"
    :icon="badgeConfig.icon"
    class="quote-state-badge"
  />
</template>

<style scoped>
.quote-state-badge {
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.quote-state-badge :deep(.p-tag-icon) {
  font-size: 0.875rem;
}
</style>
