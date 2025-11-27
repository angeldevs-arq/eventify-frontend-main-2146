<script setup>
import { ref, watch, nextTick, onMounted } from 'vue';
import { useChat } from '../../infrastructure/composables/useChat.js';
import { useI18n } from 'vue-i18n';
import Avatar from 'primevue/avatar';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import MessageItem from './MessageItem.vue';
import TypingIndicator from './TypingIndicator.vue';

// Props
const props = defineProps({
  otherUserId: {
    type: String,
    required: true,
  },
  otherUserName: {
    type: String,
    required: true,
  },
  currentUserId: {
    type: String,
    required: true,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
});

// Composables
const { t } = useI18n();
const {
  messages,
  typingUsers,
  startConversation,
  sendMessage,
  sendTypingIndicator,
} = useChat(props.currentUserId);

// Estado local
const messageText = ref('');
const messagesContainer = ref(null);
let typingTimeout = null;

// Iniciar conversación al montar
onMounted(async () => {
  await startConversation(props.otherUserId);
});

// Scroll automático cuando llegan nuevos mensajes
watch(messages, async () => {
  await nextTick();
  scrollToBottom();
});

// Funciones
const handleSendMessage = async () => {
  if (!messageText.value.trim()) return;

  const sent = await sendMessage(messageText.value);

  if (sent) {
    messageText.value = '';
    sendTypingIndicator(false);
  }
};

const handleTyping = () => {
  // Enviar indicador de que está escribiendo
  sendTypingIndicator(true);

  // Cancelar timeout anterior
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  // Después de 3 segundos sin escribir, enviar que dejó de escribir
  typingTimeout = setTimeout(() => {
    sendTypingIndicator(false);
  }, 3000);
};

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};
</script>
<template>
  <div class="chat-window">
    <!-- Header del chat -->
    <header class="chat-header">
      <div class="chat-header-info">
        <Avatar
          :label="otherUserName[0]"
          shape="circle"
          class="chat-avatar"
        />
        <div class="chat-user-info">
          <h3>{{ otherUserName }}</h3>
          <span class="status-indicator" :class="{ online: isOnline }">
            {{ isOnline ? $t('messaging.online') : $t('messaging.offline') }}
          </span>
        </div>
      </div>
    </header>

    <!-- Área de mensajes -->
    <main class="chat-messages" ref="messagesContainer">
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :is-own="message.senderId === currentUserId"
      />

      <!-- Indicador de "escribiendo..." -->
      <TypingIndicator v-if="typingUsers.length > 0" />
    </main>

    <!-- Input de mensaje -->
    <footer class="chat-input-container">
      <InputText
        v-model="messageText"
        :placeholder="$t('messaging.typeMessage')"
        @keyup.enter="handleSendMessage"
        @input="handleTyping"
        class="chat-input"
      />
      <Button
        icon="pi pi-send"
        :label="$t('messaging.send')"
        @click="handleSendMessage"
        :disabled="!messageText.trim()"
        class="send-button"
      />
    </footer>
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
}

/* Header del chat */
.chat-header {
  padding: 1.5rem;
  background-color: var(--primary-color, #3A506B);
  color: var(--text-primary, #6FFFE9);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-avatar {
  background-color: var(--avatar-bg, #1C2541);
  color: var(--text-primary, #6FFFE9);
}

.chat-user-info h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.status-indicator {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.status-indicator.online {
  color: var(--accent-color, #5BC0BE);
}

/* Área de mensajes */
.chat-messages {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #f8f9fa;
}

/* Input de mensaje */
.chat-input-container {
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 0.75rem;
}

.chat-input {
  flex: 1;
}

.send-button {
  background-color: var(--primary-color, #3A506B);
  border-color: var(--primary-color, #3A506B);
}

.send-button:hover:enabled {
  background-color: var(--accent-color, #5BC0BE);
  border-color: var(--accent-color, #5BC0BE);
}

/* Responsive */
@media (max-width: 768px) {
  .chat-header {
    padding: 1rem;
  }

  .chat-messages {
    padding: 1rem;
  }

  .chat-input-container {
    padding: 0.75rem 1rem;
  }

  .send-button :deep(.p-button-label) {
    display: none;
  }
}
</style>
