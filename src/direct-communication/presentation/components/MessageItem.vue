
<template>
  <div class="message-item" :class="{ 'message-own': isOwn }">
    <div class="message-bubble">
      <p class="message-text">{{ message.text }}</p>
      <span class="message-time">
        {{ formatTime(message.timestamp) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  isOwn: {
    type: Boolean,
    default: false,
  },
});

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.message-item {
  display: flex;
  margin-bottom: 0.5rem;
}

.message-item.message-own {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background-color: #e9ecef;
}

.message-own .message-bubble {
  background-color: var(--primary-color, #3A506B);
  color: var(--text-primary, #6FFFE9);
}

.message-text {
  margin: 0 0 0.25rem 0;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
}
</style>
