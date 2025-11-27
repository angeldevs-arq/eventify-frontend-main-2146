
<template>
  <div class="chat-list">
    <!-- Header de la lista -->
    <header class="chat-list-header">
      <h2>{{ $t('messaging.messages') }}</h2>
      <Button
        icon="pi pi-plus"
        rounded
        text
        @click="$emit('new-chat')"
        :aria-label="$t('messaging.newChat')"
      />
    </header>

    <!-- Búsqueda de conversaciones -->
    <div class="search-container">
      <IconField iconPosition="left">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchQuery"
          :placeholder="$t('messaging.searchConversations')"
          class="search-input"
        />
      </IconField>
    </div>

    <!-- Lista de conversaciones -->
    <div class="conversations-list">
      <template v-if="filteredConversations.length > 0">
        <div
          v-for="conversation in filteredConversations"
          :key="conversation.id"
          class="conversation-item"
          :class="{ active: conversation.id === activeConversationId }"
          @click="handleSelectConversation(conversation)"
        >
          <!-- Avatar del usuario -->
          <div class="conversation-avatar-container">
            <Avatar
              :label="conversation.otherUser.name[0]"
              shape="circle"
              class="conversation-avatar"
            />
            <span
              v-if="conversation.otherUser.isOnline"
              class="online-badge"
              :aria-label="$t('messaging.online')"
            ></span>
          </div>

          <!-- Información de la conversación -->
          <div class="conversation-info">
            <div class="conversation-header">
              <h4 class="conversation-name">
                {{ conversation.otherUser.name }}
              </h4>
              <span class="conversation-time">
                {{ formatTime(conversation.lastMessage.timestamp) }}
              </span>
            </div>
            <div class="conversation-preview">
              <p class="last-message" :class="{ unread: conversation.unreadCount > 0 }">
                {{ truncateMessage(conversation.lastMessage.text) }}
              </p>
              <Badge
                v-if="conversation.unreadCount > 0"
                :value="conversation.unreadCount"
                severity="info"
                class="unread-badge"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Estado vacío -->
      <div v-else class="empty-state">
        <i class="pi pi-comments empty-icon"></i>
        <p class="empty-text">{{ $t('messaging.noConversations') }}</p>
        <Button
          :label="$t('messaging.startConversation')"
          icon="pi pi-plus"
          @click="$emit('new-chat')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

// Props
const props = defineProps({
  conversations: {
    type: Array,
    default: () => [],
  },
  activeConversationId: {
    type: String,
    default: null,
  },
});

// Emits
const emit = defineEmits(['select-conversation', 'new-chat']);

// Composables
const { t } = useI18n();

// Estado local
const searchQuery = ref('');

// Computed
const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.conversations;
  }

  const query = searchQuery.value.toLowerCase();
  return props.conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(query) ||
    conv.lastMessage.text.toLowerCase().includes(query)
  );
});

// Métodos
const handleSelectConversation = (conversation) => {
  emit('select-conversation', conversation);
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (diffInHours < 168) { // 7 días
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    });
  }
};

const truncateMessage = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
</script>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  border-right: 1px solid #e9ecef;
}

/* Header */
.chat-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.chat-list-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
}

/* Búsqueda */
.search-container {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.search-input {
  width: 100%;
}

/* Lista de conversaciones */
.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f8f9fa;
}

.conversation-item:hover {
  background-color: #f8f9fa;
}

.conversation-item.active {
  background-color: #e7f3ff;
  border-left: 3px solid var(--primary-color, #3A506B);
}

/* Avatar */
.conversation-avatar-container {
  position: relative;
  flex-shrink: 0;
}

.conversation-avatar {
  background-color: var(--avatar-bg, #1C2541);
  color: var(--text-primary, #6FFFE9);
}

.online-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background-color: var(--accent-color, #5BC0BE);
  border: 2px solid #ffffff;
  border-radius: 50%;
}

/* Información de la conversación */
.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.conversation-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-time {
  font-size: 0.75rem;
  color: #6c757d;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.conversation-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.last-message {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.last-message.unread {
  font-weight: 600;
  color: #212529;
}

.unread-badge {
  flex-shrink: 0;
}

/* Estado vacío */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: #dee2e6;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1rem;
  color: #6c757d;
  margin-bottom: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .chat-list-header {
    padding: 1rem;
  }

  .search-container {
    padding: 0.75rem 1rem;
  }

  .conversation-item {
    padding: 0.75rem 1rem;
  }
}
</style>
