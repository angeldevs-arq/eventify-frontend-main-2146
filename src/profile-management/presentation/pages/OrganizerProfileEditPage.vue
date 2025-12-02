<template>
  <div class="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-8">
    <!-- Volver -->
    <a href="/profile" class="text-sm text-[#3A506B] hover:underline block mb-4">
      &lt; Volver al perfil
    </a>

    <!-- Título -->
    <h1 class="text-2xl font-semibold text-[#3A506B] mb-6">Editar Perfil</h1>

    <!-- FOTO -->
    <div class="flex flex-col items-center mb-6">
      <div class="relative">
        <img
          v-if="previewPhoto || organizer.profileImageUrl"
          :src="previewPhoto || organizer.profileImageUrl"
          alt="Foto de perfil"
          class="w-24 h-24 rounded-full object-cover bg-gray-100 border border-gray-300"
        />
        <div
          v-else
          class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold"
        >
          Foto
        </div>

        <label
          for="photo"
          class="absolute bottom-0 right-0 bg-[#3A506B] text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-[#6fffe9] hover:text-[#3A506B] transition"
        >
          Cambiar foto
        </label>
        <input id="photo" type="file" accept="image/*" class="hidden" @change="onPhotoChange" />
      </div>
    </div>

    <!-- FORMULARIO -->
    <form @submit.prevent="updateProfile" class="space-y-6">
      <!-- Información básica -->
      <section>
        <h2 class="text-lg font-medium text-[#3A506B] mb-2">Información básica</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombres*</label>
            <input
              v-model="organizer.firstName"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#3A506B] outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos*</label>
            <input
              v-model="organizer.lastName"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#3A506B] outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email*</label>
            <input
              v-model="organizer.email"
              type="email"
              class="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#3A506B] outline-none"
            />
          </div>
        </div>
      </section>

      <!-- Ubicación -->
      <section>
        <h2 class="text-lg font-medium text-[#3A506B] mb-2">Ubicación y especialidades</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Calle*</label>
            <input
              v-model="organizer.street"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#3A506B] outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Numero*</label>
            <input
              v-model="organizer.number"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#3A506B] outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Código Postal*</label>
            <input
              v-model="organizer.postalCode"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#3A506B] outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ciudad*</label>
            <input
              v-model="organizer.city"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#3A506B] outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">País*</label>
            <input
              v-model="organizer.country"
              type="text"
              class="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#3A506B] outline-none"
            />
          </div>
        </div>
      </section>

      <!-- BOTONES -->
      <div class="flex justify-end gap-3 pt-4">
        <button
          type="button"
          @click="goBack"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-[#3A506B] text-white rounded-md hover:bg-[#6fffe9] hover:text-[#3A506B] transition"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ProfileApiService } from '@/profile-management/application/profile-api.service.js'
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js'

const router = useRouter()
const organizer = ref({
  id: '',
  firstName: '',
  lastName:'',
  email: '',
  street:'',
  number:'',
  postalCode:'',
  city: '',
  country:'',
  type: '',
  profileImageUrl: '',
  profileImagePublicId:'',
})

const previewPhoto = ref(null)
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
    console.error('Error al cargar perfil:', error)
  }
})

function onPhotoChange(event) {
  const file = event.target.files[0]
  if (file) {
    previewPhoto.value = URL.createObjectURL(file)
    organizer.value.photoFile = file
  }
}

async function updateProfile() {
  try {
    const formData = new FormData()
    for (const key in organizer.value) {
      if (organizer.value[key]) formData.append(key, organizer.value[key])
    }
    if (organizer.value.photoFile) {
      formData.append('photo', organizer.value.photoFile)
    }

    await ProfileApiService.updateProfile(organizer.value.id, formData)
    router.push('/organizer/profile')
  } catch (error) {
    alert('No se pudo actualizar el perfil.')
    console.error(error)
  }
}

function goBack() {
  router.push('/profile')
}
</script>

<style scoped>
body {
  background-color: #f9fafb;
}
</style>
