<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Logo -->
      <div class="text-center mb-6">
        <img src="@/assets/img/eventify_logo.png" alt="eventify" class="logo" />
        <h1 class="text-2xl font-bold text-gray-800 mt-4">{{ $t('auth.registerTitle') }}</h1>
        <p class="text-gray-600 text-sm mt-2">{{ $t('auth.registerSubtitle') }}</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <!-- Nombre -->
        <div class="form-group">
          <label for="name" class="form-label">{{ $t('auth.fullName') }}</label>
          <InputText
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="Tu nombre completo"
            class="w-full"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email" class="form-label">{{ $t('auth.email') }}</label>
          <InputText
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="tu@email.com"
            class="w-full"
            :disabled="isLoading"
            required
          />
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label for="password" class="form-label">{{ $t('auth.password') }}</label>
          <Password
            id="password"
            v-model="formData.password"
            :placeholder="$t('auth.securePassword')"
            class="w-full"
            :disabled="isLoading"
            toggle-mask
            required
          />
          <small class="text-gray-500 mt-1">{{ $t('auth.minChars') }}</small>
        </div>

        <!-- Confirmar Contraseña -->
        <div class="form-group">
          <label for="confirmPassword" class="form-label">{{ $t('auth.confirmPassword') }}</label>
          <Password
            id="confirmPassword"
            v-model="formData.confirmPassword"
            placeholder="Confirma tu contraseña"
            class="w-full"
            :disabled="isLoading"
            toggle-mask
            required
          />
        </div>

        <!-- Tipo de usuario -->
        <div class="form-group">
          <label for="role" class="form-label">{{ $t('auth.roleQuestion') }}</label>
          <Dropdown
            id="role"
            v-model="formData.role"
            :options="roleOptions"
            option-label="label"
            option-value="value"
            :placeholder="$t('auth.roleQuestion')"
            class="w-full"
            :disabled="isLoading"
          />
        </div>

        <!-- Términos y condiciones -->
        <div class="flex items-start">
          <Checkbox v-model="formData.agreeTerms" input-id="terms" />
          <label for="terms" class="ml-2 text-xs text-gray-600 cursor-pointer">
            {{ $t('auth.agreeTerms') }}
            <router-link to="/terms" class="text-blue-600 hover:underline">{{ $t('auth.terms') }}</router-link>
            y la
            <router-link to="/privacy" class="text-blue-600 hover:underline">{{ $t('auth.privacyPolicy') }}</router-link>
          </label>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {{ error }}
        </div>

        <!-- Botón de registro -->
        <Button
          type="submit"
          :label="$t('auth.registerButton')"
          class="w-full"
          :loading="isLoading"
          icon="pi pi-user-plus"
        />
      </form>

      <!-- Enlace a login -->
      <div class="text-center mt-6">
        <p class="text-gray-600 text-sm">
          {{ $t('auth.alreadyAccount') }}
          <router-link to="/login" class="text-blue-600 hover:underline font-semibold">
            {{ $t('auth.loginHere') }}
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

const router = useRouter();
const { register, isLoading, error } = useAuth();
const { t } = useI18n();

const roleOptions = computed(() => [
  { label: t('auth.roleHost'), value: 'host' },
  { label: t('auth.roleOrganizer'), value: 'organizer' },
]);

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'host',
  agreeTerms: false,
});

const handleRegister = async () => {
  // Validaciones
  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = t('auth.errorPasswordMismatch');
    return;
  }

  if (formData.value.password.length < 8) {
    error.value = t('auth.errorPasswordLength');
    return;
  }

  if (!formData.value.agreeTerms) {
    error.value = t('auth.errorAcceptTerms');
    return;
  }

  try {
    await register({
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
      role: formData.value.role,
    });
    router.push('/dashboard');
  } catch (err) {
    console.error('Error al registrar:', err);
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 450px;
}

.logo {
  max-width: 80px;
  height: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

:deep(.p-inputtext),
:deep(.p-password),
:deep(.p-dropdown) {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 0.875rem;
}

:deep(.p-inputtext:focus),
:deep(.p-password:focus),
:deep(.p-dropdown:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.1);
}

:deep(.p-button) {
  background-color: #667eea;
  border: none;
  border-radius: 6px;
  padding: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

:deep(.p-button:hover) {
  background-color: #5568d3;
}

:deep(.p-button:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

small {
  display: block;
  font-size: 0.75rem;
}

@media (max-width: 640px) {
  .register-card {
    padding: 1.5rem;
  }

  .register-container {
    padding: 1rem;
  }
}
</style>
