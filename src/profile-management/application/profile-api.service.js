import apiClient from '@/shared/infrastructure/http/axios.config.js';

export class ProfileApiService {
  //static ENDPOINT = '/organizers';
  static ENDPOINT = '/api/v1/profiles';
  //static USERS_ENDPOINT = '/users';
  static USERS_ENDPOINT = '/api/v1/profiles';

  // Obtener todos los perfiles
  static async getAll() {
    try {
      const response = await apiClient.get(this.ENDPOINT);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener perfil por ID
  static async getById(id) {
    try {
      const response = await apiClient.get(`${this.ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Obtener perfil del usuario logueado
  static async getProfile(userId) {
    if (!userId) {
      throw new Error('A user id is required to fetch a profile');
    }

    try {
      const response = await apiClient.get(`${this.USERS_ENDPOINT}/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Actualizar perfil por ID
  static async update(id, profileData, role = 'host') {
    const endpoint = role === 'organizer' ? '/organizers' : '/users';

    try {
      const response = await apiClient.put(`${endpoint}/${id}`, profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async updateProfile(id, profileData) {


    try {
      const response = await apiClient.put(`/api/v1/profiles/${id}`, profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Manejo de errores
  static handleError(error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || error.message;
      return new Error(`API Error (${error.response.status}): ${errorMessage}`);
    } else if (error.request) {
      return new Error('No response from server. Please check your connection.');
    } else {
      return new Error(`Request setup error: ${error.message}`);
    }
  }
}
