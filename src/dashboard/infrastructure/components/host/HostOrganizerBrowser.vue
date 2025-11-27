<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import Rating from 'primevue/rating';

const props = defineProps({
  organizers: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  dataLoaded: {
    type: Boolean,
    default: false,
  },
  skeletonCount: {
    type: Number,
    default: 8,
  },
});

const emit = defineEmits(['view-profile']);

const { t } = useI18n();

const showEmptyState = computed(
  () => props.dataLoaded && !props.loading && props.organizers.length === 0,
);

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
    '#c4b5fd', // purple
    '#a7f3d0', // green
    '#fecaca', // red
    '#bfdbfe', // blue
    '#fde68a', // yellow
    '#f9a8d4', // pink
    '#d1d5db', // gray
  ];

  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};
</script>

<template>
  <section class="organizer-browser">
    <div
      v-if="props.loading"
      class="organizer-browser__grid organizer-browser__grid--loading"
    >
      <Skeleton
        v-for="index in props.skeletonCount"
        :key="`organizer-skeleton-${index}`"
        height="200px"
        borderRadius="12px"
      />
    </div>

    <div v-else-if="props.organizers.length" class="organizer-browser__grid">
      <Card
        v-for="organizer in props.organizers"
        :key="organizer.id"
        class="organizer-card"
      >
        <template #content>
          <div class="organizer-card__content">
            <Avatar
              :label="getInitials(organizer.name)"
              size="xlarge"
              shape="circle"
              :style="{
                backgroundColor: getAvatarColor(organizer.name),
                color: '#374151',
                fontSize: '1.5rem',
                fontWeight: '600'
              }"
              class="organizer-avatar"
            />

            <h3 class="organizer-name">{{ organizer.name }}</h3>
            <p class="organizer-specialty">{{ organizer.specialty }}</p>

            <div class="organizer-rating" v-if="organizer.rating">
              <Rating
                :modelValue="Number(organizer.rating)"
                :readonly="true"
                :cancel="false"
                class="custom-rating"
              />
            </div>

            <Button
              class="view-profile-btn"
              :label="t('dashboard.host.organizerBrowser.viewProfile')"
              @click="emit('view-profile', organizer)"
            />
          </div>
        </template>
      </Card>
    </div>

    <div v-else-if="showEmptyState" class="organizer-browser__empty">
      <i class="pi pi-users" />
      <p>{{ t('dashboard.host.organizerBrowser.empty') }}</p>
    </div>
  </section>
</template>

<style scoped>
.organizer-browser {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.organizer-browser__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.organizer-browser__grid--loading {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.organizer-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  background: #ffffff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.organizer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.organizer-card :deep(.p-card-body) {
  padding: 1.5rem 1rem;
}

.organizer-card :deep(.p-card-content) {
  padding: 0;
}

.organizer-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.organizer-avatar {
  margin-bottom: 0.5rem;
}

.organizer-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
}

.organizer-specialty {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.4;
}

.organizer-rating {
  margin: 0.25rem 0;
}

.custom-rating :deep(.p-rating-icon) {
  color: #fbbf24;
  font-size: 1rem;
}

.view-profile-btn {
  width: 100%;
  margin-top: 0.5rem;
  background: #3A506B;
  border: none;
  color: #ffffff;
  font-weight: 600;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.view-profile-btn:hover {
  background: #2d3f54;
}

.organizer-browser__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem 1.5rem;
  border-radius: 12px;
  background: #f9fafb;
  color: #6b7280;
  text-align: center;
}

.organizer-browser__empty i {
  font-size: 3rem;
  color: #9ca3af;
}

.organizer-browser__empty p {
  font-size: 1.1rem;
  margin: 0;
}

@media (max-width: 768px) {
  .organizer-browser__grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
}
</style>
