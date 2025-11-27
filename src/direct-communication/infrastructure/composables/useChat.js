
import { ref, computed } from 'vue';
import { usePubNub } from './usePubNub.js';

export const useChat = (userId) => {
  const messages = ref([]);
  const conversations = ref([]);
  const activeConversation = ref(null);
  const isTyping = ref(false);
  const typingUsers = ref([]);

  const {
    initialize,
    subscribe,
    unsubscribe,
    addListener,
    publish,
    getHistory
  } = usePubNub(userId);

  // Obtener nombre del canal para conversación 1-1
  const getChannelName = (user1Id, user2Id) => {
    const ids = [user1Id, user2Id].sort();
    return `chat-${ids[0]}-${ids[1]}`;
  };

  // Iniciar conversación
  const startConversation = async (otherUserId) => {
    const channelName = getChannelName(userId, otherUserId);
    activeConversation.value = channelName;

    // Suscribirse al canal
    subscribe(channelName);

    // Cargar historial
    const history = await getHistory(channelName);
    messages.value = history.map(item => ({
      id: item.timetoken,
      text: item.entry.text,
      senderId: item.entry.senderId,
      timestamp: item.timetoken,
    }));

    return channelName;
  };

  // Enviar mensaje
  const sendMessage = async (text) => {
    if (!activeConversation.value || !text.trim()) return;

    const message = {
      text: text.trim(),
      senderId: userId,
      timestamp: new Date().toISOString(),
      type: 'message',
    };

    try {
      await publish(activeConversation.value, message);

      // Agregar mensaje localmente
      messages.value.push({
        id: Date.now(),
        ...message,
      });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  // Enviar indicador de "escribiendo..."
  const sendTypingIndicator = async (isTypingNow) => {
    if (!activeConversation.value) return;

    const indicator = {
      type: 'typing',
      senderId: userId,
      isTyping: isTypingNow,
    };

    await publish(activeConversation.value, indicator);
  };

  // Configurar listeners
  const setupListeners = () => {
    addListener({
      message: (event) => {
        const msg = event.message;

        if (msg.type === 'message') {
          // Nuevo mensaje recibido
          messages.value.push({
            id: event.timetoken,
            text: msg.text,
            senderId: msg.senderId,
            timestamp: msg.timestamp,
          });
        } else if (msg.type === 'typing') {
          // Indicador de escritura
          if (msg.isTyping && msg.senderId !== userId) {
            if (!typingUsers.value.includes(msg.senderId)) {
              typingUsers.value.push(msg.senderId);
            }
          } else {
            typingUsers.value = typingUsers.value.filter(
              id => id !== msg.senderId
            );
          }
        }
      },
      presence: (event) => {
        console.log('Presence event:', event);
        // Manejar eventos de presencia (join, leave, timeout)
      },
      status: (event) => {
        console.log('Status event:', event);
        // Manejar cambios de conexión
      },
    });
  };

  // Computed: mensajes ordenados por timestamp
  const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    );
  });

  // Inicializar
  initialize();
  setupListeners();

  return {
    messages: sortedMessages,
    conversations,
    activeConversation,
    typingUsers,
    startConversation,
    sendMessage,
    sendTypingIndicator,
  };
};
