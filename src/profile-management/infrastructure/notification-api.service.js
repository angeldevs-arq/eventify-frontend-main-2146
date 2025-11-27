import apiClient from '@/shared/infrastructure/http/axios.config.js';

export class NotificationApiService {
  static ENDPOINT = '/notifications';

  static async getAllForUser(userId) {
    const { data } = await apiClient.get(this.ENDPOINT, {
      params: { userId }
    });
    return data;
  }

  static async create(notification) {
    const { data } = await apiClient.post(this.ENDPOINT, notification);
    return data;
  }

  static async markAsRead(id) {
    const { data } = await apiClient.patch(`${this.ENDPOINT}/${id}`, {
      read: true
    });
    return data;
  }

  static async markAllAsRead(userId) {
    const list = await this.getAllForUser(userId);
    await Promise.all(
      list.map(n =>
        apiClient.patch(`${this.ENDPOINT}/${n.id}`, { read: true })
      )
    );
  }

  static async clearAll(userId) {
    const list = await this.getAllForUser(userId);
    await Promise.all(
      list.map(n => apiClient.delete(`${this.ENDPOINT}/${n.id}`))
    );
  }
}
