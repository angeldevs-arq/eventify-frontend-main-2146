<template>
  <div class="album-create-page max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
    <h1 class="text-2xl font-bold text-[#3A506B] mb-6">Crear nuevo álbum</h1>

    <!-- TÍTULO -->
    <div class="mb-4">
      <label class="block text-sm font-semibold text-gray-700 mb-1">Título</label>
      <input
        v-model="album.title"
        type="text"
        placeholder="Ej. Mi primer álbum de eventos"
        class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3A506B] outline-none"
      />
    </div>

    <!-- DESCRIPCIÓN -->
    <div class="mb-4">
      <label class="block text-sm font-semibold text-gray-700 mb-1">Descripción</label>
      <textarea
        v-model="album.description"
        placeholder="Agrega una breve descripción del álbum..."
        rows="3"
        class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3A506B] outline-none"
      ></textarea>
    </div>

    <!-- SUBIR IMÁGENES -->
    <div class="mb-4">
      <label class="block text-sm font-semibold text-gray-700 mb-1">Imágenes</label>
      <input type="file" multiple accept="image/*" @change="onFileChange" />
      <p class="text-xs text-gray-500 mt-1">Puedes seleccionar varias imágenes a la vez.</p>
    </div>

    <!-- PREVISUALIZACIÓN -->
    <div v-if="previewImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      <div
        v-for="(image, index) in previewImages"
        :key="index"
        class="relative w-full h-32 overflow-hidden rounded-lg border"
      >
        <img :src="image" alt="Preview" class="w-full h-full object-cover" />
        <button
          @click="removeImage(index)"
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
        @click="createAlbum"
        class="px-4 py-2 bg-[#3A506B] text-white rounded hover:bg-[#6fffe9] hover:text-[#3A506B] transition"
      >
        Crear álbum
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlbumApiService } from '/src/profile-management/application/album-api.service.js'

const router = useRouter()

const album = ref({
  title: '',
  description: '',
  images: []
})

const previewImages = ref([])

function onFileChange(event) {
  const files = Array.from(event.target.files)
  album.value.images = files

  previewImages.value = files.map(file => URL.createObjectURL(file))
}

function removeImage(index) {
  album.value.images.splice(index, 1)
  previewImages.value.splice(index, 1)
}

async function createAlbum() {
  if (!album.value.title.trim()) {
    alert('El título es obligatorio')
    return
  }

  try {
    await AlbumApiService.create(album.value)
    router.push('/profile/albums')
  } catch (error) {
    console.error('Error al crear álbum:', error)
    alert('No se pudo crear el álbum. Intenta nuevamente.')
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.album-create-page {
  margin-top: 2rem;
}
</style>
