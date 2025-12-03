// ========================================
// IMPORTS PRINCIPALES
// ========================================
import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import i18n from '@/locales/index.js'
import pinia from '@/shared/stores/pinia.js'

// ========================================
// PRIMEVUE CONFIGURATION
// ========================================
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

// ========================================
// GLOBAL STYLES
// ========================================
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import '@/profile-management/presentation/styles/global.css'

// ========================================
// PRIMEVUE COMPONENTS - GLOBAL REGISTRATION
// ========================================
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Menubar from 'primevue/menubar'
import Message from 'primevue/message'
import Paginator from 'primevue/paginator'
import Password from 'primevue/password'
import Rating from 'primevue/rating'
import Sidebar from 'primevue/sidebar'
import TabPanel from 'primevue/tabpanel'
import TabView from 'primevue/tabview'
import Toast from 'primevue/toast'
import ToggleButton from 'primevue/togglebutton'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'

import { useAuthStore } from '@/auth-management/application/services/auth.store.js'

// ===============================================================
// BOOTSTRAP CORRECTO (restaurar sesión ANTES de montar la App)
// ===============================================================
async function bootstrap() {
  // 1. Crear la App
  const app = createApp(App)

  // 2. Activar Pinia ANTES de usar cualquier store
  app.use(pinia)

  // 3. Ahora ya podemos usar Pinia sin errores
  const auth = useAuthStore()

  // 4. Restaurar la sesión (esperar token + usuario)
  await auth.restoreSession()

  // 5. Registrar plugins
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        prefix: 'p',
        darkModeSelector: 'system',
        cssLayer: false,
      },
    },
  })
  app.use(router)
  app.use(i18n)
  app.use(ToastService)

  // 6. Registrar directivas
  app.directive('tooltip', Tooltip)

  // 7. Registrar los componentes globales
  app.component('Avatar', Avatar)
  app.component('Button', Button)
  app.component('Card', Card)
  app.component('Checkbox', Checkbox)
  app.component('DataTable', DataTable)
  app.component('Dialog', Dialog)
  app.component('Divider', Divider)
  app.component('Dropdown', Dropdown)
  app.component('InputText', InputText)
  app.component('Menubar', Menubar)
  app.component('Message', Message)
  app.component('Paginator', Paginator)
  app.component('Password', Password)
  app.component('Rating', Rating)
  app.component('Sidebar', Sidebar)
  app.component('TabPanel', TabPanel)
  app.component('TabView', TabView)
  app.component('Toast', Toast)
  app.component('ToggleButton', ToggleButton)
  app.component('Textarea', Textarea)
  app.component('Calendar', Calendar)
  app.component('ProgressBar', ProgressBar)
  app.component('ProgressSpinner', ProgressSpinner)

  // 8. Montar la App SOLO cuando todo está listo
  app.mount('#app')
}

bootstrap()
