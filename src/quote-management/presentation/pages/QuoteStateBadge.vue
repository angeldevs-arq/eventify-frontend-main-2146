
<template>
  <Badge
    :value="$t(`quotes.states.${state.toLowerCase()}`)"
    :severity="getBadgeSeverity()"
    class="quote-state-badge"
  />
</template>

<script setup>
import { computed } from 'vue';
import Badge from 'primevue/badge';

const props = defineProps({
  state: {
    type: String,
    required: true,
    validator: (value) => ['DRAFT', 'PENDING', 'APPROVED', 'DECLINED'].includes(value)
  }
});

const getBadgeSeverity = () => {
  const severityMap = {
    'DRAFT': 'info',
    'PENDING': 'warning',
    'APPROVED': 'success',
    'DECLINED': 'danger'
  };

  return severityMap[props.state] || 'info';
};
</script>

<style scoped>
.quote-state-badge {
  font-weight: 600;
  text-transform: capitalize;
}
</style>
