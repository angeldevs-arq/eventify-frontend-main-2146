<template>
  <CreateAndEditQuotes />
</template>

<script setup>
import CreateAndEditQuotes from '../components/create-and-edit-quotes.vue';

defineProps({
  id: {
    type: String,
    required: true
  }
});
</script>
