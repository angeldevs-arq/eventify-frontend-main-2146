<template>
  <CreateAndEditQuotes :organizer-id="organizerId" />
</template>

<script setup>
import { useRoute } from "vue-router";
import CreateAndEditQuotes from "../components/create-and-edit-quotes.vue";

const route = useRoute();
const organizerId = route.query.organizerId
  ? String(route.query.organizerId)
  : null;
</script>
