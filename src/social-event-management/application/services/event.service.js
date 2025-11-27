// event.service.js

import apiClient from '@/shared/infrastructure/http/axios.config.js'

class EventService {
  async getEvents(params = {}) {
    return await apiClient.get('/events', { params });
  }

  async getEvent(id) {
    return await apiClient.get(`/events/${id}`);
  }

  async getEventsByUser(userId) {
    if (!userId) {
      return await this.getEvents();
    }

    return await this.getEvents({ userId });
  }

  async createEvent(eventData) {
    return await apiClient.post('/events', eventData);
  }

  async updateEvent(id, eventData) {
    return await apiClient.put(`/events/${id}`, eventData);
  }

  async deleteEvent(id) {
    return await apiClient.delete(`/events/${id}`);
  }

  async deleteMultipleEvents(eventIds) {
    const deletePromises = eventIds.map(id =>
      apiClient.delete(`/events/${id}`)
    );
    return await Promise.all(deletePromises);
  }

  async searchEvents(query) {
    return await apiClient.get(`/events?q=${query}`);
  }

  async filterEventsByStatus(status) {
    return await apiClient.get(`/events?status=${status}`);
  }
}

export default new EventService();
