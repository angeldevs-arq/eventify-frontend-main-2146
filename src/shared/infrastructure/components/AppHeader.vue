<script setup>
import { computed } from 'vue'
import Divider from 'primevue/divider'
import { useAppHeader } from './useAppHeader.js'

const {
  languageOptions,
  selectedLanguage,
  changeLanguage,
  sidebarVisible,
  toggleSidebar,
  closeSidebar,
  handleLogout,
  isAuthenticated,
  userDisplayName,
  user,          // ahora TODO se basa en user
  profileRoute,
} = useAppHeader()

/* ============================================================
   1. Esperar a que el usuario y su rol estén cargados
============================================================ */
const isSessionLoaded = computed(() => {
  return !!(user.value && user.value.role)
})

const navigationItems = computed(() => {
  if (!isSessionLoaded.value) return []

  const role = user.value?.role ?? null
  if (!role) return []

  if (role === 'HOST') {
    return [
      { key: 'dashboard', icon: 'pi pi-home', to: '/host/dashboard', labelKey: 'header.dashboard' },
      { key: 'events', icon: 'pi pi-calendar', to: '/events', labelKey: 'header.events' },
      { key: 'quotes', icon: 'pi pi-file-edit', to: '/quotes', labelKey: 'header.quotes' },
    ]
  }

  if (role === 'ORGANIZER') {
    return [
      { key: 'dashboard', icon: 'pi pi-home', to: '/organizer/dashboard', labelKey: 'header.dashboard' },
      { key: 'events', icon: 'pi pi-calendar', to: '/events', labelKey: 'header.events' },
      { key: 'tasks', icon: 'pi pi-check-square', to: '/tasks', labelKey: 'header.task' },
      { key: 'quotes', icon: 'pi pi-file-edit', to: '/quotes', labelKey: 'header.quotes' },
      { key: 'messages', icon: 'pi pi-envelope', to: '/messages', labelKey: 'header.messages' },
    ]
  }

  return []
})
</script>

<template>
  <!-- Mostrar pantalla de carga mientras user.role NO existe -->
  <div v-if="!isSessionLoaded" class="loading-header">
    <i class="pi pi-spin pi-spinner"></i> Cargando...
  </div>

  <header v-else class="app-header">
    <div class="header-container">

      <Button icon="pi pi-bars" @click="toggleSidebar" class="menu-toggle-btn" text />

      <div class="logo-container">
        <img src="/src/assets/img/eventify_logo.png" class="logo" />
      </div>

      <!-- Navegación -->
      <nav class="main-navigation">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.key"
          :to="item.to"
          class="nav-item"
        >
          <i :class="item.icon"></i>
          <span>{{ $t(item.labelKey) }}</span>
        </RouterLink>
      </nav>

      <div class="user-zone">

        <Dropdown
          v-model="selectedLanguage"
          :options="languageOptions"
          optionLabel="name"
          @change="changeLanguage($event.value)"
          class="language-selector"
        />

        <RouterLink to="/notifications" class="user-action-btn">
          <i class="pi pi-bell"></i>
        </RouterLink>

        <RouterLink to="/settings" class="user-action-btn">
          <i class="pi pi-cog"></i>
        </RouterLink>

        <RouterLink :to="profileRoute" v-if="isAuthenticated" class="user-profile">
          <Avatar class="user-avatar" shape="circle"
                  image="https://www.gravatar.com/avatar/05dfd4b41340d09cae045235eb0893c3?d=mp" />
          <span class="user-name">{{ userDisplayName }}</span>
        </RouterLink>

        <Button
          v-if="isAuthenticated"
          icon="pi pi-sign-out"
          label="Sign Out"
          @click="handleLogout"
          class="p-button-danger p-button-sm"
        />
      </div>
    </div>

    <!-- Sidebar móvil -->
    <Sidebar v-model:visible="sidebarVisible" position="left" class="custom-sidebar">
      <template #header>
        <img class="logo" src="/src/assets/img/eventify_logo.png" />
      </template>

      <nav class="sidebar-navigation">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.key"
          :to="item.to"
          @click="closeSidebar"
          class="sidebar-nav-item"
        >
          <i :class="item.icon"></i>
          <span>{{ $t(item.labelKey) }}</span>
        </RouterLink>

        <Divider />

        <RouterLink to="/notifications" class="sidebar-nav-item" @click="closeSidebar">
          <i class="pi pi-bell"></i>
          <span>Notificaciones</span>
        </RouterLink>

        <RouterLink to="/settings" class="sidebar-nav-item" @click="closeSidebar">
          <i class="pi pi-cog"></i>
          <span>Configuración</span>
        </RouterLink>

        <Divider />

        <Button
          label="Cerrar Sesión"
          icon="pi pi-sign-out"
          @click="handleLogout"
          class="p-button-danger p-button-text w-full text-left p-3"
        />
      </nav>
    </Sidebar>
  </header>
</template>
<style scoped>
/* =======================
   loading safe render
======================= */
.loading-header {
  padding: 1rem;
  text-align: center;
  background: #3a506b;
  color: white;
  font-weight: 500;
}

/* =======================
   rest of your exact styles
======================= */

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}
.user-profile:hover .user-name {
  color: #ffffff;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #3a506b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
}

.logo {
  height: 32px;
}

.menu-toggle-btn {
  display: none;
  color: #6fffe9 !important;
}

.main-navigation {
  display: flex;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6fffe9;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: #5bc0be;
  color: #ffffff;
}

.user-zone {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-action-btn {
  color: #6fffe9 !important;
  padding: 0.5rem !important;
  border-radius: 50% !important;
}

.user-avatar {
  width: 32px !important;
  height: 32px !important;
  border: 2px solid #5bc0be !important;
}

.user-name {
  color: #6fffe9;
  font-weight: 500;
}

.custom-sidebar {
  width: 280px !important;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: #1c2541;
}

@media (max-width: 768px) {
  .menu-toggle-btn {
    display: flex !important;
  }
  .main-navigation {
    display: none;
  }
  .user-name {
    display: none;
  }
}
</style>
