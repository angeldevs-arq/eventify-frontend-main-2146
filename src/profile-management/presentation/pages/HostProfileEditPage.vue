<!-- HostProfileEditPage.vue -->
<!-- src/profile-management/infrastructure/pages/HostProfileEditPage.vue -->
<template>
  <div class="profile-edit-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <RouterLink to="/host/profile" class="back-link">
          <i class="pi pi-arrow-left"></i>
          {{ $t('common.back') }}
        </RouterLink>
        <h1>{{ $t('profile.editTitle') }}</h1>
      </div>
    </header>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner />
      <p>{{ $t('profile.loading') }}</p>
    </div>

    <!-- Main content -->
    <div v-else class="edit-container">
      <div class="edit-wrapper">
        <!-- Avatar section -->
        <section class="avatar-section">
          <div class="avatar-container">
            <Avatar
              :label="userInitials"
              size="xlarge"
              :style="{ backgroundColor: '#5BC0BE', color: '#fff' }"
              shape="circle"
            />
            <Button
              type="button"
              icon="pi pi-camera"
              class="avatar-button"
              @click="showAvatarUpload = true"
              :title="$t('profile.actions.uploadPhoto')"
            />
          </div>
          <p class="avatar-hint">{{ $t('profile.avatarHint') }}</p>
        </section>

        <!-- Edit form -->
        <section class="form-section">
          <div class="form-content">
            <h2>{{ $t('profile.sections.personalInfo') }}</h2>

            <!-- Nombre completo -->
            <div class="form-group">
              <label for="fullName" class="form-label">
                {{ $t('profile.labels.name') }}
                <span class="required">*</span>
              </label>
              <InputText
                id="fullName"
                v-model="formData.name"
                type="text"
                :placeholder="$t('profile.labels.name')"
                class="form-input"
                @blur="validateField('name')"
              />
              <small v-if="errors.name" class="error-message">
                {{ errors.name }}
              </small>
            </div>

            <!-- Email (readonly) -->
            <div class="form-group">
              <label for="email" class="form-label">
                {{ $t('profile.labels.email') }}
                <span class="read-only-badge">{{ $t('common.readOnly') }}</span>
              </label>
              <InputText
                id="email"
                :model-value="formData.email"
                type="email"
                class="form-input"
                disabled
              />
              <small class="hint-text">{{ $t('profile.emailHint') }}</small>
            </div>

            <!-- Teléfono -->
            <div class="form-group">
              <label for="phone" class="form-label">
                {{ $t('profile.labels.phone') }}
              </label>
              <InputText
                id="phone"
                v-model="formData.phone"
                type="tel"
                :placeholder="$t('profile.labels.phone')"
                class="form-input"
                @blur="validateField('phone')"
              />
              <small v-if="errors.phone" class="error-message">
                {{ errors.phone }}
              </small>
            </div>

            <!-- Ubicación -->
            <div class="form-group">
              <label for="location" class="form-label">
                {{ $t('profile.labels.city') }}
              </label>
              <InputText
                id="location"
                v-model="formData.location"
                type="text"
                :placeholder="$t('profile.labels.city')"
                class="form-input"
              />
            </div>

            <!-- Biografía -->
            <div class="form-group">
              <label for="bio" class="form-label">
                {{ $t('profile.sections.description') }}
              </label>
              <Textarea
                id="bio"
                v-model="formData.bio"
                :placeholder="$t('profile.bioPlaceholder')"
                rows="4"
                class="form-input"
              />
              <small class="hint-text">
                {{ formData.bio?.length || 0 }}/500 {{ $t('common.characters') }}
              </small>
            </div>

            <!-- Preferencias de eventos -->
            <div class="form-group">
              <label class="form-label">
                {{ $t('profile.sections.preferences') }}
              </label>
              <div class="preferences-selector">
                <div
                  v-for="pref in availablePreferences"
                  :key="pref.id"
                  class="preference-item"
                >
                  <Checkbox
                    v-model="formData.preferences"
                    :input-value="pref.id"
                    :binary="false"
                  />
                  <label class="preference-label">
                    {{ pref.name }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Redes sociales -->
            <div class="form-section-divider">
              <h3>{{ $t('profile.sections.social') }}</h3>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="instagram" class="form-label">
                  <i class="pi pi-instagram"></i>
                  Instagram
                </label>
                <InputText
                  id="instagram"
                  v-model="formData.social.instagram"
                  type="text"
                  :placeholder="$t('profile.socialPlaceholder')"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="facebook" class="form-label">
                  <i class="pi pi-facebook"></i>
                  Facebook
                </label>
                <InputText
                  id="facebook"
                  v-model="formData.social.facebook"
                  type="text"
                  :placeholder="$t('profile.socialPlaceholder')"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="whatsapp" class="form-label">
                  <i class="pi pi-whatsapp"></i>
                  WhatsApp
                </label>
                <InputText
                  id="whatsapp"
                  v-model="formData.social.whatsapp"
                  type="tel"
                  :placeholder="$t('profile.phonePlaceholder')"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="website" class="form-label">
                  <i class="pi pi-globe"></i>
                  Website
                </label>
                <InputText
                  id="website"
                  v-model="formData.social.website"
                  type="url"
                  :placeholder="$t('profile.websitePlaceholder')"
                  class="form-input"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Action buttons -->
        <section class="form-actions">
          <Button
            type="button"
            :label="$t('common.cancel')"
            severity="secondary"
            @click="handleCancel"
            icon="pi pi-times"
          />
          <Button
            type="button"
            :label="$t('common.save')"
            @click="handleSave"
            :loading="isSaving"
            icon="pi pi-check"
          />
        </section>
      </div>
    </div>

    <!-- Avatar upload dialog -->
    <Dialog
      v-model:visible="showAvatarUpload"
      :header="$t('profile.uploadPhotoTitle')"
      modal
      :style="{ width: '90vw', maxWidth: '500px' }"
      @hide="resetAvatarUpload"
    >
      <div class="avatar-upload">
        <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
          <i class="pi pi-cloud-upload"></i>
          <p>{{ $t('profile.dragDropFiles') }}</p>
          <Button
            type="button"
            :label="$t('profile.selectFile')"
            @click="$refs.fileInput?.click()"
            icon="pi pi-folder-open"
          />
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileSelect"
          />
        </div>

        <div v-if="avatarPreview" class="preview-area">
          <img :src="avatarPreview" :alt="$t('profile.preview')" class="preview-image" />
          <div class="preview-actions">
            <Button
              type="button"
              :label="$t('common.cancel')"
              severity="secondary"
              @click="resetAvatarUpload"
            />
            <Button
              type="button"
              :label="$t('common.confirm')"
              @click="confirmAvatarUpload"
              :loading="isUploadingAvatar"
            />
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import ProgressSpinner from 'primevue/progressspinner';
import { RouterLink } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useHostProfile } from '@/profile-management/application/composables/useHostProfile.js';

const router = useRouter();
const toast = useToast();
const { user, userInitials, isLoading, loadProfile, updateProfile } = useHostProfile();

// Estado del formulario
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  preferences: [],
  social: {
    instagram: '',
    facebook: '',
    whatsapp: '',
    website: '',
  },
});

// Estado de validación
const errors = reactive({
  name: '',
  phone: '',
});

// Estados de UI
const isSaving = ref(false);
const showAvatarUpload = ref(false);
const isUploadingAvatar = ref(false);
const avatarPreview = ref(null);
const fileInput = ref(null);

// Preferencias disponibles (mock data)
const availablePreferences = ref([
  { id: 1, name: 'Bodas' },
  { id: 2, name: 'Corporativos' },
  { id: 3, name: 'Cumpleaños' },
  { id: 4, name: 'XV Años' },
  { id: 5, name: 'Graduaciones' },
  { id: 6, name: 'Baby Shower' },
  { id: 7, name: 'Aniversarios' },
]);

// Cargar datos iniciales
onMounted(async () => {
  await loadProfile();
  if (user.value) {
    formData.name = user.value.name || '';
    formData.email = user.value.email || '';
    formData.phone = user.value.phone || '';
    formData.location = user.value.location || '';
    formData.bio = user.value.bio || '';
    formData.preferences = user.value.preferences || [];
    if (user.value.social) {
      Object.assign(formData.social, user.value.social);
    }
  }
});

// Validación de campos
const validateField = (fieldName) => {
  errors[fieldName] = '';

  switch (fieldName) {
    case 'name':
      if (!formData.name || formData.name.trim().length < 3) {
        errors.name = 'El nombre debe tener al menos 3 caracteres';
      }
      break;
    case 'phone':
      if (formData.phone && !/^[\d\s+\-()]+$/.test(formData.phone)) {
        errors.phone = 'Formato de teléfono inválido';
      }
      break;
  }
};

// Validar todo el formulario
const validateForm = () => {
  let isValid = true;

  if (!formData.name || formData.name.trim().length < 3) {
    errors.name = 'El nombre es obligatorio y debe tener al menos 3 caracteres';
    isValid = false;
  }

  return isValid;
};

// Manejo de avatar
const handleDrop = (event) => {
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    handleFileSelect({ target: { files } });
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files?.[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result;
    };
    reader.readAsDataURL(file);
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Por favor selecciona una imagen válida',
      life: 3000,
    });
  }
};

const resetAvatarUpload = () => {
  avatarPreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const confirmAvatarUpload = async () => {
  // Aquí iría la lógica de upload de avatar
  // Por ahora solo lo simulamos
  isUploadingAvatar.value = true;
  try {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Avatar actualizado correctamente',
      life: 3000,
    });
    showAvatarUpload.value = false;
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el avatar',
      life: 3000,
    });
  } finally {
    isUploadingAvatar.value = false;
    resetAvatarUpload();
  }
};

// Guardar cambios
const handleSave = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'warning',
      summary: 'Validación',
      detail: 'Por favor completa los campos obligatorios',
      life: 3000,
    });
    return;
  }

  isSaving.value = true;
  try {
    await updateProfile({
      name: formData.name,
      phone: formData.phone,
      location: formData.location,
      bio: formData.bio,
      preferences: formData.preferences,
      social: formData.social,
    });

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Perfil actualizado correctamente',
      life: 3000,
    });

    // Redirigir al perfil después de guardar
    setTimeout(() => {
      router.push('/host/profile');
    }, 500);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el perfil',
      life: 3000,
    });
  } finally {
    isSaving.value = false;
  }
};

// Cancelar edición
const handleCancel = () => {
  if (formData.name !== user.value?.name ||
    formData.phone !== user.value?.phone ||
    formData.location !== user.value?.location) {
    const confirmed = window.confirm('¿Descartar cambios sin guardar?');
    if (confirmed) {
      router.push('/host/profile');
    }
  } else {
    router.push('/host/profile');
  }
};
</script>

<style scoped>
.profile-edit-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  background: linear-gradient(135deg, #3A506B 0%, #2a3d52 100%);
  color: #fff;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1000px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6FFFE9;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;
  transition: color 0.3s;
}

.back-link:hover {
  color: #fff;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-container p {
  color: #666;
  font-size: 0.95rem;
}

.edit-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1rem 2rem 1rem;
}

.edit-wrapper {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Avatar section */
.avatar-section {
  background: linear-gradient(135deg, #3A506B 0%, #2a3d52 100%);
  color: #fff;
  padding: 2rem;
  text-align: center;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.avatar-button {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #5BC0BE !important;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-button:hover {
  background-color: #fff !important;
  color: #5BC0BE;
}

.avatar-hint {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Form section */
.form-section {
  padding: 2rem;
}

.form-section h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.25rem;
  color: #3A506B;
  border-bottom: 2px solid #5BC0BE;
  padding-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #3A506B;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.required {
  color: #e74c3c;
  font-weight: bold;
}

.read-only-badge {
  display: inline-block;
  font-size: 0.7rem;
  background-color: #e8e8e8;
  color: #666;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: normal;
  margin-left: 0.5rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
}

.form-input:focus {
  border-color: #5BC0BE;
  box-shadow: 0 0 0 3px rgba(91, 192, 190, 0.1);
  outline: none;
}

.form-input:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.hint-text {
  color: #999;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

/* Preferences */
.preferences-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.preference-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.preference-label {
  font-size: 0.9rem;
  color: #3A506B;
  cursor: pointer;
  user-select: none;
}

/* Form divider */
.form-section-divider {
  margin: 2rem 0 1.5rem 0;
  padding-top: 2rem;
  border-top: 1px solid #e8e8e8;
}

.form-section-divider h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  color: #3A506B;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Form actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem 2rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e8e8e8;
}

.form-actions :deep(.p-button) {
  min-width: 120px;
}

/* Avatar upload dialog */
.avatar-upload {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-area {
  border: 2px dashed #5BC0BE;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background-color: #f0fffe;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  background-color: #e8fffe;
  border-color: #3A506B;
}

.upload-area i {
  font-size: 3rem;
  color: #5BC0BE;
  display: block;
  margin-bottom: 1rem;
}

.upload-area p {
  margin: 0 0 1rem 0;
  color: #666;
}

.preview-area {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  object-fit: contain;
}

.preview-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.preview-actions :deep(.p-button) {
  min-width: 120px;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .edit-container {
    padding: 0 0.75rem 1.5rem 0.75rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .avatar-section {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
    padding: 1rem;
  }

  .form-actions :deep(.p-button) {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .preferences-selector {
    grid-template-columns: 1fr;
  }
}
</style>
