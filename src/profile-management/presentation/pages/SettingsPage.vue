<script setup>
import { ref } from 'vue'
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'

const { t } = useI18n()
const { user, updateUser } = useAuth()
const toast = useToast()

// Form data
const settings = ref({
  name: user?.name || '',
  email: user?.email || '',
  phone: user?.phone || '',
  emailNotifications: true,
  pushNotifications: true,
  twoFactor: false,
  profileVisibility: 'public',
  language: 'es',
  theme: 'light'
})

const handleSave = () => {
  updateUser({
    name: settings.value.name,
    phone: settings.value.phone
  })

  toast.add({
    severity: 'success',
    summary: t('settings.successUpdate'),
    life: 3000
  })
}

const handleExportData = () => {
  toast.add({
    severity: 'info',
    summary: 'Exportando datos',
    detail: 'Tu solicitud está siendo procesada',
    life: 3000
  })
}

const handleDeleteAccount = () => {
  toast.add({
    severity: 'warn',
    summary: 'Eliminar cuenta',
    detail: 'Esta acción requiere confirmación adicional',
    life: 5000
  })
}
</script>

<template>
  <div class="settings-page">
    <Toast />

    <!-- Header -->
    <div class="settings-header">
      <h1 class="settings-title">{{ $t('settings.title') }}</h1>
      <p class="settings-subtitle">{{ $t('settings.subtitle') }}</p>
    </div>

    <!-- Settings Container -->
    <div class="settings-container">

      <!-- Account Section -->
      <div class="settings-section">
        <h2 class="section-title">
          <i class="pi pi-user"></i>
          {{ $t('settings.account') }}
        </h2>

        <div class="form-grid">
          <div class="form-field">
            <label class="field-label">{{ $t('settings.accountName') }}</label>
            <InputText v-model="settings.name" class="w-full" />
          </div>

          <div class="form-field">
            <label class="field-label">{{ $t('settings.accountEmail') }}</label>
            <InputText v-model="settings.email" type="email" class="w-full" disabled />
          </div>

          <div class="form-field">
            <label class="field-label">{{ $t('settings.accountPhone') }}</label>
            <InputText v-model="settings.phone" class="w-full" />
          </div>
        </div>
      </div>

      <!-- Security Section -->
      <div class="settings-section">
        <h2 class="section-title">
          <i class="pi pi-shield"></i>
          {{ $t('settings.security') }}
        </h2>

        <div class="security-options">
          <div class="security-item">
            <div class="security-info">
              <h3>{{ $t('settings.changePassword') }}</h3>
              <p>Actualiza tu contraseña regularmente</p>
            </div>
            <Button
              label="Cambiar"
              icon="pi pi-lock"
              class="p-button-outlined p-button-sm"
            />
          </div>

          <div class="security-item">
            <div class="security-info">
              <h3>{{ $t('settings.twoFactor') }}</h3>
              <p>
                <span :class="settings.twoFactor ? 'status-enabled' : 'status-disabled'">
                  {{ settings.twoFactor ? $t('settings.enabled') : $t('settings.disabled') }}
                </span>
              </p>
            </div>
            <ToggleButton
              v-model="settings.twoFactor"
              onIcon="pi pi-check"
              offIcon="pi pi-times"
            />
          </div>
        </div>
      </div>

      <!-- Preferences Section -->
      <div class="settings-section">
        <h2 class="section-title">
          <i class="pi pi-cog"></i>
          {{ $t('settings.preferences') }}
        </h2>

        <div class="form-grid">
          <div class="form-field">
            <label class="field-label">{{ $t('settings.language') }}</label>
            <Dropdown
              v-model="settings.language"
              :options="[
                { label: 'Español', value: 'es' },
                { label: 'English', value: 'en' }
              ]"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>

          <div class="form-field">
            <label class="field-label">{{ $t('settings.theme') }}</label>
            <Dropdown
              v-model="settings.theme"
              :options="[
                { label: $t('settings.lightMode'), value: 'light' },
                { label: $t('settings.darkMode'), value: 'dark' }
              ]"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
        </div>

        <div class="notification-toggles">
          <div class="toggle-item">
            <div class="toggle-info">
              <h3>{{ $t('settings.emailNotifications') }}</h3>
              <p>Recibe actualizaciones por correo electrónico</p>
            </div>
            <ToggleButton
              v-model="settings.emailNotifications"
              onIcon="pi pi-check"
              offIcon="pi pi-times"
            />
          </div>

          <div class="toggle-item">
            <div class="toggle-info">
              <h3>{{ $t('settings.pushNotifications') }}</h3>
              <p>Recibe notificaciones en tiempo real</p>
            </div>
            <ToggleButton
              v-model="settings.pushNotifications"
              onIcon="pi pi-check"
              offIcon="pi pi-times"
            />
          </div>
        </div>
      </div>

      <!-- Privacy Section -->
      <div class="settings-section">
        <h2 class="section-title">
          <i class="pi pi-eye"></i>
          {{ $t('settings.privacy') }}
        </h2>

        <div class="form-field">
          <label class="field-label">{{ $t('settings.profileVisibility') }}</label>
          <div class="visibility-options">
            <div class="visibility-option">
              <input
                type="radio"
                id="public"
                value="public"
                v-model="settings.profileVisibility"
              />
              <label for="public" class="visibility-label">
                <i class="pi pi-globe"></i>
                <span>{{ $t('settings.public') }}</span>
              </label>
            </div>
            <div class="visibility-option">
              <input
                type="radio"
                id="private"
                value="private"
                v-model="settings.profileVisibility"
              />
              <label for="private" class="visibility-label">
                <i class="pi pi-lock"></i>
                <span>{{ $t('settings.private') }}</span>
              </label>
            </div>
          </div>
        </div>

        <Divider />

        <div class="danger-zone">
          <h3>Zona de peligro</h3>
          <div class="danger-actions">
            <Button
              :label="$t('settings.dataExport')"
              icon="pi pi-download"
              class="p-button-outlined p-button-secondary"
              @click="handleExportData"
            />
            <Button
              :label="$t('settings.deleteAccount')"
              icon="pi pi-trash"
              class="p-button-outlined p-button-danger"
              @click="handleDeleteAccount"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="settings-actions">
        <RouterLink to="/dashboard">
          <Button
            :label="$t('settings.cancel')"
            class="p-button-text p-button-secondary"
          />
        </RouterLink>
        <Button
          :label="$t('settings.save')"
          icon="pi pi-check"
          @click="handleSave"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Header */
.settings-header {
  margin-bottom: 2rem;
}

.settings-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1c2541;
  margin-bottom: 0.5rem;
}

.settings-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

/* Container */
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Settings Section */
.settings-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1c2541;
  margin-bottom: 1.5rem;
}

.section-title i {
  color: #5bc0be;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  color: #1c2541;
  font-size: 0.875rem;
}

/* Security Options */
.security-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.security-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1c2541;
  margin-bottom: 0.25rem;
}

.security-info p {
  font-size: 0.875rem;
  color: #6b7280;
}

.status-enabled {
  color: #10b981;
  font-weight: 600;
}

.status-disabled {
  color: #6b7280;
  font-weight: 600;
}

/* Notification Toggles */
.notification-toggles {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
}

.toggle-info h3 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1c2541;
  margin-bottom: 0.25rem;
}

.toggle-info p {
  font-size: 0.8125rem;
  color: #6b7280;
}

/* Visibility Options */
.visibility-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.visibility-option {
  position: relative;
}

.visibility-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.visibility-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.visibility-label i {
  font-size: 1.5rem;
  color: #6b7280;
}

.visibility-option input[type="radio"]:checked + .visibility-label {
  border-color: #5bc0be;
  background: #f0fdfa;
}

.visibility-option input[type="radio"]:checked + .visibility-label i {
  color: #5bc0be;
}

/* Danger Zone */
.danger-zone {
  margin-top: 1.5rem;
}

.danger-zone h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #ef4444;
  margin-bottom: 1rem;
}

.danger-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Settings Actions */
.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Responsive */
@media (max-width: 768px) {
  .settings-page {
    padding: 1rem;
  }

  .settings-section {
    padding: 1.5rem;
  }

  .security-item,
  .toggle-item {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .settings-actions {
    flex-direction: column-reverse;
  }

  .settings-actions button {
    width: 100%;
  }
}

/* PrimeVue deep selectors */
.settings-page :deep(.p-inputtext),
.settings-page :deep(.p-dropdown) {
  border-radius: 8px;
  border-color: #d1d5db;
}

.settings-page :deep(.p-inputtext:focus),
.settings-page :deep(.p-dropdown:focus) {
  border-color: #5bc0be;
  box-shadow: 0 0 0 3px rgba(91, 192, 190, 0.1);
}

.settings-page :deep(.p-button) {
  border-radius: 8px;
  font-weight: 600;
}

.settings-page :deep(.p-button:not(.p-button-outlined)) {
  background: #5bc0be;
  border-color: #5bc0be;
}

.settings-page :deep(.p-button:not(.p-button-outlined):hover) {
  background: #3a506b;
  border-color: #3a506b;
}

.settings-page :deep(.p-togglebutton.p-highlight) {
  background: #5bc0be;
  border-color: #5bc0be;
}
</style>
