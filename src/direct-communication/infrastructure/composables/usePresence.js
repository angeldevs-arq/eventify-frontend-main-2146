
import { ref, onUnmounted } from 'vue';
import { usePubNub } from './usePubNub';

export const usePresence = (userId) => {
  const onlineUsers = ref(new Set());
  const userStates = ref(new Map());

  const { pubnub, addListener, subscribe } = usePubNub(userId);

  const setupPresenceTracking = (channels) => {
    // Suscribirse a los canales con presencia
    subscribe(channels);

    // Agregar listener de presencia
    addListener({
      presence: (event) => {
        const { action, uuid, state } = event;

        switch (action) {
          case 'join':
            onlineUsers.value.add(uuid);
            if (state) {
              userStates.value.set(uuid, state);
            }
            break;

          case 'leave':
          case 'timeout':
            onlineUsers.value.delete(uuid);
            userStates.value.delete(uuid);
            break;

          case 'state-change':
            if (state) {
              userStates.value.set(uuid, state);
            }
            break;
        }
      },
    });

    // Obtener usuarios presentes actualmente
    getInitialPresence(channels);
  };

  const getInitialPresence = async (channels) => {
    if (!pubnub.value) return;

    try {
      const channelArray = Array.isArray(channels) ? channels : [channels];

      for (const channel of channelArray) {
        const result = await pubnub.value.hereNow({
          channels: [channel],
          includeUUIDs: true,
          includeState: true,
        });

        if (result.channels[channel]) {
          const occupants = result.channels[channel].occupants || [];
          occupants.forEach(occupant => {
            onlineUsers.value.add(occupant.uuid);
            if (occupant.state) {
              userStates.value.set(occupant.uuid, occupant.state);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error getting initial presence:', error);
    }
  };

  const setUserState = async (channel, state) => {
    if (!pubnub.value) return;

    try {
      await pubnub.value.setState({
        channels: [channel],
        state,
      });
    } catch (error) {
      console.error('Error setting user state:', error);
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.value.has(userId);
  };

  const getUserState = (userId) => {
    return userStates.value.get(userId);
  };

  onUnmounted(() => {
    onlineUsers.value.clear();
    userStates.value.clear();
  });

  return {
    onlineUsers,
    userStates,
    setupPresenceTracking,
    setUserState,
    isUserOnline,
    getUserState,
  };
};
