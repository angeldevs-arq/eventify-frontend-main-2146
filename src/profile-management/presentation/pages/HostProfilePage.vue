<!-- HostProfilePage.vue -->
<!-- src/profile-management/infrastructure/pages/HostProfilePage.vue -->

<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="page-header">
      <h1>{{ $t('host-profile.title') }}</h1>
      <p class="page-description">{{ $t('profile.description') }}</p>
    </header>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <ProgressSpinner />
    </div>

    <!-- Content -->
    <div v-else class="profile-content">
      <!-- Modo Lectura -->
      <div v-if="!isEditing" class="profile-layout">
        <!-- Columna Izquierda -->
        <aside class="profile-sidebar">
          <HostProfileCard
            :user="user"
            :user-initials="userInitials"
            @edit="isEditing = true"
          />
          <HostContactInfo :user="user" />
          <HostPreferencesChips :user="user" />
        </aside>

        <!-- Columna Derecha -->
        <main class="profile-main">
          <HostRecentEvents :events="recentEvents" />
          <HostRecentOrganizers
            :organizers="recentOrganizers"
            @quote-created="handleQuoteCreated"
          />
        </main>
      </div>

      <!-- Modo Edición -->
      <div v-else class="edit-mode">
        <div class="edit-header">
          <h2>{{ $t('host-profile.editTitle') }}</h2>
        </div>
        <HostProfileForm
          :user="user"
          :is-loading="isLoading"
          @save="handleSaveProfile"
          @cancel="isEditing = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import ProgressSpinner from 'primevue/progressspinner';
import HostProfileCard from '@/profile-management/presentation/components/HostProfileCard.vue';
import HostContactInfo from '@/profile-management/presentation/components/HostContactInfo.vue';
import HostPreferencesChips from '@/profile-management/presentation/components/HostPreferencesChips.vue';
import HostRecentEvents from '@/profile-management/presentation/components/HostRecentEvents.vue';
import HostRecentOrganizers from '@/profile-management/presentation/components/HostRecentOrganizers.vue';
import HostProfileForm from '@/profile-management/presentation/components/HostProfileForm.vue';
import { useHostProfile } from '@/profile-management/application/composables/useHostProfile.js';

const {
  user,
  isLoading,
  isEditing,
  userInitials,
  recentEvents,
  recentOrganizers,
  loadProfile,
  updateProfile,
} = useHostProfile();

onMounted(() => {
  loadProfile();
});

const handleSaveProfile = async (profileData) => {
  await updateProfile(profileData);
};

const handleQuoteCreated = () => {
  // Recargar eventos si es necesario
  loadProfile();
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  background: linear-gradient(135deg, #3A506B 0%, #2a3d52 100%);
  color: #fff;
  padding: 2rem;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.page-description {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.9;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Layout 2 columnas */
.profile-layout {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Edit mode */
.edit-mode {
  max-width: 600px;
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin: 0 auto;
}

.edit-header {
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #5BC0BE;
  padding-bottom: 1rem;
}

.edit-header h2 {
  margin: 0;
  color: #3A506B;
}

/* Responsive */
@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .profile-content {
    padding: 0 0.75rem;
  }

  .profile-sidebar,
  .profile-main {
    gap: 1rem;
  }

  .edit-mode {
    padding: 1.5rem;
    margin: 0;
  }
}
</style>
