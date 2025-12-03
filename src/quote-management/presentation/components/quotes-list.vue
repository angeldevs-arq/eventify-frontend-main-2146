<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import QuoteStateBadge from '/src/quote-management/presentation/pages/QuoteStateBadge.vue';
import { QuoteApiService } from '../../infrastructure/services/quote-api.service.js';
import { ServiceItemApiService } from '../../infrastructure/services/service-item-api.service.js';
import { ProfileApiService } from '@/profile-management/infrastructure/services/profile-api.service.js';
import { Quote } from '../../domain/model/quote.entity.js';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const { user, isOrganizer, isHost, restoreSession } = useAuth();

// Estado reactivo
const quotes = ref([]);
const quotesWithDetails = ref([]); // Quotes enriquecidas con datos de perfil
const loading = ref(false);
const searchQuery = ref('');
const selectedFilter = ref('ALL');
const selectedSort = ref('RECENT');
const userProfile = ref(null); // Perfil completo del usuario actual

// Estados disponibles
const QUOTE_STATES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED'
};

// Opciones de filtros
const filterOptions = computed(() => [
  { label: t('quotes.filters.all'), value: 'ALL' },
  { label: t('quotes.filters.approved'), value: 'CONFIRMED' },
  { label: t('quotes.filters.pending'), value: 'PENDING' },
  { label: t('quotes.filters.declined'), value: 'REJECTED' }
]);

const sortOptions = computed(() => [
  { label: t('quotes.sort.recent'), value: 'RECENT' },
  { label: t('quotes.sort.oldest'), value: 'OLDEST' },
  { label: t('quotes.sort.amountHigh'), value: 'AMOUNT_HIGH' },
  { label: t('quotes.sort.amountLow'), value: 'AMOUNT_LOW' }
]);

// Computed - Filtrar cotizaciones
const filteredQuotes = computed(() => {
  let result = [...quotesWithDetails.value];

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(quote =>
      quote.hostName?.toLowerCase().includes(query) ||
      quote.eventType?.toLowerCase().includes(query) ||
      quote.title?.toLowerCase().includes(query) ||
      quote.location?.toLowerCase().includes(query)
    );
  }

  // Filtrar por estado
  if (selectedFilter.value !== 'ALL') {
    result = result.filter(quote => quote.state === selectedFilter.value);
  }

  // Ordenar
  switch (selectedSort.value) {
    case 'RECENT':
      result.sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
      break;
    case 'OLDEST':
      result.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
      break;
    case 'AMOUNT_HIGH':
      result.sort((a, b) => b.totalPrice - a.totalPrice);
      break;
    case 'AMOUNT_LOW':
      result.sort((a, b) => a.totalPrice - b.totalPrice);
      break;
  }

  return result;
});

// Métodos
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatCurrency = (amount) => {
  return `S/ ${Number(amount).toFixed(2)}`;
};

const handleNewQuote = () => {
  router.push({ name: 'quote-create' });
};

const handleView = (quoteId) => {
  router.push({ name: 'quote-detail', params: { id: quoteId } });
};

const handleEdit = (quoteId) => {
  router.push({ name: 'quote-edit', params: { id: quoteId } });
};

const handleApprove = async (quoteId) => {
  loading.value = true;
  try {
    await QuoteApiService.confirmQuote(quoteId);

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.stateApproved'),
      life: 3000
    });

    // Recargar quotes
    await loadQuotes();
  } catch (error) {
    console.error('Error approving quote:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.stateChangeError'),
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

const handleDecline = async (quoteId) => {
  loading.value = true;
  try {
    await QuoteApiService.rejectQuote(quoteId);

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.stateDeclined'),
      life: 3000
    });

    // Recargar quotes
    await loadQuotes();
  } catch (error) {
    console.error('Error declining quote:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.stateChangeError'),
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

const enrichQuoteWithDetails = async (quote) => {
  try {
    // Obtener nombre del host
    let hostName = 'Cliente';
    try {
      const hostProfile = await ProfileApiService.getProfileById(quote.hostId);
      hostName = `${hostProfile.firstName} ${hostProfile.lastName}`;
    } catch (error) {
      console.warn(`No se pudo cargar perfil del host ${quote.hostId}:`, error);
    }

    // Calcular total de items si es necesario
    let calculatedTotal = quote.totalPrice;
    if (!calculatedTotal || calculatedTotal === 0) {
      try {
        calculatedTotal = await ServiceItemApiService.getTotalForQuote(quote.quoteId);
      } catch (error) {
        console.warn(`No se pudo calcular total para quote ${quote.quoteId}:`, error);
      }
    }

    return {
      ...quote,
      hostName,
      calculatedTotal
    };
  } catch (error) {
    console.error('Error enriching quote:', error);
    return {
      ...quote,
      hostName: 'Cliente',
      calculatedTotal: quote.totalPrice
    };
  }
};

// Cargar perfil del usuario actual
const loadUserProfile = async () => {
  try {
    if (!user.value) {
      await restoreSession();
    }

    // Intentar obtener el profileId desde diferentes fuentes
    let profileId = user.value?.profileId || user.value?.id;

    if (!profileId) {
      // Buscar el perfil por email
      console.log('🔍 Buscando perfil del usuario:', user.value);
      const allProfiles = await ProfileApiService.getAll();
      const profile = allProfiles.find(p =>
        p.email === user.value?.email ||
        p.userId === user.value?.id
      );

      if (!profile) {
        throw new Error('No se encontró el perfil del usuario');
      }

      userProfile.value = profile;
      console.log('✅ Perfil del usuario cargado:', userProfile.value);
    } else {
      // Si existe profileId, cargarlo directamente
      userProfile.value = await ProfileApiService.getById(profileId);
      console.log('✅ Perfil del usuario cargado:', userProfile.value);
    }
  } catch (error) {
    console.error('❌ Error loading user profile:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: 'No se pudo cargar tu perfil',
      life: 5000
    });
  }
};

const loadQuotes = async () => {
  loading.value = true;
  try {
    // Asegurar que tenemos el perfil del usuario
    if (!userProfile.value) {
      await loadUserProfile();
    }

    if (!userProfile.value?.id) {
      console.error('No se encontró profileId del usuario');
      quotes.value = [];
      quotesWithDetails.value = [];
      return;
    }

    let data = [];

    if (isOrganizer.value) {
      // Organizer: cargar sus propias cotizaciones
      data = await QuoteApiService.getQuotesByOrganizer(userProfile.value.id);
    } else if (isHost.value) {
      // Host: El backend no tiene endpoint GET /quotes
      // Debemos buscar en todas las quotes de todos los organizadores
      // O si hay un endpoint específico para host, usarlo aquí

      // TEMPORAL: Obtener quotes del organizador 1 y filtrar por hostId
      // TODO: Crear endpoint en backend GET /api/v1/hosts/{hostId}/quotes
      try {
        const organizerQuotes = await QuoteApiService.getQuotesByOrganizer(1);
        data = organizerQuotes.filter(q => q.hostId === userProfile.value.id);
      } catch (error) {
        console.warn('No se pudieron cargar quotes del organizador 1');
        data = [];
      }
    }

    quotes.value = data.map(q => Quote.fromBackend(q));

    // Enriquecer con detalles (nombres de perfil, etc.)
    quotesWithDetails.value = await Promise.all(
      quotes.value.map(quote => enrichQuoteWithDetails(quote))
    );

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.loadedSuccessfully'),
      life: 3000
    });
  } catch (error) {
    console.error('Error loading quotes:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('quotes.messages.loadError'),
      life: 5000
    });
    quotes.value = [];
    quotesWithDetails.value = [];
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadQuotes();
});
</script>

<template>
  <section class="quotes-list">
    <!-- Filtros y búsqueda -->
    <div class="quotes-list__filters">
      <div class="search-container">
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="searchQuery"
            :placeholder="$t('quotes.list.searchPlaceholder')"
            class="search-input"
          />
        </IconField>
      </div>

      <div class="filter-controls">
        <Dropdown
          v-model="selectedFilter"
          :options="filterOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('quotes.list.filterAll')"
          class="filter-dropdown"
        />

        <Dropdown
          v-model="selectedSort"
          :options="sortOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="$t('quotes.list.sortRecent')"
          class="filter-dropdown"
        />

        <Button
          v-if="isOrganizer"
          :label="$t('quotes.list.newQuote')"
          icon="pi pi-plus"
          @click="handleNewQuote"
          class="new-quote-btn"
        />
      </div>
    </div>

    <!-- Tabla de cotizaciones -->
    <DataTable
      :value="filteredQuotes"
      :loading="loading"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      responsiveLayout="scroll"
      class="quotes-table"
      stripedRows
    >
      <Column field="hostName" :header="$t('quotes.list.customer')" sortable>
        <template #body="{ data }">
          <span class="customer-name">{{ data.hostName }}</span>
        </template>
      </Column>

      <Column field="eventType" :header="$t('quotes.list.event')" sortable>
        <template #body="{ data }">
          <div class="event-info">
            <span class="event-type">{{ data.eventType }}</span>
            <span class="event-title" v-if="data.title">{{ data.title }}</span>
          </div>
        </template>
      </Column>

      <Column field="eventDate" :header="$t('quotes.list.date')" sortable>
        <template #body="{ data }">
          <span class="event-date">{{ formatDate(data.eventDate) }}</span>
        </template>
      </Column>

      <Column field="totalPrice" :header="$t('quotes.list.amount')" sortable>
        <template #body="{ data }">
          <span class="quote-amount">{{ formatCurrency(data.totalPrice) }}</span>
        </template>
      </Column>

      <Column field="state" :header="$t('quotes.list.state')" sortable>
        <template #body="{ data }">
          <QuoteStateBadge :state="data.state" />
        </template>
      </Column>

      <Column :header="$t('quotes.list.actions')" class="actions-column">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              :label="$t('quotes.list.view')"
              icon="pi pi-eye"
              text
              @click="handleView(data.quoteId)"
              class="action-btn view-btn"
            />
            <Button
              v-if="isOrganizer"
              :label="$t('quotes.list.edit')"
              icon="pi pi-pencil"
              text
              @click="handleEdit(data.quoteId)"
              class="action-btn edit-btn"
            />
            <Button
              v-if="isHost && data.state === QUOTE_STATES.PENDING"
              :label="$t('quotes.actions.approve')"
              icon="pi pi-check"
              text
              class="action-btn approve-btn"
              @click="handleApprove(data.quoteId)"
            />
            <Button
              v-if="isHost && data.state === QUOTE_STATES.PENDING"
              :label="$t('quotes.actions.decline')"
              icon="pi pi-times"
              text
              class="action-btn decline-btn"
              @click="handleDecline(data.quoteId)"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox empty-icon"></i>
          <p>{{ $t('quotes.list.noQuotes') }}</p>
        </div>
      </template>
    </DataTable>
  </section>
</template>

<style scoped>
.quotes-list {
  width: 100%;
  padding: 2rem;
}

/* Filtros */
.quotes-list__filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-container {
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.search-input {
  width: 100%;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-dropdown {
  min-width: 150px;
}

.new-quote-btn {
  background-color: var(--primary-color, #3A506B);
  border-color: var(--primary-color, #3A506B);
  color: var(--accent-color, #6FFFE9);
  font-weight: 600;
  white-space: nowrap;
}

.new-quote-btn:hover {
  background-color: var(--secondary-color, #5BC0BE);
  border-color: var(--secondary-color, #5BC0BE);
  color: #FFFFFF;
}

/* Tabla */
.quotes-table {
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.p-datatable-thead > tr > th) {
  background-color: #F8F9FA;
  color: #495057;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.customer-name {
  font-weight: 600;
  color: #212529;
}

.event-info {
  display: flex;
  flex-direction: column;
}

.event-type {
  font-weight: 500;
  color: #495057;
}

.event-title {
  font-size: 0.85rem;
  color: #6C757D;
}

.event-date {
  color: #6C757D;
}

.quote-amount {
  font-weight: 600;
  color: #28A745;
  font-size: 1rem;
}

/* Acciones */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  font-size: 0.875rem;
}

.view-btn {
  color: var(--secondary-color, #5BC0BE);
}

.view-btn:hover {
  color: var(--primary-color, #3A506B);
}

.edit-btn {
  color: #6C757D;
}

.approve-btn {
  color: #16a34a;
}

.approve-btn:hover {
  color: #0f766e;
}

.decline-btn {
  color: #dc2626;
}

.decline-btn:hover {
  color: #b91c1c;
}

.edit-btn:hover {
  color: var(--primary-color, #3A506B);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6C757D;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .quotes-list {
    padding: 1rem;
  }

  .quotes-list__filters {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
  }

  .filter-controls {
    flex-direction: column;
    width: 100%;
  }

  .filter-dropdown,
  .new-quote-btn {
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
