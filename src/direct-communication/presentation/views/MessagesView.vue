
<template>
  <div class="messages-view">
    <!-- Contenedor principal -->
    <div class="messages-container">
      <!-- Lista de conversaciones (Sidebar) -->
      <aside class="messages-sidebar" :class="{ hidden: selectedConversation && isMobile }">
        <ChatList
          :conversations="conversations"
          :active-conversation-id="selectedConversation?.id"
          @select-conversation="handleSelectConversation"
          @new-chat="handleNewChat"
        />
      </aside>

      <!-- Ventana de chat -->
      <main class="messages-content">
        <template v-if="selectedConversation">
          <!-- Botón de volver en móvil -->
          <div v-if="isMobile" class="mobile-back-button">
            <Button
              icon="pi pi-arrow-left"
              text
              rounded
              @click="handleBackToList"
              :aria-label="$t('messaging.backToList')"
            />
          </div>

          <ChatWindow
            :other-user-id="selectedConversation.otherUser.id"
            :other-user-name="selectedConversation.otherUser.name"
            :current-user-id="currentUser.id"
            :is-online="selectedConversation.otherUser.isOnline"
          />
        </template>

        <!-- Estado inicial sin conversación seleccionada -->
        <div v-else class="no-conversation-selected">
          <i class="pi pi-comments empty-icon"></i>
          <h3>{{ $t('messaging.selectConversation') }}</h3>
          <p>{{ $t('messaging.selectConversationDescription') }}</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import ChatList from '../components/ChatList.vue';
import ChatWindow from '../components/ChatWindow.vue';

// Composables
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

// Estado
const selectedConversation = ref(null);
const isMobile = ref(window.innerWidth < 768);

// Usuario actual (esto debería venir de un store de autenticación)
const currentUser = ref({
  id: 'user-123',
  name: 'Usuario Actual',
});

const conversations = ref([
  {
    id: 'conv-1',
    otherUser: {
      id: 'user-456',
      name: 'María González',
      isOnline: true,
    },
    lastMessage: {
      text: '¡Nos vemos en el evento!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      senderId: 'user-456',
    },
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    otherUser: {
      id: 'user-789',
      name: 'Carlos Pérez',
      isOnline: false,
    },
    lastMessage: {
      text: 'Gracias por la información',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      senderId: 'user-123',
    },
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    otherUser: {
      id: 'user-101',
      name: 'Ana Martínez',
      isOnline: true,
    },
    lastMessage: {
      text: '¿Confirmaste tu asistencia?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      senderId: 'user-101',
    },
    unreadCount: 0,
  },
]);

// Métodos
const handleSelectConversation = (conversation) => {
  selectedConversation.value = conversation;

  // Actualizar URL sin recargar
  router.push({
    name: 'MessagesConversation',
    params: { conversationId: conversation.id },
  });
};

const handleBackToList = () => {
  selectedConversation.value = null;
  router.push({ name: 'Messages' });
};

const handleNewChat = () => {
  // TODO: Implementar modal para seleccionar usuario y crear nueva conversación
  console.log('Crear nueva conversación');
};

const handleResize = () => {
  isMobile.value = window.innerWidth < 768;
};

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', handleResize);

  // Si hay un conversationId en la URL, seleccionar esa conversación
  if (route.params.conversationId) {
    const conversation = conversations.value.find(
      c => c.id === route.params.conversationId
    );
    if (conversation) {
      selectedConversation.value = conversation;
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.messages-view {
  height: calc(100vh - 80px); /* Ajustar según altura del header */
  background-color: #f8f9fa;
}

.messages-container {
  display: flex;
  height: 100%;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Sidebar */
.messages-sidebar {
  width: 380px;
  flex-shrink: 0;
  transition: transform 0.3s;
}

/* Contenido principal */
.messages-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Botón de volver en móvil */
.mobile-back-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 10;
}

/* Estado sin conversación seleccionada */
.no-conversation-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.no-conversation-selected .empty-icon {
  font-size: 5rem;
  color: #dee2e6;
  margin-bottom: 1.5rem;
}

.no-conversation-selected h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #212529;
}

.no-conversation-selected p {
  margin: 0;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .messages-view {
    height: calc(100vh - 60px);
  }

  .messages-container {
    box-shadow: none;
  }

  .messages-sidebar {
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 1;
    background-color: #ffffff;
  }

  .messages-sidebar.hidden {
    transform: translateX(-100%);
  }

  .messages-content {
    width: 100%;
  }

  .mobile-back-button {
    position: static;
    padding: 0.5rem;
    border-bottom: 1px solid #e9ecef;
  }
}
</style>
