<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo -->
      <div class="text-center mb-6">
        <img src="@/assets/img/eventify_logo.png" alt="eventify" class="logo" />
        <h1 class="text-2xl font-bold text-gray-800 mt-4">{{ $t('auth.loginTitle') }}</h1>
        <p class="text-gray-600 text-sm mt-2">{{ $t('auth.loginSubtitle') }}</p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" class="space-y-4">
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
            :placeholder="$t('auth.password')"
            class="w-full"
            :disabled="isLoading"
            toggle-mask
            required
          />
        </div>

        <!-- Recuérdame -->
        <div class="flex items-center">
          <Checkbox v-model="formData.rememberMe" input-id="remember" />
          <label for="remember" class="ml-2 text-sm text-gray-600 cursor-pointer">
            {{ $t('auth.rememberMe') }}
          </label>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {{ error }}
        </div>

        <!-- Botón de login -->
        <Button
          type="submit"
          :label="$t('auth.loginButton')"
          class="w-full"
          :loading="isLoading"
          icon="pi pi-sign-in"
        />
      </form>

      <!-- Enlace a registro -->
      <div class="text-center mt-6">
        <p class="text-gray-600 text-sm">
          {{ $t('auth.noAccount') }}
          <router-link to="/register" class="text-blue-600 hover:underline font-semibold">
            {{ $t('auth.registerHere') }}
          </router-link>
        </p>
      </div>

      <!-- Enlace de recuperación -->
      <div class="text-center mt-2">
        <router-link to="/forgot-password" class="text-gray-500 hover:text-gray-700 text-xs">
          {{ $t('auth.forgotPassword') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

const router = useRouter();
const { login, isLoading, error } = useAuth();

const formData = ref({
  email: '',
  password: '',
  rememberMe: false,
});

const handleLogin = async () => {
  try {
    await login(formData.value.email, formData.value.password, {
      remember: formData.value.rememberMe,
    });
    router.push('/dashboard');
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
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
:deep(.p-password) {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 0.875rem;
}

:deep(.p-inputtext:focus),
:deep(.p-password:focus) {
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

@media (max-width: 640px) {
  .login-card {
    padding: 1.5rem;
  }

  .login-container {
    padding: 1rem;
  }
}
</style>
