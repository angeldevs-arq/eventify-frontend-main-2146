
import PubNub from 'pubnub';

export const createPubNubInstance = (userId) => {
  return new PubNub({
    publishKey: import.meta.env.VITE_PUBNUB_PUBLISH_KEY,
    subscribeKey: import.meta.env.VITE_PUBNUB_SUBSCRIBE_KEY,
    uuid: userId, // ID único del usuario actual
    // Configuración adicional
    restore: true, // Reconectar automáticamente
    heartbeatInterval: 30, // Segundos entre heartbeats de presencia
  });
};
