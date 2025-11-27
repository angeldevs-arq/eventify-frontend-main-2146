<template>
  <nav class="navbar flex items-center justify-between px-6 py-3 shadow-md">
    <!-- LOGO -->
    <div class="flex items-center space-x-2 cursor-pointer" @click="$router.push('/dashboard')">
      <span class="text-[#6fffe9] font-bold text-xl">Eventify</span>
    </div>

    <!-- LINKS -->
    <div class="hidden md:flex space-x-6">
      <RouterLink
        v-for="link in links"
        :key="link.name"
        :to="link.path"
        class="nav-link"
        active-class="active-link"
      >
        {{ link.name }}
      </RouterLink>
    </div>

    <!-- BOTÓN PERFIL -->
    <div class="flex items-center space-x-3">
      <div class="w-9 h-9 flex items-center justify-center rounded-full bg-[#6fffe9] text-[#3A506B] font-bold cursor-pointer"
           @click="$router.push('/profile')">
        {{ userInitial }}
      </div>
      <button @click="logout" class="text-white hover:text-[#6fffe9] transition text-sm">
        Cerrar sesión
      </button>
    </div>

    <!-- MENU RESPONSIVO -->
    <button class="md:hidden text-white focus:outline-none" @click="toggleMenu">
      ☰
    </button>

    <div v-if="menuOpen" class="absolute top-16 right-0 bg-[#3A506B] text-white w-40 rounded shadow-md md:hidden">
      <RouterLink
        v-for="link in links"
        :key="link.name"
        :to="link.path"
        class="block px-4 py-2 hover:bg-[#6fffe9] hover:text-[#3A506B]"
        @click="toggleMenu"
      >
        {{ link.name }}
      </RouterLink>
      <button
        @click="logout"
        class="w-full text-left px-4 py-2 hover:bg-[#6fffe9] hover:text-[#3A506B]"
      >
        Cerrar sesión
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const links = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Eventos', path: '/events' },
  { name: 'Tareas', path: '/task' },
  { name: 'Cotizaciones', path: '/quotes' },
  { name: 'Mensajes', path: '/messages' },
  { name: 'Perfil', path: '/profile' }
]

// Simulación de usuario logueado
const userName = ref('Organizador')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const menuOpen = ref(false)
function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function logout() {
  console.log('Cerrar sesión')
  router.push('/') // Aquí podrías limpiar el token real
}
</script>

<style scoped>
.navbar {
  background-color: #3A506B;
  color: white;
  position: relative;
}

.nav-link {
  text-decoration: none;
  font-size: 16px;
  color: white;
  transition: 0.3s ease-in-out;
}

.nav-link:hover,
.active-link {
  color: #6fffe9;
  font-size: 18px;
}

@media (max-width: 768px) {
  .navbar {
    flex-wrap: wrap;
  }
}
</style>
