<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  activeItem: {
    type: String,
    default: 'search-organizers',
  },
});

const emit = defineEmits(['select']);

const { t } = useI18n();

const navigationItems = computed(() => [
  {
    id: 'search-organizers',
    icon: 'pi pi-search',
    label: t('dashboard.host.sidebar.searchOrganizers'),
  },
  {
    id: 'my-events',
    icon: 'pi pi-calendar',
    label: t('dashboard.host.sidebar.myEvents'),
  },
  {
    id: 'quotes',
    icon: 'pi pi-file-edit',
    label: t('dashboard.host.sidebar.quotes'),
  },
  {
    id: 'messages',
    icon: 'pi pi-comments',
    label: t('dashboard.host.sidebar.messages'),
  },
  {
    id: 'reviews',
    icon: 'pi pi-star',
    label: t('dashboard.host.sidebar.reviews'),
  },
  {
    id: 'profile',
    icon: 'pi pi-user',
    label: t('dashboard.host.sidebar.profile'),
  },
  {
    id: 'settings',
    icon: 'pi pi-cog',
    label: t('dashboard.host.sidebar.settings'),
  },
]);

const handleSelect = (itemId) => {
  emit('select', itemId);
};
</script>

<template>
  <aside class="host-sidebar">
    <div class="host-sidebar__brand">
      <i class="pi pi-calendar-plus brand-icon"></i>
      <span>eventify</span>
    </div>
    <nav class="host-sidebar__nav">
      <button
        v-for="item in navigationItems"
        :key="item.id"
        class="host-sidebar__item"
        :class="{ 'host-sidebar__item--active': props.activeItem === item.id }"
        type="button"
        @click="handleSelect(item.id)"
      >
        <i :class="item.icon" />
        <span>{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.host-sidebar {
  width: 200px;
  background: #f3f4f6;
  color: #374151;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  height: fit-content;
  border-radius: 0;
}

.host-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #3A506B;
}

.brand-icon {
  font-size: 1.5rem;
  color: #5BC0BE;
}

.host-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.host-sidebar__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  text-align: left;
}

.host-sidebar__item i {
  font-size: 1rem;
  width: 20px;
}

.host-sidebar__item:hover {
  background: #e5e7eb;
  color: #111827;
}

.host-sidebar__item--active {
  background: #3A506B;
  color: #ffffff;
}

.host-sidebar__item--active:hover {
  background: #2d3f54;
}

@media (max-width: 1024px) {
  .host-sidebar {
    display: none;
  }
}
</style>
