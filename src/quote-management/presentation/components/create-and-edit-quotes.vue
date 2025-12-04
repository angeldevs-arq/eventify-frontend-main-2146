<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';

import { QuoteApiService } from '../../infrastructure/services/quote-api.service.js';
import { ServiceItemApiService } from '../../infrastructure/services/service-item-api.service.js';
import { ProfileApiService } from '@/profile-management/infrastructure/services/profile-api.service.js';

import { QuoteOrder, Customer as CustomerData, Organizer as OrganizerData } from '../../domain/model';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';

import ServicesTable from '../components/services-table.vue';
import FinancialSummary from '../components/financial-summary.vue';
import ActionsQuotes from '../components/actions-quotes.vue';
import QuotePreviewModal from '../components/QuotePreviewModal.vue';

/* =========================================
   COMPOSABLES
========================================= */
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();
const { user, isOrganizer, isHost, restoreSession } = useAuth();

/* =========================================
   STATE
========================================= */
const quote = ref(new QuoteOrder({}));
quote.value.services = []; // aseguramos arreglo vacío

const isLoadingQuote = ref(false);
const isSaving = ref(false);
const isSending = ref(false);
const isEditMode = computed(() => !!route.params.id);
const showPreview = ref(false);

/* =========================================
   FINANCIAL TOTALS
========================================= */
const vatPercentage = ref(0.18);

const financialTotals = computed(() => {
  if (!quote.value?.services) return { subtotal: 0, vat: 0, total: 0 };

  const subtotal = quote.value.services.reduce((sum, s) => {
    const total = s.totalPrice || (s.quantity * s.unitPrice) || 0;
    return sum + total;
  }, 0);

  const vat = subtotal * vatPercentage.value;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    vat: Number(vat.toFixed(2)),
    total: Number((subtotal + vat).toFixed(2))
  };
});

/* =========================================
   EVENT TYPES
========================================= */
const eventTypeOptions = computed(() => [
  { label: t('events.types.wedding'), value: 'WEDDING' },
  { label: t('events.types.birthday'), value: 'BIRTHDAY' },
  { label: t('events.types.corporate'), value: 'CORPORATE' },
  { label: t('events.types.anniversary'), value: 'ANNIVERSARY' },
  { label: t('events.types.graduation'), value: 'GRADUATION' },
  { label: t('events.types.other'), value: 'OTHER' }
]);

/* =========================================
   VALIDATION
========================================= */
const canSave = computed(() => {
  return (
    quote.value.customer.name?.trim().length > 0 &&
    quote.value.event.type &&
    quote.value.event.date instanceof Date
  );
});

const canSend = computed(() => canSave.value && financialTotals.value.total > 0);

/* =========================================
   SYNC SERVICES WITH BACKEND
========================================= */
const syncServices = async (quoteId) => {
  console.log("🔄 Sincronizando servicios con backend...");

  for (const service of quote.value.services) {
    if (!service.id) {
      console.log("➕ Creando servicio:", service);

      await ServiceItemApiService.createServiceItem(quoteId, {
        description: service.description,
        quantity: service.quantity,
        unitPrice: service.unitPrice,
        totalPrice: service.totalPrice
      });
    } else {
      console.log("✏️ Actualizando servicio:", service);

      await ServiceItemApiService.updateServiceItem(quoteId, service.id, {
        description: service.description,
        quantity: service.quantity,
        unitPrice: service.unitPrice,
        totalPrice: service.totalPrice
      });
    }
  }
};

/* =========================================
   MAP SAVE PAYLOADS
========================================= */
const mapQuoteToCreatePayload = (quoteObj) => ({
  title: quoteObj.event?.type,
  eventType: quoteObj.event?.type,
  guestQuantity: quoteObj.event?.numberOfGuests || 0,
  location: quoteObj.event?.location || '',
  totalPrice: financialTotals.value.total,
  customerName: quoteObj.customer?.name,
  hostId: quoteObj.hostId || user.value?.id,
  eventDate: quoteObj.event?.date.toISOString()
});

const mapQuoteToUpdatePayload = (quoteObj) => ({
  title: quoteObj.event?.type,
  eventType: quoteObj.event?.type,
  guestQuantity: quoteObj.event?.numberOfGuests,
  location: quoteObj.event?.location,
  totalPrice: financialTotals.value.total,
  customerName: quoteObj.customer?.name,
  eventDate: quoteObj.event?.date.toISOString()
});

/* =========================================
   SAVE HANDLER
========================================= */
const handleSave = async () => {
  if (!canSave.value) {
    toast.add({ severity: 'warn', summary: t('common.warning'), detail: t('quotes.messages.fillRequired') });
    return;
  }

  isSaving.value = true;

  try {
    let response;
    let payload;

    if (isEditMode.value && quote.value.id) {
      payload = mapQuoteToUpdatePayload(quote.value);
      response = await QuoteApiService.updateQuote(quote.value.id, payload);
    } else {
      payload = mapQuoteToCreatePayload(quote.value);
      response = await QuoteApiService.createQuote(payload);
      quote.value.id = response.quoteId || response.id;
    }

    // 🔥 guardar servicios después
    await syncServices(quote.value.id);

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.savedSuccessfully'),
      life: 2000
    });

  } catch (e) {
    console.error("❌ Error saving:", e);
    toast.add({ severity: 'error', summary: t('common.error'), detail: e.message });
  } finally {
    isSaving.value = false;
  }
};

/* =========================================
   SEND / CONFIRM QUOTE
========================================= */
const handleSend = async () => {
  if (!canSend.value) {
    toast.add({ severity: 'warn', summary: t('common.warning'), detail: t('quotes.messages.cannotSend') });
    return;
  }

  isSending.value = true;

  try {
    if (!quote.value.id) await handleSave();

    await QuoteApiService.confirmQuote(quote.value.id);

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.sentSuccessfully')
    });

    router.push({ name: 'quotes' });

  } catch (e) {
    console.error("❌ Error sending:", e);
    toast.add({ severity: 'error', summary: t('common.error'), detail: e.message });
  } finally {
    isSending.value = false;
  }
};

/* =========================================
   PREVIEW
========================================= */
const handlePreview = () => { showPreview.value = true; };
const closePreview = () => { showPreview.value = false; };
const handleSaveAndSend = async () => {
  await handleSave();
  if (quote.value.id) await handleSend();
  closePreview();
};

/* =========================================
   LOAD QUOTE FOR EDITING
========================================= */
const loadQuote = async (id) => {
  try {
    isLoadingQuote.value = true;

    const data = await QuoteApiService.getQuoteById(id);
    const loaded = QuoteOrder.fromJSON(data);
    loaded.id = data.quoteId || data.id;

    if (!(loaded.event.date instanceof Date)) {
      loaded.event.date = new Date(loaded.event.date);
    }

    quote.value = loaded;

    // cargar items del servidor
    const services = await ServiceItemApiService.getServiceItems(id);
    quote.value.services = services;

    toast.add({ severity: 'success', summary: t('common.success'), detail: t('quotes.messages.loadedSuccessfully') });

  } catch (e) {
    console.error("❌ Error loading quote:", e);
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('quotes.messages.loadError') });
    router.push({ name: 'quotes' });
  } finally {
    isLoadingQuote.value = false;
  }
};

/* =========================================
   LIFECYCLE
========================================= */
onMounted(async () => {
  if (!user.value) await restoreSession();

  if (isHost.value) {
    quote.value.customer = new CustomerData({
      id: user.value.id,
      name: user.value.firstName + " " + user.value.lastName,
      email: user.value.email,
      phone: user.value.phone
    });
  }

  if (isOrganizer.value) {
    quote.value.organizer = new OrganizerData({
      id: user.value.id,
      name: user.value.username
    });
  }

  if (isEditMode.value) {
    await loadQuote(route.params.id);
  }
});

/* =========================================
   SERVICES TABLE HANDLER
========================================= */
const handleServicesUpdate = (services) => {
  console.log("🛠 Services updated:", services);
  quote.value.services = services;
};
</script>



<template>
  <main class="quote-form">
    <div class="quote-form__container">
      <div class="quote-form__main">
        <!-- Header -->
        <header class="quote-form__header">
          <Button
            icon="pi pi-arrow-left"
            :label="$t('common.back')"
            text
            severity="secondary"
            @click="() => router.push({ name: 'quotes' })"
            class="back-button"
          />
          <h1 class="page-title">
            {{ isEditMode ? $t('quotes.form.editTitle') : $t('quotes.form.createTitle') }}
          </h1>
        </header>

        <!-- Customer Section -->
        <section class="form-section">
          <h2 class="section-title">{{ $t('quotes.form.customer') }}</h2>

          <div class="form-grid">
            <div class="form-field full-width">
              <label for="customerName">{{ $t('quotes.form.customerName') }} *</label>
              <InputText
                id="customerName"
                v-model="quote.customer.name"
                :placeholder="$t('quotes.form.customerNamePlaceholder')"
              />
            </div>

            <div class="form-field">
              <label for="customerEmail">{{ $t('quotes.form.customerEmail') }}</label>
              <InputText
                id="customerEmail"
                v-model="quote.customer.email"
                type="email"
                :placeholder="$t('quotes.form.customerEmailPlaceholder')"
              />
            </div>

            <div class="form-field">
              <label for="customerPhone">{{ $t('quotes.form.customerPhone') }}</label>
              <InputText
                id="customerPhone"
                v-model="quote.customer.phone"
                :placeholder="$t('quotes.form.customerPhonePlaceholder')"
              />
            </div>
          </div>
        </section>

        <!-- Event Section -->
        <section class="form-section">
          <h2 class="section-title">{{ $t('quotes.form.event') }}</h2>

          <div class="form-grid">
            <div class="form-field">
              <label for="eventType">{{ $t('quotes.form.eventType') }} *</label>
              <Dropdown
                id="eventType"
                v-model="quote.event.type"
                :options="eventTypeOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('quotes.form.selectEventType')"
              />
            </div>

            <div class="form-field">
              <label for="eventDate">{{ $t('quotes.form.eventDate') }} *</label>
              <Calendar
                id="eventDate"
                v-model="quote.event.date"
                dateFormat="dd/mm/yy"
                :placeholder="$t('quotes.form.selectDate')"
                :minDate="new Date()"
                showIcon
              />
            </div>

            <div class="form-field">
              <label for="numberOfGuests">{{ $t('quotes.form.numberOfGuests') }}</label>
              <InputNumber
                id="numberOfGuests"
                v-model="quote.event.numberOfGuests"
                :min="1"
                :placeholder="$t('quotes.form.numberOfGuestsPlaceholder')"
              />
            </div>

            <div class="form-field">
              <label for="location">{{ $t('quotes.form.location') }}</label>
              <InputText
                id="location"
                v-model="quote.event.location"
                :placeholder="$t('quotes.form.locationPlaceholder')"
              />
            </div>

            <div class="form-field full-width">
              <label for="description">{{ $t('quotes.form.description') }}</label>
              <Textarea
                id="description"
                v-model="quote.event.description"
                rows="3"
                :placeholder="$t('quotes.form.descriptionPlaceholder')"
              />
            </div>
          </div>
        </section>

        <!-- Services Section -->
        <section class="form-section">
          <h2 class="section-title">{{ $t('quotes.services.title') }}</h2>

          <!-- 🔥 Only render table when edit mode AND quote.id exists -->
          <ServicesTable
            v-if="isEditMode && quote.id"
            :quote-id="quote.id"
            :services="quote.services"
            @update:services="handleServicesUpdate"
            @service-added="handleServicesUpdate"
            @service-removed="handleServicesUpdate"
          />

          <div v-else class="services-placeholder">
            <i class="pi pi-info-circle"></i>
            <p>{{ $t('quotes.services.saveFirst') }}</p>
          </div>
        </section>
      </div>

      <!-- Sidebar -->
      <aside class="quote-form__sidebar">
        <FinancialSummary
          :subtotal="financialTotals.subtotal"
          :vat="financialTotals.vat"
          :total="financialTotals.total"
          :vatPercentage="vatPercentage"
          :currency="quote.currency"
          :serviceCount="quote.services.length"
          :showDetails="true"
        />

        <ActionsQuotes
          :canSave="canSave"
          :canSend="canSend"
          :isSaving="isSaving"
          :isSending="isSending"
          :isEditMode="isEditMode"
          @save="handleSave"
          @send="handleSend"
          @preview="handlePreview"
        />
      </aside>
    </div>

    <!-- Preview Modal -->
    <QuotePreviewModal
      v-model:visible="showPreview"
      :quote="quote"
      @edit="closePreview"
      @save-and-send="handleSaveAndSend"
    />
  </main>
</template>


<style scoped>
/* [Todos los estilos originales se mantienen] */
.quote-form {
  min-height: 100vh;
  background-color: #F8F9FA;
  padding: 2rem;
}

.quote-form__container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 2rem;
}

.quote-form__main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.quote-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color, #3A506B);
  margin: 0;
}

.back-button {
  color: #6C757D;
}

.back-button:hover {
  color: var(--primary-color, #3A506B);
}

.form-section {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--secondary-color, #5BC0BE);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9375rem;
}

.services-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background-color: #F8F9FA;
  border: 2px dashed #DEE2E6;
  border-radius: 8px;
  text-align: center;
  gap: 1rem;
}

.services-placeholder i {
  font-size: 2.5rem;
  color: var(--secondary-color, #5BC0BE);
}

.services-placeholder p {
  font-size: 1rem;
  color: #6C757D;
  margin: 0;
}

.quote-form__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .quote-form__container {
    grid-template-columns: 1fr;
  }

  .quote-form__sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .quote-form {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
