import { ref, onUnmounted } from 'vue';
import { createPubNubInstance } from '../config/pubnub.config.js';

export const usePubNub = (userId) => {
  const pubnub = ref(null);
  const isConnected = ref(false);
  const listeners = ref([]);

  // Inicializar PubNub
  const initialize = () => {
    if (!pubnub.value) {
      pubnub.value = createPubNubInstance(userId);
      isConnected.value = true;
    }
  };

  // Suscribirse a un canal
  const subscribe = (channels) => {
    if (!pubnub.value) initialize();

    pubnub.value.subscribe({
      channels: Array.isArray(channels) ? channels : [channels],
      withPresence: true, // Habilitar detección de presencia
    });
  };

  // Desuscribirse de un canal
  const unsubscribe = (channels) => {
    if (pubnub.value) {
      pubnub.value.unsubscribe({
        channels: Array.isArray(channels) ? channels : [channels],
      });
    }
  };

  // Agregar listener de mensajes
  const addListener = (listenerConfig) => {
    if (!pubnub.value) initialize();

    pubnub.value.addListener(listenerConfig);
    listeners.value.push(listenerConfig);
  };

  // Publicar mensaje
  const publish = async (channel, message) => {
    if (!pubnub.value) initialize();

    try {
      const result = await pubnub.value.publish({
        channel,
        message,
      });
      return result;
    } catch (error) {
      console.error('Error publishing message:', error);
      throw error;
    }
  };

  // Obtener historial de mensajes
  const getHistory = async (channel, count = 50) => {
    if (!pubnub.value) initialize();

    try {
      const result = await pubnub.value.history({
        channel,
        count,
        stringifiedTimeToken: true,
      });
      return result.messages;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  };

  // Limpiar al desmontar componente
  onUnmounted(() => {
    if (pubnub.value) {
      // Remover todos los listeners
      listeners.value.forEach(listener => {
        pubnub.value.removeListener(listener);
      });

      // Desuscribir de todos los canales
      pubnub.value.unsubscribeAll();

      isConnected.value = false;
    }
  });

  return {
    pubnub,
    isConnected,
    initialize,
    subscribe,
    unsubscribe,
    addListener,
    publish,
    getHistory,
  };
};
