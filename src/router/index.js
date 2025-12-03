// src/router/index.js

import { createRouter, createWebHistory } from "vue-router";
import pinia from "@/shared/stores/pinia.js";
import { useAuthStore } from "@/auth-management/application/services/auth.store.js";
import { taskRoutes } from '@/task-management/presentation/routes/task.routes.js';

// IMPORTS DE PÁGINAS
import EventPage from "@/social-event-management/doman/presentation/pages/event-page.component.vue";
import CreateAndEditEvent from "@/social-event-management/doman/presentation/components/create-and-edit-event.component.vue";

const QuoteCreatePage = () =>
  import("@/quote-management/presentation/pages/QuoteCreatePage.vue");
const QuoteDetailPage = () =>
  import("@/quote-management/presentation/pages/QuoteDetailPage.vue");
const QuoteEditPage = () =>
  import("@/quote-management/presentation/pages/QuoteEditPage.vue");

const routes = [
  // ========================================
  // LOGIN / REGISTRO
  // ========================================
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/auth-management/presentation/pages/LoginPage.vue'),
    meta: { requiresAuth: false, redirectIfAuth: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/auth-management/presentation/pages/RegisterPage.vue'),
    meta: { requiresAuth: false, redirectIfAuth: true },
  },

  // ========================================
  // REDIRECCIÓN RAÍZ
  // ========================================
  {
    path: '/',
    redirect: () => {
      const auth = useAuthStore(pinia)
      if (auth.user?.role === 'HOST') return '/host/dashboard'
      if (auth.user?.role === 'ORGANIZER') return '/organizer/dashboard'
      return '/login'
    },
  },

  // ========================================
  // DASHBOARDS POR ROL
  // ========================================
  {
    path: '/host/dashboard',
    name: 'host-dashboard',
    component: () => import('@/dashboard/infrastructure/components/host/HostDashboard.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: 'HOST',
      title: 'Panel Anfitrión',
    },
  },
  {
    path: '/organizer/dashboard',
    name: 'organizer-dashboard',
    component: () =>
      import('@/dashboard/infrastructure/components/organizer/OrganizerDashboard.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: 'ORGANIZER',
      title: 'Panel Organizador',
    },
  },

  // ========================================
  // PERFIL - ANFITRIÓN
  // ========================================
  {
    path: '/host/profile',
    name: 'host-profile',
    component: () => import('@/profile-management/presentation/pages/HostProfilePage.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: 'HOST',
      title: 'Mi Perfil',
    },
  },
  {
    path: '/host/profile/edit',
    name: 'host-profile-edit',
    component: () => import('@/profile-management/presentation/pages/HostProfileEditPage.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: 'HOST',
      title: 'Editar Perfil',
    },
  },

  // ========================================
  // PERFIL - ORGANIZADOR
  // ========================================
  {
    path: '/organizer/profile',
    name: 'organizer-profile',
    component: () => import('@/profile-management/presentation/pages/OrganizerProfilePage.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: 'ORGANIZER',
      title: 'Mi Perfil',
    },
  },
  {
    path: '/organizer/profile/edit',
    name: 'organizer-profile-edit',
    component: () => import('@/profile-management/presentation/pages/OrganizerProfileEditPage.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: 'ORGANIZER',
      title: 'Editar Perfil',
    },
  },

  // ========================================
  // EVENTOS
  // ========================================
  {
    path: '/events',
    name: 'events',
    component: EventPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/events/create',
    name: 'events-create',
    component: CreateAndEditEvent,
    meta: { requiresAuth: true },
  },
  {
    path: '/events/:id/edit',
    name: 'events-edit',
    component: CreateAndEditEvent,
    props: true,
    meta: { requiresAuth: true },
  },

  // ========================================
  // COTIZACIONES
  // ========================================
  {
    path: '/quotes',
    name: 'quotes',
    component: () => import('@/quote-management/presentation/pages/QuotePage.vue'),
    meta: { requiresAuth: true, allowedRoles: ['ORGANIZER', 'HOST'] },
  },
  {
    path: '/quotes/create',
    name: 'quote-create',
    component: QuoteCreatePage,
    meta: { requiresAuth: true, allowedRoles: ['ORGANIZER', 'HOST'] },
  },
  {
    path: '/quotes/:id',
    name: 'quote-detail',
    component: QuoteDetailPage,
    props: true,
    meta: { requiresAuth: true, allowedRoles: ['ORGANIZER', 'HOST'] },
  },
  {
    path: '/quotes/:id/edit',
    name: 'quote-edit',
    component: QuoteEditPage,
    props: true,
    meta: { requiresAuth: true, requiresRole: 'ORGANIZER' },
  },
  {
    path: '/host/request-quote/:organizerId',
    name: 'RequestQuote',
    component: () => import('/src/quote-management/presentation/components/QuoteRequestForm.vue'),
    meta: { requiresAuth: true, role: 'HOST' }
  },
  // ========================================
  // NOTIFICACIONES Y CONFIGURACIÓN
  // ========================================
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('/src/profile-management/presentation/pages/NotificationsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('/src/profile-management/presentation/pages/SettingsPage.vue'),
    meta: { requiresAuth: true },
  },

  // ========================================
  // TASK ROUTES (Nuevo módulo)
  // ========================================
  ...taskRoutes,

  // ========================================
  // NOT FOUND
  // ========================================
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/shared/infrastructure/components/common/PageNotFound.vue'),
  }
]

// ========================================
// CONFIGURACIÓN DEL ROUTER
// ========================================
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ========================================
// GUARD DE NAVEGACIÓN
// ========================================
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  const isLogged = auth.isAuthenticated;
  const role = auth.user?.role;

  // Rutas públicas con redirect si ya estás autenticado
  if (to.meta.redirectIfAuth && isLogged) {
    if (role === "HOST") return next("/host/dashboard");
    if (role === "ORGANIZER") return next("/organizer/dashboard");
  }

  // Requiere autenticación
  if (to.meta.requiresAuth && !isLogged) {
    return next("/login");
  }

  // Requiere rol único
  if (to.meta.requiresRole && to.meta.requiresRole !== role) {
    return next("/login");
  }

  // Roles múltiples
  if (Array.isArray(to.meta.allowedRoles) &&
    !to.meta.allowedRoles.includes(role)) {
    return next("/login");
  }

  next();
});

export default router;
