<script setup>
import { ref, onMounted } from "vue";
import api from "@/shared/infrastructure/http/axios.config.js";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';
const router = useRouter();
const { t } = useI18n();
const organizers = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const selected = ref(null);

const defaultAvatar =
  "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";

// Cargar organizadores desde API
const loadOrganizers = async () => {
  try {
    const response = await api.get("/api/v1/profiles/organizers", {
    });
    organizers.value = response.data;
  } catch (error) {
    error.value = "Error al cargar organizadores";
  } finally {
    loading.value = false;
  }
};

const openProfile = (org) => {
  selected.value = org;
  showModal.value = true;
};

const goToQuote = (org) => {
  router.push({
    name: "quote-create",
    query: { organizerId: org.id },
  });
};

onMounted(loadOrganizers);
</script>
<template>
  <div class="dashboard-container">
    <h1 class="page-title">{{$t('dashboard.welcome')}}</h1>
    <p class="page-subtitle">Explora y conecta con los organizadores disponibles</p>

    <!-- Loading State -->
    <div v-if="loading" class="loading-box">
      <i class="pi pi-spin pi-spinner"></i>
      <span>Cargando organizadores...</span>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-box">
      {{ error }}
    </div>

    <!-- Organizer Grid -->
    <div class="organizer-grid" v-if="organizers.length > 0">
      <div v-for="org in organizers" :key="org.id" class="organizer-card">
        <img
          :src="org.profileImage || defaultAvatar"
          alt="Organizer"
          class="card-avatar"
        />

        <div class="card-info">
          <h3 class="card-name">{{ org.name }}</h3>
          <p class="card-email">{{ org.email }}</p>
          <p class="card-role">Organizador</p>
        </div>

        <div class="card-actions">
          <Button
            label="Ver Perfil"
            icon="pi pi-user"
            class="p-button-info w-full"
            @click="openProfile(org)"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && organizers.length === 0" class="empty-box">
      <i class="pi pi-users"></i>
      <p>No hay organizadores registrados aún.</p>
    </div>

    <!-- Organizer Modal -->
    <Dialog
      v-model:visible="showModal"
      modal
      header="Perfil del Organizador"
      :style="{ width: '450px' }"
    >
      <div v-if="selected">
        <div class="profile-header">
          <img
            :src="selected.profileImage || defaultAvatar"
            class="profile-avatar"
          />
          <h2>{{ selected.name }}</h2>
          <p>{{ selected.email }}</p>
        </div>

        <Divider />

        <h3 class="profile-subtitle">Información</h3>
        <ul class="profile-list">
          <li><strong>Rol:</strong> Organizador</li>
          <li><strong>ID:</strong> {{ selected.id }}</li>
          <li><strong>Estado:</strong> {{ selected.status }}</li>
        </ul>

        <Divider />

        <Button
          label="Solicitar Cotización"
          icon="pi pi-send"
          class="p-button-success w-full"
          @click="goToQuote(selected)"
        />
      </div>
    </Dialog>
  </div>
</template>
<style scoped>
.dashboard-container {
  padding: 2.5rem;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
}
.page-subtitle {
  color: #666;
  margin-bottom: 2rem;
}

.loading-box,
.error-box,
.empty-box {
  background: #f8fafc;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
}

.organizer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.2rem;
}

.organizer-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-avatar {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.card-info {
  text-align: center;
  margin-bottom: 1rem;
}

.card-name {
  font-size: 1.2rem;
  font-weight: bold;
}
.card-email {
  color: #777;
  font-size: 0.9rem;
}

.card-actions {
  width: 100%;
  margin-top: auto;
}

.profile-header {
  text-align: center;
}
.profile-avatar {
  width: 95px;
  height: 95px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.profile-list {
  list-style: none;
  padding: 0;
}
.profile-list li {
  margin-bottom: 6px;
}
</style>
