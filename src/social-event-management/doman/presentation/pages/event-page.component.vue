<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';
import ProgressSpinner from 'primevue/progressspinner';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

// Local Components
import EventCard from '../../presentation/components/event-card.component.vue';

// Services
import EventService from '../../../../social-event-management/application/services/event.service.js';

import { useAuth } from '/src/auth-management/infrastructure/composables/useAuth.js'
import { QuoteApiService } from '@/quote-management/application/services/quote-api.service.js'
import QuoteCard from '@/quote-management/presentation/components/quote-card.component.vue'

// Composables
const router = useRouter();
const { t } = useI18n();
const { user, restoreSession } = useAuth();

const currentUserId = computed(() => {
  const value = user.value?.id;
  return value != null ? String(value) : null;
});

// Reactive State
const events = ref([]);
const quotes = ref([]);
const selectedEvents = ref([]);
const selectAll = ref(false);
const searchQuery = ref('');
const selectedFilter = ref('all');
const selectedSort = ref('recent');
const currentPage = ref(1);
const pageSize = ref(5);
const showDeleteConfirmation = ref(false);
const loading = ref(false);
const activeTab = ref(0); // 0 = Events, 1 = Quotes

// Filter Options
const filterOptions = computed(() => [
  { label: t('eventManagement.filters.all'), value: 'all' },
  { label: t('eventManagement.filters.active'), value: 'active' },
  { label: t('eventManagement.filters.pending'), value: 'pending' },
  { label: t('eventManagement.filters.cancelled'), value: 'cancelled' }
]);

// Sort Options
const sortOptions = computed(() => [
  { label: t('eventManagement.sort.recent'), value: 'recent' },
  { label: t('eventManagement.sort.oldest'), value: 'oldest' },
  { label: t('eventManagement.sort.title'), value: 'title' }
]);

// Computed Properties para Events
const filteredEvents = computed(() => {
  let filtered = [...events.value];

  // Search Filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(event =>
      event.title.toLowerCase().includes(query) ||
      event.customerName.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  }

  // Status Filter
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(event =>
      event.status.toLowerCase() === selectedFilter.value
    );
  }

  // Sorting
  if (selectedSort.value === 'recent') {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (selectedSort.value === 'oldest') {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (selectedSort.value === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  }

  // Pagination
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filtered.slice(startIndex, endIndex);
});

// Computed Properties para Quotes (solo APPROVED)
const approvedQuotes = computed(() => {
  let filtered = quotes.value.filter(quote =>
    quote.state === 'APPROVED'
  );

  // Search Filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(quote =>
      quote.customer?.name?.toLowerCase().includes(query) ||
      quote.event?.type?.toLowerCase().includes(query) ||
      quote.event?.location?.toLowerCase().includes(query)
    );
  }

  // Sorting
  if (selectedSort.value === 'recent') {
    filtered.sort((a, b) => new Date(b.event?.date || b.createdAt) - new Date(a.event?.date || a.createdAt));
  } else if (selectedSort.value === 'oldest') {
    filtered.sort((a, b) => new Date(a.event?.date || a.createdAt) - new Date(b.event?.date || b.createdAt));
  } else if (selectedSort.value === 'title') {
    filtered.sort((a, b) =>
      (a.customer?.name || '').localeCompare(b.customer?.name || '')
    );
  }

  // Pagination
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filtered.slice(startIndex, endIndex);
});

const totalEvents = computed(() => events.value.length);
const totalQuotes = computed(() => quotes.value.filter(q => q.state === 'APPROVED').length);

const currentTotal = computed(() => activeTab.value === 0 ? totalEvents.value : totalQuotes.value);

const totalPages = computed(() => Math.ceil(currentTotal.value / pageSize.value));
const startItem = computed(() => {
  if (currentTotal.value === 0) return 0;
  return (currentPage.value - 1) * pageSize.value + 1;
});
const endItem = computed(() => {
  if (currentTotal.value === 0) return 0;
  return Math.min(currentPage.value * pageSize.value, currentTotal.value);
});

// Methods
const fetchEvents = async () => {
  loading.value = true;
  try {
    if (!user.value) {
      await restoreSession();
    }

    const userId = currentUserId.value;
    const response = await EventService.getEventsByUser(userId);
    const data = Array.isArray(response.data) ? response.data : [];

    if (!userId) {
      events.value = [];
      return;
    }

    events.value = data.filter((event) => {
      const ownerId = event.userId != null ? String(event.userId) : null;
      return ownerId === userId;
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    events.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchQuotes = async () => {
  loading.value = true;
  try {
    if (!user.value) {
      await restoreSession();
    }

    const userId = currentUserId.value;
    if (!userId) {
      quotes.value = [];
      return;
    }

    // Obtener todas las cotizaciones
    const allQuotes = await QuoteApiService.getAll();

    // Filtrar por usuario (organizador)
    quotes.value = allQuotes.filter((quote) => {
      const ownerId = quote.ownerId != null ? String(quote.ownerId) : null;
      const organizerId = quote.organizer?.id != null ? String(quote.organizer.id) : null;
      return ownerId === userId || organizerId === userId;
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    quotes.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchData = async () => {
  await Promise.all([fetchEvents(), fetchQuotes()]);
};

const isSelected = (eventId) => {
  return selectedEvents.value.includes(eventId);
};

const toggleEventSelection = (eventId) => {
  const index = selectedEvents.value.indexOf(eventId);
  if (index === -1) {
    selectedEvents.value.push(eventId);
  } else {
    selectedEvents.value.splice(index, 1);
  }
  selectAll.value = selectedEvents.value.length === events.value.length;
};

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedEvents.value = events.value.map(event => event.id);
  } else {
    selectedEvents.value = [];
  }
};

const deleteSelectedEvents = async () => {
  loading.value = true;
  try {
    await EventService.deleteMultipleEvents(selectedEvents.value);
    selectedEvents.value = [];
    showDeleteConfirmation.value = false;
    await fetchEvents();
  } catch (error) {
    console.error('Error deleting events:', error);
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event) => {
  currentPage.value = event.page + 1;
};

const onTabChange = (event) => {
  activeTab.value = event.index;
  currentPage.value = 1; // Reset pagination
  searchQuery.value = ''; // Reset search
  selectedEvents.value = []; // Clear selections
};

const navigateToCreateEvent = () => {
  router.push('/events/create');
};

const navigateToEditEvent = (eventId) => {
  router.push(`/events/${eventId}/edit`);
};

const viewQuoteDetails = (quoteId) => {
  router.push(`/quotes/${quoteId}`);
};

const createEventFromQuote = (quote) => {
  // Navegar a crear evento con datos prellenados de la cotización
  router.push({
    name: 'event-create',
    query: {
      fromQuote: quote.id,
      customerName: quote.customer?.name,
      eventType: quote.event?.type,
      eventDate: quote.event?.date,
      location: quote.event?.location,
      guests: quote.event?.numberOfGuests
    }
  });
};

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="event-management-container">
    <!-- Header Section -->
    <header class="page-header">
      <h1 class="page-title">{{ $t('eventManagement.pageTitle') }}</h1>
    </header>

    <!-- Tabs -->
    <TabView :activeIndex="activeTab" @tab-change="onTabChange" class="custom-tabview">
      <!-- TAB: Events -->
      <TabPanel :header="$t('eventManagement.tabs.events') || 'Eventos'">
        <!-- Actions Bar -->
        <section class="actions-section">
          <!-- Selection Bar (visible when items are selected) -->
          <div v-if="selectedEvents.length > 0" class="selection-bar">
            <Checkbox
              v-model="selectAll"
              :binary="true"
              @change="toggleSelectAll"
            />
            <span class="selection-text">
              {{ $t('eventManagement.actions.selectAll') }}
            </span>
            <Button
              :label="$t('eventManagement.actions.deleteSelected', { count: selectedEvents.length })"
              icon="pi pi-trash"
              severity="danger"
              @click="showDeleteConfirmation = true"
              class="delete-selected-btn"
            />
          </div>

          <!-- Search and Filter Bar (visible when no items selected) -->
          <div v-else class="search-filter-bar">
            <IconField iconPosition="left" class="search-field">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="searchQuery"
                :placeholder="$t('eventManagement.actions.search')"
              />
            </IconField>

            <div class="filters-group">
              <Dropdown
                v-model="selectedFilter"
                :options="filterOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('eventManagement.filters.all')"
                class="filter-dropdown"
              />

              <Dropdown
                v-model="selectedSort"
                :options="sortOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('eventManagement.sort.recent')"
                class="sort-dropdown"
              />
            </div>

            <Button
              :label="$t('eventManagement.actions.newEvent')"
              icon="pi pi-plus"
              @click="navigateToCreateEvent"
              class="new-event-btn"
            />
          </div>
        </section>

        <!-- Events List Section -->
        <section class="events-list-section">
          <ProgressSpinner v-if="loading" class="loading-spinner" />

          <div v-else-if="filteredEvents.length === 0" class="no-events-message">
            <i class="pi pi-calendar-times"></i>
            <p>{{ $t('eventManagement.messages.noEvents') }}</p>
          </div>

          <div v-else class="events-grid">
            <div
              v-for="event in filteredEvents"
              :key="event.id"
              class="event-item"
              :class="{ 'selected': isSelected(event.id) }"
            >
              <Checkbox
                :modelValue="isSelected(event.id)"
                :binary="true"
                @change="toggleEventSelection(event.id)"
                class="event-checkbox"
              />

              <EventCard
                :event="event"
                :selected="isSelected(event.id)"
                @edit="navigateToEditEvent(event.id)"
              />
            </div>
          </div>
        </section>
      </TabPanel>

      <!-- TAB: Approved Quotes -->
      <TabPanel :header="$t('eventManagement.tabs.approvedQuotes') || 'Cotizaciones Aprobadas'">
        <!-- Actions Bar -->
        <section class="actions-section">
          <div class="search-filter-bar">
            <IconField iconPosition="left" class="search-field">
              <InputIcon class="pi pi-search" />

              <InputText
                v-model="searchQuery"
                :placeholder="$t('eventManagement.actions.search') || 'Buscar cotizaciones...'"
              />
            </IconField>

            <div class="filters-group">
              <Dropdown
                v-model="selectedSort"
                :options="sortOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('eventManagement.sort.recent')"
                class="sort-dropdown"
              />
            </div>
          </div>
        </section>

        <!-- Quotes List Section -->
        <section class="events-list-section">
          <ProgressSpinner v-if="loading" class="loading-spinner" />

          <div v-else-if="approvedQuotes.length === 0" class="no-events-message">
            <i class="pi pi-file-excel"></i>
            <p>{{ $t('eventManagement.messages.noEvents') || 'No hay cotizaciones aprobadas' }}</p>
          </div>



          <div v-else class="quotes-grid">
            <QuoteCard
              v-for="quote in approvedQuotes"
              :key="quote.id"
              :quote="quote"
              @view="viewQuoteDetails(quote.id)"
              @create-event="createEventFromQuote(quote)"
            />
          </div>
        </section>
      </TabPanel>
    </TabView>

    <!-- Pagination Section -->
    <footer class="pagination-section">
      <span class="pagination-info">
        {{ $t('eventManagement.pagination.showing') }} {{ startItem }}-{{ endItem }}
        {{ $t('eventManagement.pagination.of') }} {{ currentTotal }}
      </span>

      <Paginator
        :rows="pageSize"
        :totalRecords="currentTotal"
        @page="onPageChange"
        :first="(currentPage - 1) * pageSize"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      />
    </footer>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeleteConfirmation"
      :header="$t('eventManagement.confirmation.title')"
      :modal="true"
      :closable="true"
      class="delete-confirmation-dialog"
    >
      <p>{{ $t('eventManagement.confirmation.message', { count: selectedEvents.length }) }}</p>

      <template #footer>
        <Button
          :label="$t('eventManagement.actions.cancel')"
          @click="showDeleteConfirmation = false"
          text
        />
        <Button
          :label="$t('eventManagement.actions.delete')"
          severity="danger"
          @click="deleteSelectedEvents"
          :loading="loading"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
/* Variables CSS del proyecto */
.event-management-container {
  --primary-bg: #3A506B;
  --primary-text: #6FFFE9;
  --hover-text: #FFFFFF;
  --accent-color: #5BC0BE;
  --dark-bg: #1C2541;
  --border-color: #e0e0e0;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --success-color: #22C55E;
}

/* Container Principal */
.event-management-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 120px);
}

/* Header Section */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-bg);
  margin: 0;
}

/* Custom TabView */
.custom-tabview {
  margin-bottom: 2rem;
}

:deep(.custom-tabview .p-tabview-nav) {
  background: white;
  border-bottom: 2px solid var(--border-color);
}

:deep(.custom-tabview .p-tabview-nav-link) {
  padding: 1rem 1.5rem;
  font-weight: 500;
  color: #666;
}

:deep(.custom-tabview .p-tabview-nav .p-tabview-selected .p-tabview-nav-link) {
  color: var(--primary-bg);
  border-color: var(--accent-color);
}

/* Actions Section */
.actions-section {
  margin-bottom: 2rem;
}

.selection-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.selection-text {
  font-weight: 500;
  color: var(--primary-bg);
  margin-right: auto;
}

.search-filter-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-field {
  flex: 1;
  min-width: 250px;
}

.filters-group {
  display: flex;
  gap: 0.5rem;
}

.filter-dropdown,
.sort-dropdown {
  min-width: 150px;
}

.new-event-btn {
  background-color: var(--primary-bg);
  border-color: var(--primary-bg);
}

.new-event-btn:hover {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

/* Events List Section */
.events-list-section {

  min-height: 400px;
  position: relative;
}

.loading-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.no-events-message {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-events-message i {
  font-size: 3rem;
  color: var(--border-color);
  margin-bottom: 1rem;
}

.events-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.event-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.event-item.selected {
  background-color: #f0f9ff;
  border-color: var(--accent-color);
}

.event-checkbox {
  margin-top: 0.5rem;
}

/* Quotes Grid */
.quotes-grid {

  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

/* Pagination Section */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: #666;
  font-size: 0.95rem;
}

/* Dialog Customization */
:deep(.delete-confirmation-dialog) {
  max-width: 500px;
}

:deep(.delete-confirmation-dialog .p-dialog-header) {
  background-color: var(--primary-bg);
  color: var(--primary-text);
}

/* PrimeVue Component Overrides */
:deep(.p-button) {
  font-weight: 500;
}

:deep(.p-paginator) {
  background-color: transparent;
  border: none;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background-color: var(--primary-bg);
  border-color: var(--primary-bg);
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .event-management-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .search-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field {
    width: 100%;
  }

  .filters-group {
    flex-direction: column;
  }

  .filter-dropdown,
  .sort-dropdown {
    width: 100%;
  }

  .new-event-btn {
    width: 100%;
  }

  .events-grid,
  .quotes-grid {
    grid-template-columns: 1fr;
  }

  .pagination-section {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .selection-bar {
    flex-wrap: wrap;
  }

  .delete-selected-btn {
    width: 100%;
  }
}
</style>
