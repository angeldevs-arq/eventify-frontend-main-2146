<!-- HostProfileForm.vue -->
<!-- src/profile-management/infrastructure/components/host/HostProfileForm.vue -->

<template>
  <form @submit.prevent="handleSubmit" class="profile-form">
    <div class="form-section">
      <h3 class="form-title">{{ $t('host-profile.sections.personalInfo') }}</h3>

      <!-- Nombre -->
      <div class="form-group">
        <label for="name" class="form-label">{{ $t('host-profile.labels.name') }}</label>
        <InputText
          id="name"
          v-model="formData.name"
          type="text"
          :placeholder="$t('host-profile.labels.name')"
          class="form-input"
        />
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email" class="form-label">{{ $t('host-profile.labels.email') }}</label>
        <InputText
          id="email"
          v-model="formData.email"
          type="email"
          :placeholder="$t('host-profile.labels.email')"
          class="form-input"
          disabled
        />
      </div>

      <!-- Teléfono -->
      <div class="form-group">
        <label for="phone" class="form-label">{{ $t('host-profile.labels.phone') }}</label>
        <InputText
          id="phone"
          v-model="formData.phone"
          type="tel"
          :placeholder="$t('host-profile.labels.phone')"
          class="form-input"
        />
      </div>

      <!-- Ubicación -->
      <div class="form-group">
        <label for="location" class="form-label">{{ $t('host-profile.labels.city') }}</label>
        <InputText
          id="location"
          v-model="formData.location"
          type="text"
          :placeholder="$t('host-profile.labels.city')"
          class="form-input"
        />
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="form-actions">
      <Button
        type="button"
        :label="$t('common.cancel')"
        severity="secondary"
        @click="$emit('cancel')"
      />
      <Button
        type="submit"
        :label="$t('common.save')"
        :loading="isLoading"
      />
    </div>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const props = defineProps({
  user: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save', 'cancel']);

const formData = reactive({
  name: props.user?.name || '',
  email: props.user?.email || '',
  phone: props.user?.phone || '',
  location: props.user?.location || '',
});

const handleSubmit = () => {
  emit('save', {
    name: formData.name,
    phone: formData.phone,
    location: formData.location,
  });
};
</script>

<style scoped>
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #3A506B;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #3A506B;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
}

.form-input:focus {
  border-color: #5BC0BE;
  box-shadow: 0 0 0 3px rgba(91, 192, 190, 0.1);
  outline: none;
}

.form-input:disabled {
  background-color: #f5f5f5;
  color: #999;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.form-actions :deep(.p-button) {
  min-width: 120px;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-form {
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions :deep(.p-button) {
    width: 100%;
  }
}
</style>
