<!-- HostProfileCard.vue -->
<!-- src/profile-management/infrastructure/components/host/HostProfileCard.vue -->

<template>
  <section class="profile-card">
    <!-- Avatar y Nombre -->
    <div class="profile-header">
      <Avatar

        :image="user.profileImageUrl"
        size="xlarge"
        :style="{ backgroundColor: '#5BC0BE', color: '#fff' }"
        shape="circle"
      />
      <div class="profile-info">
        <h1 class="profile-name">{{ user?.firstName + ' ' + user?.lastName  || 'Usuario' }}</h1>
        <p class="profile-role">HOST</p>
      </div>
    </div>

    <!-- Botón Editar -->
    <Button
      :label="$t('host-profile.actions.editProfile')"
      @click="handleEditClick"
      class="edit-button"
      icon="pi pi-pencil"
    />
  </section>
</template>

<script setup>
import { defineEmits } from 'vue';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import { useHostProfile } from '@/profile-management/application/composables/useHostProfile.js';

defineProps({
  user: {
    type: Object,
    default: null,
  },
  userInitials: {
    type: String,
    default: '?',
  },
});

const emit = defineEmits(['edit']);

const handleEditClick = () => {
  emit('edit');
};
</script>

<style scoped>
.profile-card {
  background: linear-gradient(135deg, #3A506B 0%, #2a3d52 100%);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.profile-info {
  width: 100%;
}

.profile-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #fff;
}

.profile-role {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: #6FFFE9;
}

.edit-button {
  width: 100%;
  background-color: #1C2541;
  border: none;
  color: #fff;
  font-weight: 500;
  padding: 0.75rem;
}

.edit-button:hover {
  background-color: #5BC0BE;
  color: #1C2541;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-card {
    padding: 1.5rem;
  }

  .profile-name {
    font-size: 1.25rem;
  }
}
</style>
