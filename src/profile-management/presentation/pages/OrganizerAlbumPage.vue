<template>
  <div class="organizer-album-page max-w-6xl mx-auto p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h1 class="text-2xl font-bold text-[#3A506B]">Mis Álbumes</h1>
      <button
        @click="goToCreate"
        class="mt-3 sm:mt-0 px-4 py-2 bg-[#3A506B] text-white rounded hover:bg-[#6fffe9] hover:text-[#3A506B] transition"
      >
        + Crear álbum
      </button>
    </div>

    <!-- Lista de álbumes -->
    <div v-if="albums.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      <div
        v-for="album in albums"
        :key="album.id"
        class="album-card bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition"
      >
        <!-- Imagen -->
        <div class="relative h-40 overflow-hidden">
          <img
            v-if="album.images && album.images.length > 0"
            :src="album.images[0]"
            alt="Portada del álbum"
            class="w-full h-full object-cover cursor-pointer"
            @click="viewAlbum(album.id)"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm"
            @click="viewAlbum(album.id)"
          >
            Sin imagen
          </div>
        </div>

        <!-- Contenido -->
        <div class="p-3">
          <h3
            class="text-lg font-semibold text-[#3A506B] truncate cursor-pointer"
            @click="viewAlbum(album.id)"
          >
            {{ album.title }}
          </h3>
          <p class="text-sm text-gray-600 line-clamp-2 mt-1">
            {{ album.description || 'Sin descripción' }}
          </p>
        </div>

        <!-- Acciones -->
        <div class="flex justify-between items-center px-3 py-2 border-t text-sm">
          <button
            @click="editAlbum(album.id)"
            class="text-blue-600 hover:underline"
          >
            Editar
          </button>
          <button
            @click="deleteAlbum(album.id)"
            class="text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Sin álbumes -->
    <div v-else class="text-center text-gray-500 py-10">
      No tienes álbumes creados aún.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AlbumApiService } from '@/profile-management/application/album-api.service.js'

const router = useRouter()
const albums = ref([])

onMounted(async () => {
  try {
    albums.value = await AlbumApiService.getAll()
  } catch (error) {
    console.error('Error al cargar álbumes:', error)
  }
})

function goToCreate() {
  router.push('/profile/albums/create')
}

function viewAlbum(id) {
  router.push(`/profile/albums/detail/${id}`)
}

function editAlbum(id) {
  router.push(`/profile/albums/edit/${id}`)
}

async function deleteAlbum(id) {
  const confirmDelete = confirm('¿Estás seguro de eliminar este álbum?')
  if (!confirmDelete) return

  try {
    await AlbumApiService.delete(id)
    albums.value = albums.value.filter(album => album.id !== id)
  } catch (error) {
    console.error('Error al eliminar álbum:', error)
    alert('No se pudo eliminar el álbum.')
  }
}
</script>

<style scoped>
.album-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.album-card:hover {
  transform: translateY(-4px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
