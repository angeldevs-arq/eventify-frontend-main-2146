<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/shared/infrastructure/components/AppHeader.vue'

const route = useRoute()
const isAuthRoute = computed(() => route.path === '/login' || route.path === '/register')
</script>

<template>
  <div id="app">
    <!-- BARRA DE NAVEGACIÓN -->
    <AppHeader v-if="!isAuthRoute" />

    <!-- CONTENIDO PRINCIPAL -->
    <main :class="['main-content', { 'full-screen': isAuthRoute }]">
      <!-- Transición suave para páginas como perfil, álbumes y chat -->
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </main>
  </div>
</template>

<style>
/* Reset y estilos globales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
}

/* MAIN CONTENT — Mantuvimos lo tuyo y agregamos ancho máximo */
.main-content {
  padding: 2rem;
  min-height: calc(100vh - 80px); /* Altura con header */
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}

.main-content.full-screen {
  padding: 0;
  min-height: 100vh; /* Altura sin header */
  max-width: none;
  margin: 0;
}

/* ================================
   TRANSICIONES ENTRE PÁGINAS (Profile, Albums, Chat)
   ================================ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ================================
   SCROLLBAR PERSONALIZADO — combina con el profile-management
   ================================ */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #3A506B;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6FFFE9;
}
</style>
