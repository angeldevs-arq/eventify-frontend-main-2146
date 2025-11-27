
<template>
  <div class="chat-view">
    <ChatWindow
      :other-user-id="otherUserId"
      :other-user-name="otherUserName"
      :current-user-id="currentUserId"
      :is-online="isOnline"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ChatWindow from '../components/ChatWindow.vue';

const route = useRoute();
const router = useRouter();

// Props desde la URL
const otherUserId = ref(route.params.userId);

// Datos del usuario (deberían venir de una API)
const otherUserName = ref('Usuario');
const isOnline = ref(false);
const currentUserId = ref('user-123');

onMounted(async () => {
  // TODO: Cargar datos del usuario desde API
  // const userData = await fetchUserData(otherUserId.value);
  // otherUserName.value = userData.name;
  // isOnline.value = userData.isOnline;
});
</script>

<style scoped>
.chat-view {
  height: calc(100vh - 80px);
  max-width: 1200px;
  margin: 0 auto;
  background-color: #ffffff;
}

@media (max-width: 768px) {
  .chat-view {
    height: calc(100vh - 60px);
  }
}
</style>
