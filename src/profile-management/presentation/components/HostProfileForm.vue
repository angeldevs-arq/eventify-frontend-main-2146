<!-- HostProfileForm.vue -->
<!-- src/profile-management/infrastructure/components/host/HostProfileForm.vue -->

<template>
  <form @submit.prevent="handleSubmit" class="profile-form">
    <div class="form-section">
      <h3 class="form-title">{{ $t('host-profile.sections.personalInfo') }}</h3>

      <!-- Nombre -->
      <div class="form-group">
        <label for="name" class="form-label">First Name</label>
        <InputText
          id="name"
          v-model="formData.firstName"
          type="text"
          placeholder="First Name"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="name" class="form-label">Last Name</label>
        <InputText
          id="name"
          v-model="formData.lastName"
          type="text"
          placeholder="Last Name"
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
        <label for="phone" class="form-label">Street</label>
        <InputText
          id="phone"
          v-model="formData.street"
          type="tel"
          placeholder="Street"
          class="form-input"
        />
      </div>

      <!-- Ubicación -->
      <div class="form-group">
        <label for="location" class="form-label">Number</label>
        <InputText
          id="location"
          v-model="formData.number"
          type="text"
          placeholder="Number"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="location" class="form-label">Postal Code</label>
        <InputText
          id="location"
          v-model="formData.postalCode"
          type="text"
          placeholder="Postal Code"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="location" class="form-label">City</label>
        <InputText
          id="location"
          v-model="formData.city"
          type="text"
          placeholder="City"
          class="form-input"
        />
      </div>
      <div class="form-group">
        <label for="location" class="form-label">Country</label>
        <InputText
          id="location"
          v-model="formData.country"
          type="text"
          placeholder="Country"
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
import { useRouter } from 'vue-router'

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
  firstName: props.user?.firstName || '',
  lastName: props.user?.lastName || '',
  email: props.user?.email || '',
  street: props.user?.street || '',
  number: props.user?.number || '',
  postalCode: props.user?.postalCode || '',
  city: props.user?.city || '',
  country: props.user?.country || '',
  type: 'HOST',
  profileImageUrl: props.user?.profileImageUrl || '',
  profileImagePublicId: props.user?.profileImagePublicId || ''
});

const handleSubmit = () => {
  emit('save', {
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    email: formData.email || '',
    street: formData.street || '',
    number: formData.number || '',
    postalCode: formData.postalCode || '',
    city: formData.city || '',
    country: formData.country || '',
    type: 'HOST',
    profileImageUrl: formData.profileImageUrl || '',
    profileImagePublicId: formData.profileImagePublicId || ''
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
