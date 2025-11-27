// src/auth-management/infrastructure/composables/useAuth.js
import { computed } from 'vue'
import { useAuthStore } from '@/auth-management/application/services/auth.store.js'

export const useAuth = () => {
  const auth = useAuthStore()

  /* ================================
     Estado reactivo expuesto
  ================================= */
  const user = computed(() => auth.user)
  const token = computed(() => auth.token)
  const isAuthenticated = computed(() => auth.isAuthenticated)

  /* ================================
     Roles
  ================================= */
  const isHost = computed(() => auth.isHost)
  const isOrganizer = computed(() => auth.isOrganizer)

  /* ================================
     Acciones
  ================================= */
  const login = async (email, password, persistence = 'local') => {
    return await auth.login(email, password, persistence)
  }

  const register = async (payload, persistence = 'local') => {
    return await auth.register(payload, persistence)
  }

  const logout = async () => {
    return await auth.logout()
  }

  const restoreSession = async () => {
    return await auth.restoreSession()
  }

  /* ================================
     Nombre bonito del usuario
  ================================= */
  const userDisplayName = computed(() => {
    const name = auth.user?.name || auth.user?.fullName
    if (!name) return ''
    return name.split(' ').slice(0, 2).join(' ')
  })

  /* ================================
     Perfil según el rol
  ================================= */
  const profileRoute = computed(() => {
    if (!auth.user?.role) return '/login'

    return auth.user.role === 'host'
      ? '/host/profile'
      : '/organizer/profile'
  })

  return {
    // state
    user,
    token,
    isAuthenticated,

    // roles
    isHost,
    isOrganizer,

    // actions
    login,
    register,
    logout,
    restoreSession,

    // helpers
    userDisplayName,
    profileRoute
  }
}
