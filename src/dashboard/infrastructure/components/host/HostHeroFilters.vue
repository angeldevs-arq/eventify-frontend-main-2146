<script setup>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const props = defineProps({
  searchTerm: {
    type: String,
    default: '',
  },
  selectedCategory: {
    type: String,
    default: 'all',
  },
  categories: {
    type: Array,
    default: () => [],
  },
  selectedClassification: {
    type: String,
    default: 'all',
  },
  classifications: {
    type: Array,
    default: () => ['all', 'premium', 'verified', 'new'],
  },
});

const emit = defineEmits([
  'update:searchTerm',
  'update:selectedCategory',
  'update:selectedClassification',
]);

const { t } = useI18n();

const categoryOptions = computed(() =>
  props.categories.map((category) => ({
    label:
      category === 'all'
        ? t('dashboard.host.filters.allTypes')
        : category,
    value: category,
  })),
);

const classificationOptions = computed(() =>
  props.classifications.map((classification) => ({
    label:
      classification === 'all'
        ? t('dashboard.host.filters.allClassifications')
        : t(`dashboard.host.filters.classifications.${classification}`),
    value: classification,
  })),
);
</script>

<template>
  <div class="host-hero">
    <div class="host-hero__header">
      <h1>{{ t('dashboard.host.hero.mainTitle') }}</h1>
    </div>

    <div class="host-hero__filters-row">
      <span class="p-input-icon-left host-hero__search">
        <i class="pi pi-search" />
        <InputText
          :modelValue="props.searchTerm"
          :placeholder="t('dashboard.host.hero.searchPlaceholder')"
          @update:modelValue="(value) => emit('update:searchTerm', value)"
          class="search-input"
        />
      </span>

      <Button
        class="filter-btn"
        outlined
        icon="pi pi-sliders-h"
        :label="t('dashboard.host.hero.filters')"
      />

      <Dropdown
        :modelValue="props.selectedCategory"
        :options="categoryOptions"
        optionLabel="label"
        optionValue="value"
        :placeholder="t('dashboard.host.hero.typeOfEvent')"
        @update:modelValue="(value) => emit('update:selectedCategory', value)"
        class="filter-dropdown"
      />

      <Dropdown
        :modelValue="props.selectedClassification"
        :options="classificationOptions"
        optionLabel="label"
        optionValue="value"
        :placeholder="t('dashboard.host.hero.classification')"
        @update:modelValue="(value) => emit('update:selectedClassification', value)"
        class="filter-dropdown"
      />
    </div>
  </div>
</template>

<style scoped>
.host-hero {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.host-hero__header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #111827;
  text-align: center;
}

.host-hero__filters-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.host-hero__search {
  flex: 1 1 300px;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
}

.search-input:focus {
  border-color: #3A506B;
  box-shadow: 0 0 0 1px #3A506B;
}

.filter-btn {
  border-color: #d1d5db;
  color: #374151;
  background: #ffffff;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
}

.filter-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.filter-dropdown {
  min-width: 180px;
  border-radius: 8px;
}

.filter-dropdown :deep(.p-dropdown) {
  border-color: #d1d5db;
  border-radius: 8px;
}

.filter-dropdown :deep(.p-dropdown:not(.p-disabled):hover) {
  border-color: #9ca3af;
}

.filter-dropdown :deep(.p-dropdown:not(.p-disabled).p-focus) {
  border-color: #3A506B;
  box-shadow: 0 0 0 1px #3A506B;
}

@media (max-width: 768px) {
  .host-hero__header h1 {
    font-size: 1.5rem;
  }

  .host-hero__filters-row {
    flex-direction: column;
  }

  .host-hero__search,
  .filter-btn,
  .filter-dropdown {
    width: 100%;
  }
}
</style>
