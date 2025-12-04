<template>
  <div class="host-dashboard">
    <div class="dashboard-header">
      <h1>Bienvenido,</h1>
      <p>Explora y conecta con los organizadores disponibles</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center p-8">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p class="mt-2">Cargando organizadores...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-message p-4 bg-red-50 border-red-200 rounded">
      <i class="pi pi-exclamation-circle text-red-600"></i>
      <span class="ml-2 text-red-600">{{ error }}</span>
    </div>

    <!-- Lista de Organizers -->
    <div v-else-if="organizers.length > 0" class="organizers-grid">
      <div
        v-for="organizer in organizers"
        :key="organizer.id"
        class="organizer-card"
        @click="viewProfile(organizer)"
      >
        <!-- Imagen de perfil -->
        <div class="organizer-avatar">
          <img
            v-if="organizer.profileImageUrl"
            :src="organizer.profileImageUrl"
            :alt="organizer.firstName"
          />
          <div v-else class="avatar-placeholder">
            {{ getInitials(organizer) }}
          </div>
        </div>

        <!-- Info del organizer -->
        <div class="organizer-info">
          <h3>{{ organizer.firstName }} {{ organizer.lastName }}</h3>
          <p class="text-gray-600">
            <i class="pi pi-map-marker"></i>
            {{ organizer.city || 'Ciudad no especificada' }}
          </p>
          <p class="text-gray-500">
            <i class="pi pi-envelope"></i>
            {{ organizer.email }}
          </p>
        </div>

        <!-- Botón de acción -->
        <button
          class="btn-request-quote"
          @click.stop="goToRequestQuote(organizer)"
        >
          <i class="pi pi-file"></i>
          Solicitar Cotización
        </button>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-else class="empty-state">
      <i class="pi pi-users" style="font-size: 3rem; color: #ccc;"></i>
      <p>No hay organizadores registrados aún.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ProfileApiService } from '@/profile-management/infrastructure/services/profile-api.service.js';

const goToRequestQuote = (organizer) => {
  router.push({
    name: 'request-quote',          // 👈 mismo name que en el router
    params: { organizerId: organizer.id } // 👈 AQUÍ PASAS EL ID
  });
};
const router = useRouter();

// Estado reactivo
const organizers = ref([]);
const loading = ref(false);
const error = ref(null);

/**
 * Cargar organizadores
 */
const loadOrganizers = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Obtener todos los perfiles y filtrar por tipo ORGANIZER
    const allProfiles = await ProfileApiService.getAllProfiles();
    organizers.value = allProfiles.filter(profile => profile.type === 'ORGANIZER');

    console.log('✅ Organizadores cargados:', organizers.value.length);
  } catch (err) {
    console.error('❌ Error al cargar organizadores:', err);
    error.value = 'Error al cargar los organizadores. Por favor, intenta de nuevo.';
    organizers.value = [];
  } finally {
    loading.value = false;
  }
};

/**
 * Obtener iniciales del nombre
 */
const getInitials = (organizer) => {
  const first = organizer.firstName?.charAt(0) || '';
  const last = organizer.lastName?.charAt(0) || '';
  return (first + last).toUpperCase();
};

/**
 * Ver perfil del organizer
 */
const viewProfile = (organizer) => {
  console.log('Ver perfil de:', organizer.firstName);
  // Navegar a la página de perfil
  router.push(`/organizer/${organizer.id}/profile`);
};

/**
 * Solicitar cotización
 */
const requestQuote = (organizer) => {
  console.log('Solicitar cotización a:', organizer.firstName);
  // Navegar al formulario de cotización
  router.push({
    name: 'RequestQuote',
    params: { organizerId: organizer.id }
  });
};

// Cargar al montar el componente
onMounted(() => {
  loadOrganizers();
});
</script>

<style scoped>
.host-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #718096;
  font-size: 1.1rem;
}

.organizers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.organizer-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.organizer-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
  border-color: #4299e1;
}

.organizer-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 3px solid #e2e8f0;
}

.organizer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
}

.organizer-info {
  flex: 1;
  margin-bottom: 1rem;
}

.organizer-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.organizer-info p {
  font-size: 0.9rem;
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-request-quote {
  background: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.3s ease;
  width: 100%;
  justify-content: center;
}

.btn-request-quote:hover {
  background: #3182ce;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.empty-state p {
  margin-top: 1rem;
  font-size: 1.1rem;
}

.error-message {
  display: flex;
  align-items: center;
  margin: 1rem 0;
}
</style>
