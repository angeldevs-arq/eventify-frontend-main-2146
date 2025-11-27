<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/auth-management/infrastructure/composables/useAuth.js";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";

const { t } = useI18n();
const router = useRouter();
const toast = useToast();

const { login, user, isAuthenticated } = useAuth();

const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const errorMessage = ref("");

const isLoading = ref(false);

// 🔥 FUNCIÓN DE LOGIN CORRECTA
const handleSubmit = async () => {
  errorMessage.value = "";
  isLoading.value = true;

  try {
    await login(
      email.value,
      password.value,
      rememberMe.value ? "local" : "session"
    );

    // Esperar a que Pinia actualice el usuario
    const role = user.value?.role;

    if (!role) {
      throw new Error("No se pudo obtener el rol del usuario");
    }

    // 🔥 Redirección correcta según rol
    if (role === "host") {
      router.push("/host/dashboard");
    } else if (role === "organizer") {
      router.push("/organizer/dashboard");
    }

    toast.add({
      severity: "success",
      summary: t("auth.successLogin"),
      detail: t("auth.welcomeBack", { name: user.value?.name }),
    });

  } catch (error) {
    errorMessage.value = error.message || t("auth.errorInvalidCredentials");
    toast.add({
      severity: "error",
      summary: t("common.error"),
      detail: errorMessage.value,
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <Toast />

    <div class="auth-card">
      <!-- Logo -->
      <div class="auth-logo">
        <img src="/src/assets/img/eventify_logo.png" alt="eventify" />
      </div>

      <!-- Header -->
      <div class="auth-header">
        <h1 class="auth-title">{{ $t("auth.loginTitle") }}</h1>
        <p class="auth-subtitle">{{ $t("auth.loginSubtitle") }}</p>
      </div>

      <!-- Mensaje de error global -->
      <Message v-if="errorMessage" severity="error" :closable="false" class="mb-4">
        {{ errorMessage }}
      </Message>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- Email -->
        <div class="form-field">
          <label for="email" class="form-label">{{ $t("auth.email") }}</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            :placeholder="$t('auth.emailPlaceholder')"
            required
            autocomplete="email"
            class="w-full"
            :disabled="isLoading"
          />
        </div>

        <!-- Password -->
        <div class="form-field">
          <label for="password" class="form-label">{{ $t("auth.password") }}</label>
          <Password
            id="password"
            v-model="password"
            :placeholder="$t('auth.passwordPlaceholder')"
            :feedback="false"
            toggleMask
            required
            autocomplete="current-password"
            class="w-full"
            :disabled="isLoading"
          />
        </div>

        <!-- Remember me -->
        <div class="form-options">
          <div class="remember-me">
            <Checkbox
              v-model="rememberMe"
              inputId="remember"
              :binary="true"
              :disabled="isLoading"
            />
            <label for="remember">{{ $t("auth.rememberMe") }}</label>
          </div>

          <RouterLink to="/forgot-password" class="forgot-link">
            {{ $t("auth.forgotPassword") }}
          </RouterLink>
        </div>

        <!-- Submit -->
        <Button
          type="submit"
          :label="$t('auth.loginButton')"
          class="w-full submit-btn"
          :loading="isLoading"
          :disabled="isLoading"
          icon="pi pi-sign-in"
        />
      </form>

      <!-- Register Link -->
      <div class="auth-footer">
        <span>{{ $t("auth.noAccount") }}</span>
        <RouterLink to="/register" class="register-link">
          {{ $t("auth.registerHere") }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Container principal */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3a506b 0%, #1c2541 100%);
  padding: 2rem;
}

/* Card del formulario */
.auth-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem;
  max-width: 480px;
  width: 100%;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo */
.auth-logo {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo img {
  width: 120px;
  height: auto;
}

/* Header */
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1c2541;
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -0.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remember-me label {
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.forgot-link {
  font-size: 0.875rem;
  color: #3a506b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #5bc0be;
}

/* Submit Button */
.submit-btn {
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #3a506b 0%, #5bc0be 100%) !important;
  border: none !important;
  padding: 0.875rem !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(91, 192, 190, 0.3) !important;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Footer */
.auth-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
}

.register-link {
  color: #3a506b;
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #5bc0be;
}

/* PrimeVue Overrides */
:deep(.p-inputtext),
:deep(.p-password-input) {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.9375rem;
  transition: all 0.3s ease;
}

:deep(.p-inputtext:enabled:focus),
:deep(.p-password:not(.p-disabled).p-focus .p-password-input) {
  border-color: #5bc0be;
  box-shadow: 0 0 0 0.2rem rgba(91, 192, 190, 0.15);
}

:deep(.p-inputtext:disabled),
:deep(.p-password-input:disabled) {
  background-color: #f9fafb;
  color: #9ca3af;
}

:deep(.p-checkbox .p-checkbox-box) {
  border: 2px solid #e5e7eb;
  border-radius: 4px;
  transition: all 0.3s ease;
}

:deep(.p-checkbox .p-checkbox-box.p-highlight) {
  border-color: #5bc0be;
  background: #5bc0be;
}

:deep(.p-message) {
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 640px) {
  .auth-container {
    padding: 1rem;
  }

  .auth-card {
    padding: 2rem 1.5rem;
  }

  .auth-title {
    font-size: 1.75rem;
  }

  .auth-logo img {
    width: 100px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
