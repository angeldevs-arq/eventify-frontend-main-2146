import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js'

export const useAppHeader = () => {
  const { locale } = useI18n()
  const router = useRouter()

  // Obtener auth store centralizado
  const {
    logout,
    isAuthenticated,
    user,
    isHost,
    isOrganizer,
  } = useAuth()

  /* ============================================================
     CONFIGURACIÓN DE IDIOMA
  ============================================================ */
  const languageOptions = ref([
    { name: 'English', code: 'en', flag: 'EN' },
    { name: 'Spanish', code: 'es', flag: 'ES' },
  ])

  const selectedLanguage = ref(
    languageOptions.value.find(l => l.code === locale.value) ??
    languageOptions.value[0]
  )

  const changeLanguage = (language) => {
    locale.value = language.code
    selectedLanguage.value = language
    localStorage.setItem('locale', language.code)
  }

  /* ============================================================
     SIDEBAR + UI
  ============================================================ */
  const sidebarVisible = ref(false)

  const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value
  }

  const closeSidebar = () => {
    sidebarVisible.value = false
  }

  /* ============================================================
     NOMBRE DEL USUARIO (SEGURO)
  ============================================================ */
  const userDisplayName = computed(() => {
    if (!user.value) return ''
    const full = user.value.fullName || user.value.name || ''
    const parts = full.trim().split(' ')
    return parts.slice(0, 2).join(' ')
  })

  /* ============================================================
     RUTA DEL PERFIL SEGÚN EL ROL
  ============================================================ */
  const profileRoute = computed(() => {
    if (!user.value || !user.value.role) return '/login'

    return user.value.role === 'host'
      ? '/host/profile'
      : '/organizer/profile'
  })

  /* ============================================================
     LOGOUT + REDIRECCIÓN SEGURA
  ============================================================ */
  const handleLogout = async () => {
    try {
      closeSidebar()
      await logout()
      router.push('/login')
    } catch (err) {
      console.error('Error during logout:', err)
    }
  }

  /* ============================================================
     RETORNAR TODO
  ============================================================ */
  return {
    // idioma
    languageOptions,
    selectedLanguage,
    changeLanguage,

    // sidebar
    sidebarVisible,
    toggleSidebar,
    closeSidebar,

    // usuario
    isAuthenticated,
    user,
    isHost,
    isOrganizer,
    userDisplayName,

    // rutas dinámicas
    profileRoute,

    // acciones
    handleLogout,
  }
}
