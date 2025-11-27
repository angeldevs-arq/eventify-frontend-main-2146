<template>
  <Badge
    :value="getStatusLabel()"
    :severity="getBadgeSeverity()"
    class="task-state-badge"
  />
</template>

<script setup>
import Badge from 'primevue/badge';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(value)
  }
});

const getBadgeSeverity = () => {
  const severityMap = {
    'TODO': 'info',
    'IN_PROGRESS': 'warning',
    'DONE': 'success',
    'CANCELLED': 'danger'
  };

  return severityMap[props.status] || 'info';
};

const getStatusLabel = () => {
  const statusKey = `tasks.status.${props.status.toLowerCase().replace('_', '')}`;
  return t(statusKey);
};
</script>

<style scoped>
.task-state-badge {
  font-weight: 600;
  text-transform: capitalize;
}
</style>
