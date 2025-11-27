<template>
  <div class="album-form-container p-4 bg-white rounded shadow-md">
    <h2 class="text-xl font-bold mb-4">
      {{ isEditing ? 'Editar Álbum' : 'Crear Álbum' }}
    </h2>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">

      <!-- Nombre del Álbum -->
      <div>
        <label for="title" class="block text-sm font-medium mb-1">Título del Álbum</label>
        <input
          id="title"
          v-model="album.title"
          type="text"
          required
          class="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-[#6fffe9]"
          placeholder="Ej. Mi primer evento"
        />
      </div>

      <!-- Descripción -->
      <div>
        <label for="description" class="block text-sm font-medium mb-1">Descripción</label>
        <textarea
          id="description"
          v-model="album.description"
          rows="3"
          class="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-[#6fffe9]"
          placeholder="Describe este álbum..."
        ></textarea>
      </div>

      <!-- Subir imágenes -->
      <div>
        <label class="block text-sm font-medium mb-1">Imágenes</label>
        <input
          type="file"
          multiple
          accept="image/*"
          @change="handleFilesUpload"
          class="block w-full text-sm text-gray-500"
        />
        <div class="mt-2 flex flex-wrap gap-2">
          <img
            v-for="(img, index) in previewImages"
            :key="index"
            :src="img"
            alt="preview"
            class="w-24 h-24 object-cover rounded border"
          />
        </div>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-2 mt-4">
        <button
          type="button"
          @click="resetForm"
          class="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-[#3A506B] text-white rounded hover:bg-[#6fffe9] hover:text-[#3A506B] transition"
        >
          {{ isEditing ? 'Actualizar' : 'Crear' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { AlbumApiService } from '@/profile-management/application/services/album-api.service.js'

// Props para reutilizar el formulario en edición y creación
const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  }
})
const emit = defineEmits(['update:modelValue', 'saved'])

const album = ref({
  id: null,
  title: '',
  description: '',
  images: []
})

const previewImages = ref([])
const isEditing = ref(false)

// Cuando el formulario recibe un álbum para editar
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    album.value = { ...newVal }
    previewImages.value = newVal.images || []
    isEditing.value = true
  }
}, { immediate: true })

// Manejo de archivos
function handleFilesUpload(e) {
  const files = e.target.files
  const urls = Array.from(files).map(file => URL.createObjectURL(file))
  previewImages.value = [...previewImages.value, ...urls]
  album.value.images = [...album.value.images, ...urls]
}

// Enviar formulario
async function handleSubmit() {
  try {
    if (isEditing.value) {
      await AlbumApiService.update(album.value.id, album.value)
    } else {
      await AlbumApiService.create(album.value)
    }
    emit('saved', album.value)
    resetForm()
  } catch (error) {
    console.error('Error al guardar álbum:', error)
  }
}

// Limpiar formulario
function resetForm() {
  album.value = { id: null, title: '', description: '', images: [] }
  previewImages.value = []
  isEditing.value = false
  emit('update:modelValue', null)
}
</script>

<style scoped>
.album-form-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
