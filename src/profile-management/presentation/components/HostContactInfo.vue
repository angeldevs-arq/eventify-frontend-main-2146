<!-- HostContactInfo.vue -->
<!-- src/profile-management/infrastructure/components/host/HostContactInfo.vue -->

<template>
  <section class="contact-info">
    <h2 class="section-title">{{ $t('host-profile.sections.contactInfo') }}</h2>

    <div class="info-grid">
      <!-- Email -->
      <div class="info-item">
        <span class="info-label">{{ $t('host-profile.labels.email') }}</span>
        <p class="info-value">{{ user?.email || '-' }}</p>
      </div>



      <!-- Ubicación -->
      <div class="info-item">
        <span class="info-label">{{ $t('host-profile.labels.city') }}</span>
        <p class="info-value">{{ user.street+' '+user.number+', '+ user.postalCode + ' - ' +user.city + ', ' + user.country || 'Lima, Lima' }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    default: null,
  },
});
</script>

<style scoped>
.contact-info {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #3A506B;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
}

.info-value {
  margin: 0;
  font-size: 0.95rem;
  color: #3A506B;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .contact-info {
    padding: 1rem;
    margin-bottom: 1rem;
  }
}
</style>
