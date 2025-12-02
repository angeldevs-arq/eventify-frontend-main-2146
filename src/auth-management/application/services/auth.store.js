// src/auth-management/application/services/auth.store.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/shared/infrastructure/http/axios.config.js'

// Helpers para persistencia
const STORAGE_KEYS = {
  TOKEN: 'authToken',
  USER: 'authUser',
  STORAGE_TYPE: 'authStorageType'
}

const persistSession = (user, token, storageType = 'local') => {
  const storage = storageType === 'local' ? localStorage : sessionStorage
  storage.setItem(STORAGE_KEYS.TOKEN, token)
  storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  storage.setItem(STORAGE_KEYS.STORAGE_TYPE, storageType)
}

const clearPersistedSession = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.STORAGE_TYPE)
  sessionStorage.removeItem(STORAGE_KEYS.TOKEN)
  sessionStorage.removeItem(STORAGE_KEYS.USER)
  sessionStorage.removeItem(STORAGE_KEYS.STORAGE_TYPE)
}

const loadPersistedSession = () => {
  const token =
    localStorage.getItem(STORAGE_KEYS.TOKEN) ||
    sessionStorage.getItem(STORAGE_KEYS.TOKEN)

  const userRaw =
    localStorage.getItem(STORAGE_KEYS.USER) ||
    sessionStorage.getItem(STORAGE_KEYS.USER)

  const storageType =
    localStorage.getItem(STORAGE_KEYS.STORAGE_TYPE) ||
    sessionStorage.getItem(STORAGE_KEYS.STORAGE_TYPE) ||
    'local'

  return {
    token: token || null,
    user: userRaw ? JSON.parse(userRaw) : null,
    storageType
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)
  const storageType = ref('local')

  /* ============================================================
      REGISTER — PARA JSON-SERVER
  ============================================================ */
  const register = async (payload, persistence = 'local') => {
    try {
      // Enviar datos al backend
      const { data } = await api.post('/api/v1/iam/sign-up', payload);

      // NO iniciar sesión automáticamente
      // NO guardar user ni token en el store
      // (El usuario debe iniciar sesión manualmente luego)

      return data; // éxito
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  }

  /* ============================================================
      LOGIN - USANDO BACKEND REAL
  ============================================================ */
  const login = async (username, password, persistence = 'local') => {
    try {
      const payload = {username, password}
      const { data } = await api.post('/api/v1/iam/sign-in',payload)

      if (!data?.token) {
        throw new Error('Respuesta inválida del servidor')
      }

      // Guardamos en store
      user.value = {
        id: data.id,
        username: data.username,
        role: data.role
      }

      token.value = data.token
      storageType.value = persistence



      // Persistimos
      persistSession(user.value, token.value, persistence)

      return user.value
    } catch (err) {
      console.error('Login error:', err)
      throw err
    }
  }

  /* ============================================================
      RESTORE SESSION
  ============================================================ */
  const restoreSession = async () => {
    const persisted = loadPersistedSession()

    if (!persisted.token || !persisted.user) {
      clearPersistedSession()
      user.value = null
      token.value = null
      return false
    }

    token.value = persisted.token
    user.value = persisted.user
    storageType.value = persisted.storageType

    return true
  }

  /* ============================================================
      LOGOUT
  ============================================================ */
  const logout = async () => {
    clearPersistedSession()
    user.value = null
    token.value = null
  }

  /* ============================================================
      GETTERS
  ============================================================ */
  const isAuthenticated = computed(() => token.value !== null)
  const isHost = computed(() => user.value?.role === 'HOST')
  const isOrganizer = computed(() => user.value?.role === 'ORGANIZER')

  return {
    user,
    token,
    storageType,

    register,
    login,
    restoreSession,
    logout,

    isAuthenticated,
    isHost,
    isOrganizer
  }
})
