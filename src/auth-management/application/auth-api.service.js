/**
 * Auth API Service
 * Capa de Aplicación - Servicios de autenticación contra la fake API desplegada
 */

import apiClient from '/src/shared/infrastructure/http/axios.config.js';

const RESOURCE = '/users';
const DEFAULT_STATUS = 'active';

export class AuthApiService {
  /**
   * Obtiene los usuarios de la fake API aplicando parámetros opcionales.
   * Siempre devuelve un arreglo para simplificar su consumo.
   */
  static async fetchUsers(params = {}) {
    const response = await apiClient.get(RESOURCE, { params });
    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    if (data?.users && Array.isArray(data.users)) {
      return data.users;
    }

    return [];
  }

  /**
   * Registra un nuevo usuario persistiendo los datos en la fake API.
   */
  static async register(userData) {
    try {
      const email = userData.email?.trim().toLowerCase();
      if (!email) {
        throw new Error('El email es obligatorio');
      }

      const existingUsers = await this.fetchUsers({ email });
      if (existingUsers.length > 0) {
        throw new Error('El email ya está registrado');
      }

      const timestamp = new Date().toISOString();
      const payload = {
        name: userData.name?.trim() || '',
        email,
        password: userData.password, // En producción la contraseña debe ir cifrada.
        role: userData.role || 'host',
        profileImage: userData.profileImage || '',
        status: DEFAULT_STATUS,
        emailVerified: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const response = await apiClient.post(RESOURCE, payload);
      const savedUser = this.sanitizeUser(response.data || payload);
      const token = this.generateToken(savedUser);

      return {
        user: savedUser,
        token,
        message: 'Usuario registrado exitosamente',
      };
    } catch (error) {
      throw this.handleError(error, 'Error al registrar usuario');
    }
  }

  /**
   * Inicia sesión validando email y contraseña contra la fake API.
   */
  static async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Credenciales incompletas');
      }

      const normalizedEmail = email.trim().toLowerCase();
      const users = await this.fetchUsers({ email: normalizedEmail });
      const user = users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);

      if (!user || user.password !== password) {
        throw new Error('Email o contraseña incorrectos');
      }

      if ((user.status || DEFAULT_STATUS) !== DEFAULT_STATUS) {
        throw new Error('La cuenta está desactivada');
      }

      const safeUser = this.sanitizeUser(user);
      const token = this.generateToken(safeUser);

      return {
        user: safeUser,
        token,
        message: 'Sesión iniciada exitosamente',
      };
    } catch (error) {
      throw this.handleError(error, 'Error al iniciar sesión');
    }
  }

  /**
   * Valida el token actual verificando su expiración.
   */
  static async validateToken(token) {
    try {
      if (!token) {
        throw new Error('Token no proporcionado');
      }

      const decoded = this.decodeToken(token);
      if (!decoded) {
        throw new Error('Token inválido');
      }

      return decoded;
    } catch (error) {
      throw this.handleError(error, 'Error al validar token');
    }
  }

  /**
   * Simula el cierre de sesión en el cliente.
   */
  static async logout() {
    return { message: 'Sesión cerrada exitosamente' };
  }

  static sanitizeUser(user) {
    if (!user) return null;

    const safeUser = { ...user };
    delete safeUser.password;

    return {
      ...safeUser,
      email: safeUser.email?.toLowerCase() || '',
      role: safeUser.role || 'host',
      status: safeUser.status || DEFAULT_STATUS,
      emailVerified: Boolean(safeUser.emailVerified),
    };
  }

  static generateToken(user) {
    const header = this.base64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = this.base64Encode(JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    }));
    const signature = this.base64Encode('fake-signature');

    return `${header}.${payload}.${signature}`;
  }

  static decodeToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(this.base64Decode(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  static base64Encode(value) {
    if (typeof btoa === 'function') {
      return btoa(value);
    }

    if (typeof globalThis !== 'undefined' && typeof globalThis.Buffer !== 'undefined') {
      return globalThis.Buffer.from(value, 'utf-8').toString('base64');
    }

    throw new Error('Base64 encode not supported in this environment');
  }

  static base64Decode(value) {
    if (typeof atob === 'function') {
      return atob(value);
    }

    if (typeof globalThis !== 'undefined' && typeof globalThis.Buffer !== 'undefined') {
      return globalThis.Buffer.from(value, 'base64').toString('utf-8');
    }

    throw new Error('Base64 decode not supported in this environment');
  }

  static handleError(error, defaultMessage = 'Error en la autenticación') {
    if (error.response) {
      return new Error(`${error.response.status}: ${error.response.data?.message || error.message}`);
    }

    if (error?.message) {
      return error;
    }

    return new Error(defaultMessage);
  }
}
