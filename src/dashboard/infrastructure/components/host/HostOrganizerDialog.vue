<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import Rating from 'primevue/rating';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

const props = defineProps({
  organizer: {
    type: Object,
    default: null,
  },
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:visible', 'request-quote', 'send-message']);

const { t } = useI18n();
const router = useRouter();

const dialogHeader = computed(() => '');

const getInitials = (name) => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name) return '#9ca3af';
  const colors = [
    '#c4b5fd', '#a7f3d0', '#fecaca', '#bfdbfe',
    '#fde68a', '#f9a8d4', '#d1d5db'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const handleRequestQuote = () => {
  emit('update:visible', false);
  router.push({
    name: 'quotes-create',
    query: { organizerId: props.organizer?.id }
  });
};

const handleSendMessage = () => {
  emit('update:visible', false);
  router.push({
    name: 'messages',
    query: { organizerId: props.organizer?.id }
  });
};
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    :style="{ width: '720px', maxWidth: '95vw' }"
    :header="dialogHeader"
    @update:visible="(value) => emit('update:visible', value)"
    class="organizer-profile-dialog"
  >
    <template v-if="props.organizer">
      <div class="profile-dialog">
        <!-- Header Section -->
        <div class="profile-header">
          <Avatar
            :label="getInitials(props.organizer.name)"
            size="xlarge"
            shape="circle"
            :style="{
              backgroundColor: getAvatarColor(props.organizer.name),
              color: '#374151',
              fontSize: '2rem',
              fontWeight: '600',
              width: '80px',
              height: '80px'
            }"
          />
          <div class="profile-header__info">
            <h2>{{ props.organizer.name }}</h2>
            <p class="profile-specialty">{{ props.organizer.specialty }}</p>
            <div class="profile-rating">
              <Rating
                :modelValue="Number(props.organizer.rating || 0)"
                :readonly="true"
                :cancel="false"
                class="custom-rating"
              />
              <span class="rating-text">{{ props.organizer.location || 'Location not specified' }}</span>
            </div>
          </div>
          <div class="profile-actions">
            <Button
              :label="t('dashboard.host.organizerDialog.requestQuote')"
              class="action-btn action-btn--primary"
              @click="handleRequestQuote"
            />
            <Button
              :label="t('dashboard.host.organizerDialog.sendMessage')"
              outlined
              class="action-btn action-btn--outlined"
              @click="handleSendMessage"
            />
          </div>
        </div>

        <!-- Tabs Section -->
        <TabView class="profile-tabs">
          <TabPanel :header="t('dashboard.host.organizerDialog.tabs.information')">
            <div class="tab-content">
              <!-- About Section -->
              <div class="info-section" v-if="props.organizer.description">
                <h3>{{ t('dashboard.host.organizerDialog.aboutTitle', { name: props.organizer.name.split(' ')[0] }) }}</h3>
                <p class="info-text">{{ props.organizer.description }}</p>
              </div>

              <!-- Specialties Section -->
              <div class="info-section" v-if="props.organizer.eventTypes?.length">
                <h3>{{ t('dashboard.host.organizerDialog.specialties') }}</h3>
                <div class="specialties-grid">
                  <div
                    v-for="specialty in props.organizer.eventTypes"
                    :key="specialty"
                    class="specialty-chip"
                  >
                    {{ specialty }}
                  </div>
                </div>
              </div>

              <!-- Experience Section -->
              <div class="info-section" v-if="props.organizer.completedEvents">
                <h3>{{ t('dashboard.host.organizerDialog.experience') }}</h3>
                <div class="experience-item">
                  <div class="experience-header">
                    <h4>{{ t('dashboard.host.organizerDialog.eventifyOrganizer') }}</h4>
                    <span class="experience-period">{{ t('dashboard.host.organizerDialog.present') }}</span>
                  </div>
                  <p class="experience-description">
                    {{ t('dashboard.host.organizerDialog.experienceDescription', {
                    count: props.organizer.completedEvents
                  }) }}
                  </p>
                </div>
              </div>

              <!-- Certifications Section -->
              <div class="info-section" v-if="props.organizer.highlights?.length">
                <h3>{{ t('dashboard.host.organizerDialog.certifications') }}</h3>
                <ul class="certifications-list">
                  <li v-for="highlight in props.organizer.highlights" :key="highlight">
                    <i class="pi pi-check-circle" />
                    <span>{{ highlight }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabPanel>

          <TabPanel :header="t('dashboard.host.organizerDialog.tabs.services')">
            <div class="tab-content">
              <div class="info-section">
                <h3>{{ t('dashboard.host.organizerDialog.servicesOffered') }}</h3>
                <p class="info-text" v-if="!props.organizer.eventTypes?.length">
                  {{ t('dashboard.host.organizerDialog.noServices') }}
                </p>
                <ul class="services-list" v-else>
                  <li v-for="service in props.organizer.eventTypes" :key="service">
                    <i class="pi pi-check" />
                    <span>{{ service }}</span>
                  </li>
                </ul>
              </div>
              <div class="info-section" v-if="props.organizer.priceRange">
                <h3>{{ t('dashboard.host.organizerDialog.priceRange') }}</h3>
                <p class="price-range">{{ props.organizer.priceRange }}</p>
              </div>
            </div>
          </TabPanel>

          <TabPanel :header="t('dashboard.host.organizerDialog.tabs.albums')">
            <div class="tab-content">
              <div class="info-section">
                <p class="info-text">{{ t('dashboard.host.organizerDialog.noAlbums') }}</p>
              </div>
            </div>
          </TabPanel>

          <TabPanel :header="t('dashboard.host.organizerDialog.tabs.reviews')">
            <div class="tab-content">
              <div class="info-section">
                <h3>{{ t('dashboard.host.organizerDialog.featuredReviews') }}</h3>
                <div class="reviews-container">
                  <!-- Sample Review - En producción esto vendría de la DB -->
                  <div class="review-card" v-if="Number(props.organizer.rating) > 4">
                    <div class="review-header">
                      <Rating :modelValue="5" :readonly="true" :cancel="false" class="review-rating" />
                    </div>
                    <p class="review-text">
                      {{ t('dashboard.host.organizerDialog.sampleReview') }}
                    </p>
                    <p class="review-author">
                      — {{ t('dashboard.host.organizerDialog.verifiedClient') }}
                    </p>
                  </div>
                  <p class="info-text" v-else>
                    {{ t('dashboard.host.organizerDialog.noReviews') }}
                  </p>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.organizer-profile-dialog :deep(.p-dialog-header) {
  padding: 0;
  border-bottom: none;
}

.organizer-profile-dialog :deep(.p-dialog-content) {
  padding: 0;
}

.profile-dialog {
  display: flex;
  flex-direction: column;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e5e7eb;
}

.profile-header__info {
  flex: 1;
}

.profile-header__info h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.profile-specialty {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: #3A506B;
  font-weight: 600;
}

.profile-rating {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.custom-rating :deep(.p-rating-icon) {
  color: #fbbf24;
  font-size: 1.1rem;
}

.rating-text {
  color: #6b7280;
  font-size: 0.95rem;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 160px;
}

.action-btn {
  width: 100%;
  padding: 0.65rem 1.25rem;
  font-weight: 600;
  border-radius: 8px;
  justify-content: center;
}

.action-btn--primary {
  background: #3A506B;
  border: none;
  color: #ffffff;
}

.action-btn--primary:hover {
  background: #2d3f54;
}

.action-btn--outlined {
  border-color: #3A506B;
  color: #3A506B;
}

.action-btn--outlined:hover {
  background: #f3f4f6;
}

.profile-tabs {
  padding: 0;
}

.profile-tabs :deep(.p-tabview-nav) {
  background: #ffffff;
  border-bottom: 2px solid #e5e7eb;
  padding: 0 2rem;
}

.profile-tabs :deep(.p-tabview-nav-link) {
  padding: 1rem 1.5rem;
  color: #6b7280;
  font-weight: 500;
  border: none;
  background: transparent;
}

.profile-tabs :deep(.p-tabview-nav-link:hover) {
  color: #111827;
  background: transparent;
}

.profile-tabs :deep(.p-highlight .p-tabview-nav-link) {
  color: #3A506B;
  border-bottom: 2px solid #3A506B;
}

.profile-tabs :deep(.p-tabview-panels) {
  background: #ffffff;
  padding: 0;
}

.tab-content {
  padding: 2rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.info-section h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.info-text {
  margin: 0;
  line-height: 1.6;
  color: #4b5563;
}

.specialties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

.specialty-chip {
  background: #f3f4f6;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  text-align: center;
}

.experience-item {
  background: #f9fafb;
  padding: 1.25rem;
  border-radius: 10px;
  border-left: 3px solid #3A506B;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.experience-period {
  color: #6b7280;
  font-size: 0.9rem;
}

.experience-description {
  margin: 0;
  color: #4b5563;
  line-height: 1.5;
}

.certifications-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.certifications-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4b5563;
}

.certifications-list i {
  color: #5BC0BE;
  font-size: 1.1rem;
}

.services-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.services-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4b5563;
  font-size: 1rem;
}

.services-list i {
  color: #3A506B;
}

.price-range {
  font-size: 1.25rem;
  font-weight: 600;
  color: #3A506B;
  margin: 0.5rem 0 0 0;
}

.reviews-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 3px solid #fbbf24;
}

.review-header {
  margin-bottom: 0.75rem;
}

.review-rating :deep(.p-rating-icon) {
  color: #fbbf24;
  font-size: 1rem;
}

.review-text {
  margin: 0 0 1rem 0;
  line-height: 1.6;
  color: #374151;
  font-style: italic;
}

.review-author {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    padding: 1.5rem;
  }

  .profile-actions {
    width: 100%;
    flex-direction: row;
  }

  .tab-content {
    padding: 1.5rem;
  }

  .specialties-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .profile-tabs :deep(.p-tabview-nav) {
    padding: 0 1rem;
  }
}
</style>
