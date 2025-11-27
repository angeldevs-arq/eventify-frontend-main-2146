<template>
  <div class="album-list-container p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-[#3A506B]">Mis Álbumes</h2>
      <button
        @click="$emit('create')"
        class="px-4 py-2 bg-[#3A506B] text-white rounded hover:bg-[#6fffe9] hover:text-[#3A506B] transition"
      >
        + Crear Álbum
      </button>
    </div>

    <!-- Si no hay álbumes -->
    <div v-if="albums.length === 0" class="text-gray-500 text-center py-8">
      No tienes álbumes creados aún.
    </div>

    <!-- Lista de álbumes -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="album in albums"
        :key="album.id"
        class="album-card border rounded-lg shadow hover:shadow-lg transition bg-white"
      >
        <!-- Imagen principal -->
        <div class="relative h-48 overflow-hidden rounded-t-lg">
          <img
            v-if="album.images && album.images.length > 0"
            :src="album.images[0]"
            alt="Album cover"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm"
          >
            Sin imagen
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-3">
          <h3 class="font-semibold text-lg text-[#3A506B] truncate">
            {{ album.title }}
          </h3>
          <p class="text-sm text-gray-600 line-clamp-2 mt-1">
            {{ album.description || 'Sin descripción' }}
          </p>
        </div>

        <!-- Acciones -->
        <div class="flex justify-between items-center p-3 border-t text-sm">
          <button
            @click="$emit('view', album)"
            class="text-[#3A506B] hover:text-[#6fffe9] transition"
          >
            Ver
          </button>
          <div class="flex gap-3">
            <button
              @click="$emit('edit', album)"
              class="text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              @click="$emit('delete', album.id)"
              class="text-red-600 hover:underline"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { AlbumApiService } from '@/profile-management/application/services/album-api.service.js'

const albums = ref([])

async function loadAlbums() {
  try {
    albums.value = await AlbumApiService.getAll()
  } catch (error) {
    console.error('Error al cargar álbumes:', error)
  }
}

onMounted(() => {
  loadAlbums()
})
</script>

<style scoped>
.album-card {
  cursor: pointer;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
