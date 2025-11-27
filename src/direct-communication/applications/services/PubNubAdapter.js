
import PubNub from 'pubnub';

export class PubNubAdapter {
  constructor(config) {
    this.pubnub = new PubNub({
      publishKey: config.publishKey,
      subscribeKey: config.subscribeKey,
      uuid: config.userId,
      restore: true,
      heartbeatInterval: 30,
    });

    this.listeners = [];
  }

  subscribe(channels) {
    this.pubnub.subscribe({
      channels: Array.isArray(channels) ? channels : [channels],
      withPresence: true,
    });
  }

  unsubscribe(channels) {
    this.pubnub.unsubscribe({
      channels: Array.isArray(channels) ? channels : [channels],
    });
  }

  addListener(callbacks) {
    const listener = {
      message: (event) => {
        if (callbacks.onMessage) {
          callbacks.onMessage(event);
        }
      },
      presence: (event) => {
        if (callbacks.onPresence) {
          callbacks.onPresence(event);
        }
      },
      status: (event) => {
        if (callbacks.onStatus) {
          callbacks.onStatus(event);
        }
      },
    };

    this.pubnub.addListener(listener);
    this.listeners.push(listener);

    return listener;
  }

  removeListener(listener) {
    this.pubnub.removeListener(listener);
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  async publish(channel, message) {
    try {
      const result = await this.pubnub.publish({
        channel,
        message,
      });
      return result;
    } catch (error) {
      console.error('PubNub publish error:', error);
      throw error;
    }
  }

  async getHistory(channel, count = 50) {
    try {
      const result = await this.pubnub.history({
        channel,
        count,
        stringifiedTimeToken: true,
      });
      return result.messages || [];
    } catch (error) {
      console.error('PubNub history error:', error);
      throw error;
    }
  }

  async getPresence(channels) {
    try {
      const result = await this.pubnub.hereNow({
        channels: Array.isArray(channels) ? channels : [channels],
        includeUUIDs: true,
        includeState: true,
      });
      return result;
    } catch (error) {
      console.error('PubNub presence error:', error);
      throw error;
    }
  }

  disconnect() {
    this.listeners.forEach(listener => {
      this.pubnub.removeListener(listener);
    });
    this.pubnub.unsubscribeAll();
    this.listeners = [];
  }
}
