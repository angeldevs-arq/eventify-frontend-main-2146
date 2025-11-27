<template>
  <div class="album-edit-page max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
    <h1 class="text-2xl font-bold text-[#3A506B] mb-6">Editar álbum</h1>

    <!-- TÍTULO -->
    <div class="mb-4">
      <label class="block text-sm font-semibold text-gray-700 mb-1">Título</label>
      <input
        v-model="album.title"
        type="text"
        placeholder="Título del álbum"
        class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3A506B] outline-none"
      />
    </div>

    <!-- DESCRIPCIÓN -->
    <div class="mb-4">
      <label class="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
      <textarea
        v-model="album.description"
        placeholder="Descripción del álbum..."
        rows="3"
        class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3A506B] outline-none"
      ></textarea>
    </div>

    <!-- IMÁGENES ACTUALES -->
    <div v-if="album.images && album.images.length > 0" class="mb-4">
      <label class="block text-sm font-semibold text-gray-700 mb-1">Imágenes actuales</label>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
        <div
          v-for="(image, index) in album.images"
          :key="'existing-' + index"
          class="relative w-full h-32 overflow-hidden rounded-lg border"
        >
          <img :src="image" alt="Imagen existente" class="w-full h-full object-cover" />
          <button
            @click="removeExistingImage(index)"
            class="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- NUEVAS IMÁGENES -->
    <div class="mb-4">
      <label class="block text-sm font-semibold text-gray-700 mb-1">Agregar nuevas imágenes</label>
      <input type="file" multiple accept="image/*" @change="onFileChange" />
      <p class="text-xs text-gray-500 mt-1">Puedes añadir más imágenes al álbum.</p>
    </div>

    <!-- PREVISUALIZACIÓN DE NUEVAS -->
    <div v-if="previewImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      <div
        v-for="(image, index) in previewImages"
        :key="'new-' + index"
        class="relative w-full h-32 overflow-hidden rounded-lg border"
      >
        <img :src="image" alt="Preview" class="w-full h-full object-cover" />
        <button
          @click="removeNewImage(index)"
          class="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- BOTONES -->
    <div class="mt-6 flex justify-end gap-3">
      <button
        @click="goBack"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
      >
        Cancelar
      </button>
      <button
        @click="updateAlbum"
        class="px-4 py-2 bg-[#3A506B] text-white rounded hover:bg-[#6fffe9] hover:text-[#3A506B] transition"
      >
        Guardar cambios
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlbumApiService } from '/src/profile-management/application/album-api.service.js'

const router = useRouter()
const route = useRoute()
const albumId = route.params.id

const album = ref({
  id: null,
  title: '',
  description: '',
  images: []
})

const previewImages = ref([])
const newImages = ref([])

// Cargar álbum existente
onMounted(async () => {
  try {
    const data = await AlbumApiService.getById(albumId)
    album.value = data
  } catch (error) {
    console.error('Error al cargar álbum:', error)
  }
})

function onFileChange(event) {
  const files = Array.from(event.target.files)
  newImages.value.push(...files)
  previewImages.value.push(...files.map(file => URL.createObjectURL(file)))
}

function removeExistingImage(index) {
  album.value.images.splice(index, 1)
}

function removeNewImage(index) {
  newImages.value.splice(index, 1)
  previewImages.value.splice(index, 1)
}

async function updateAlbum() {
  if (!album.value.title.trim()) {
    alert('El título es obligatorio')
    return
  }

  try {
    const updatedData = { ...album.value, newImages: newImages.value }
    await AlbumApiService.update(albumId, updatedData)
    router.push('/profile/albums')
  } catch (error) {
    console.error('Error al actualizar álbum:', error)
    alert('No se pudo actualizar el álbum. Intenta nuevamente.')
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.album-edit-page {
  margin-top: 2rem;
}
</style>
