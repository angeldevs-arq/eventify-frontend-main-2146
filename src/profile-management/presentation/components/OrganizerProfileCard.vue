<template>
  <div class="profile-card max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
    <!-- Foto de perfil -->
    <div class="relative bg-[#3A506B] h-32 flex items-center justify-center">
      <img
        v-if="organizer.photo"
        :src="organizer.photo"
        alt="Foto del organizador"
        class="absolute -bottom-12 w-24 h-24 rounded-full object-cover border-4 border-white"
      />
      <div
        v-else
        class="absolute -bottom-12 w-24 h-24 rounded-full bg-[#6fffe9] flex items-center justify-center text-[#3A506B] font-bold text-2xl border-4 border-white"
      >
        {{ organizerInitial }}
      </div>
    </div>

    <!-- Información -->
    <div class="pt-16 pb-4 px-6 text-center">
      <h2 class="text-xl font-bold text-[#3A506B]">{{ organizer.name || 'Nombre del organizador' }}</h2>
      <p class="text-sm text-gray-600 mb-2">{{ organizer.specialty || 'Especialidad no definida' }}</p>
      <p class="text-xs text-gray-500">📍 {{ organizer.location || 'Ubicación no especificada' }}</p>

      <div class="flex justify-center mt-4 space-x-3">
        <button
          @click="$emit('edit-profile', organizer)"
          class="px-4 py-2 bg-[#3A506B] text-white rounded hover:bg-[#6fffe9] hover:text-[#3A506B] transition"
        >
          Editar perfil
        </button>
        <button
          @click="$emit('view-albums', organizer)"
          class="px-4 py-2 bg-[#6fffe9] text-[#3A506B] rounded hover:bg-[#3A506B] hover:text-white transition"
        >
          Ver álbumes
        </button>
      </div>
    </div>

    <div class="border-t px-6 py-4 text-left">
      <p class="text-sm text-gray-600"><strong>Eventos organizados:</strong> {{ organizer.eventsCount || 0 }}</p>
      <p class="text-sm text-gray-600"><strong>Clientes atendidos:</strong> {{ organizer.clientsCount || 0 }}</p>
      <p class="text-sm text-gray-600"><strong>Calificación:</strong> ⭐ {{ organizer.rating || 'N/A' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ProfileApiService } from '@/profile-management/application/profile-api.service.js'
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js'

const organizer = ref({
  id: null,
  name: '',
  specialty: '',
  location: '',
  photo: '',
  eventsCount: 0,
  clientsCount: 0,
  rating: null
})

const organizerInitial = computed(() => organizer.value.name ? organizer.value.name.charAt(0).toUpperCase() : 'O')

const { user, restoreSession } = useAuth()

onMounted(async () => {
  try {
    if (!user.value) {
      await restoreSession()
    }

    if (!user.value?.id) {
      return
    }

    const data = await ProfileApiService.getProfile(user.value.id)
    organizer.value = data
  } catch (error) {
    console.error('Error cargando perfil de organizador:', error)
  }
})
</script>

<style scoped>
.profile-card {
  transition: transform 0.3s ease;
}
.profile-card:hover {
  transform: translateY(-4px);
}
</style>
