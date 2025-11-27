<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="page-not-found">
    <div class="error-container">
      <div class="error-icon">
        <i class="pi pi-exclamation-triangle"></i>
      </div>

      <h1 class="error-title">404</h1>
      <h2 class="error-subtitle">{{ $t('errors.pageNotFound') }}</h2>
      <p class="error-description">{{ $t('errors.pageNotFoundDescription') }}</p>

      <div class="error-actions">
        <Button
          :label="$t('common.goHome')"
          icon="pi pi-home"
          @click="goHome"
          class="primary-btn"
        />
        <Button
          :label="$t('common.goBack')"
          icon="pi pi-arrow-left"
          @click="goBack"
          class="secondary-btn"
          outlined
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
}

.error-container {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.error-icon {
  margin-bottom: 2rem;
}

.error-icon i {
  font-size: 4rem;
  color: #3a506b;
}

.error-title {
  font-size: 6rem;
  font-weight: 700;
  color: #1c2541;
  margin: 0;
  line-height: 1;
}

.error-subtitle {
  font-size: 1.5rem;
  color: #3a506b;
  margin: 1rem 0;
  font-weight: 600;
}

.error-description {
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-btn {
  background: #5bc0be !important;
  border-color: #5bc0be !important;
  color: white !important;
  padding: 0.75rem 1.5rem !important;
  font-weight: 500 !important;
}

.primary-btn:hover {
  background: #4a9a97 !important;
  border-color: #4a9a97 !important;
}

.secondary-btn {
  color: #3a506b !important;
  border-color: #3a506b !important;
  padding: 0.75rem 1.5rem !important;
  font-weight: 500 !important;
}

.secondary-btn:hover {
  background: #3a506b !important;
  color: white !important;
}

/* Responsive */
@media (max-width: 768px) {
  .error-title {
    font-size: 4rem;
  }

  .error-subtitle {
    font-size: 1.25rem;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .primary-btn,
  .secondary-btn {
    width: 200px;
  }
}
</style>
