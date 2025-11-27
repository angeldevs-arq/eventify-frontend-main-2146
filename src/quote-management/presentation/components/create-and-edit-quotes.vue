<!-- src/bounded-contexts/quote-management/presentation/components/create-and-edit-quotes.vue -->
<template>
  <div class="quote-form">
    <div class="quote-form__container">
      <!-- Contenido principal del formulario -->
      <div class="quote-form__main">
        <!-- Header -->
        <header class="quote-form__header">
          <h1 class="page-title">
            {{ isEditMode ? $t('quotes.form.editTitle') : $t('quotes.form.createTitle') }}
          </h1>
          <Button
            icon="pi pi-arrow-left"
            :label="$t('common.back')"
            text
            @click="handleBack"
            class="back-button"
          />
        </header>

        <!-- Basic Information -->
        <section class="form-section">
          <h2 class="section-title">{{ $t('quotes.form.basicInfo') }}</h2>

          <div class="form-grid">
            <!-- Customer -->
            <div class="form-field full-width">
              <label for="customer-name">{{ $t('quotes.form.customer') }}</label>
              <InputText
                id="customer-name"
                v-model="quote.customer.name"
                :placeholder="$t('quotes.form.customerPlaceholder')"
                class="w-full"
              />
            </div>

            <!-- Type of Event -->
            <div class="form-field">
              <label for="event-type">{{ $t('quotes.form.eventType') }}</label>
              <Dropdown
                id="event-type"
                v-model="quote.event.type"
                :options="eventTypes"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('quotes.form.selectType')"
                class="w-full"
              />
            </div>

            <!-- Date of the Event -->
            <div class="form-field">
              <label for="event-date">{{ $t('quotes.form.eventDate') }}</label>
              <Calendar
                id="event-date"
                v-model="quote.event.date"
                :placeholder="$t('quotes.form.datePlaceholder')"
                dateFormat="dd/mm/yy"
                :showIcon="true"
                class="w-full"
              />
            </div>

            <!-- Number of Guests -->
            <div class="form-field">
              <label for="guests">{{ $t('quotes.form.numberOfGuests') }}</label>
              <InputNumber
                id="guests"
                v-model="quote.event.numberOfGuests"
                :min="1"
                :placeholder="$t('quotes.form.guestsPlaceholder')"
                class="w-full"
                showButtons
              />
            </div>

            <!-- Location -->
            <div class="form-field">
              <label for="location">{{ $t('quotes.form.location') }}</label>
              <InputText
                id="location"
                v-model="quote.event.location"
                :placeholder="$t('quotes.form.locationPlaceholder')"
                class="w-full"
              />
            </div>
          </div>
        </section>

        <!-- Services Table -->
        <section class="form-section">
          <ServicesTable
            :services="quote.services"
            :currency="quote.currency"
            @update:services="handleServicesUpdate"
            @service-added="handleServiceAdded"
            @service-removed="handleServiceRemoved"
          />
        </section>

        <!-- Financial Summary -->
        <section class="form-section">
          <FinancialSummary
            :subtotal="quote.subtotal"
            :vat="quote.vat"
            :total="quote.total"
            :vatPercentage="quote.vatPercentage"
            :currency="quote.currency"
            :serviceCount="quote.services.length"
            :showDetails="true"
          />
        </section>
      </div>

      <!-- Actions Sidebar -->
      <aside class="quote-form__sidebar">
        <ActionsQuotes
          :canSave="canSave"
          :canPreview="canPreview"
          :canSend="canSend"
          :isSaving="isSaving"
          :isSending="isSending"
          :quoteState="quote.state"
          :lastUpdate="quote.updatedAt"
          @save="handleSave"
          @preview="handlePreview"
          @send="handleSend"
          @cancel="handleCancel"
        />
      </aside>
    </div>

    <!-- Preview Modal -->
    <QuotePreviewModal
      v-model:visible="showPreviewModal"
      :quote="quote"
      @edit="closePreview"
      @save-and-send="handleSaveAndSend"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import { QuoteOrder, Customer, Event, Organizer } from '../../domain/model';
import ServicesTable from './services-table.vue';
import FinancialSummary from './financial-summary.vue';
import ActionsQuotes from './actions-quotes.vue';
import QuotePreviewModal from './QuotePreviewModal.vue';
import { QuoteApiService } from '../../application/services/quote-api.service.js';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();
const { user, restoreSession, isOrganizer } = useAuth();

/* =========================================
   Datos del usuario actual
========================================= */
const currentUserId = computed(() => {
  const value = user.value?.id;
  return value != null ? String(value) : null;
});

/* =========================================
   Datos del organizador desde la URL
   (cuando el host viene desde HostDashboard)
========================================= */
const organizerFromRoute = computed(() => {
  const id = route.query.organizerId;
  if (!id) return null;

  return new Organizer({
    id: String(id),
    name: route.query.organizerName || '',
    role: 'organizer',
    phone: route.query.organizerPhone || '',
    avatar: route.query.organizerAvatar || ''
  });
});

/**
 * ownerId: siempre será el organizador.
 * - Si soy organizador, ownerId = mi id
 * - Si soy host, ownerId = organizerId que viene en la URL
 */
const ownerIdForNewQuote = computed(() => {
  if (isOrganizer.value) return currentUserId.value;
  if (organizerFromRoute.value?.id) return organizerFromRoute.value.id;
  return null; // fallback, pero idealmente siempre hay organizerId
});

/* =========================================
   Construir organizer desde el usuario
   (solo cuando el que crea es organizador)
========================================= */
const buildOrganizerForUser = () => {
  if (!user.value || !isOrganizer.value) {
    return new Organizer({});
  }

  return new Organizer({
    id: String(user.value.id),
    name: user.value.name || '',
    role: user.value.role || '',
    phone: user.value.phone || '',
    avatar: user.value.profileImage || ''
  });
};

/* =========================================
   Estado principal de la cotización
========================================= */
const quote = ref(new QuoteOrder({
  customer: new Customer({}),
  event: new Event({}),
  organizer: isOrganizer.value
    ? buildOrganizerForUser()
    : (organizerFromRoute.value || new Organizer({})),
  ownerId: ownerIdForNewQuote.value
}));

/**
 * Aplica contexto del usuario:
 * - Si soy organizador → organizador y ownerId = mi id
 * - Si soy host → customer = host, ownerId = organizerId
 */
const applyUserContextToQuote = () => {
  if (!currentUserId.value) return;

  if (isOrganizer.value) {
    quote.value.organizer = buildOrganizerForUser();
  } else {
    // Host = cliente
    const customerData = {
      id: currentUserId.value,
      name: user.value?.name || quote.value.customer.name,
      email: user.value?.email || quote.value.customer.email,
      phone: user.value?.phone || quote.value.customer.phone
    };
    quote.value.customer = new Customer(customerData);

    // Organizador desde la URL
    if (organizerFromRoute.value && !quote.value.organizer?.id) {
      quote.value.organizer = organizerFromRoute.value;
    }
  }

  // ownerId siempre es el organizador
  if (ownerIdForNewQuote.value) {
    quote.value.ownerId = ownerIdForNewQuote.value;
  }
};

/* =========================================
   Flags / UI
========================================= */
const isSaving = ref(false);
const isSending = ref(false);
const showPreviewModal = ref(false);
const isLoadingQuote = ref(false);

const isEditMode = computed(() => {
  return route.name === 'quote-edit' && route.params.id;
});

/* =========================================
   Opciones de tipos de evento
========================================= */
const eventTypes = computed(() => {
  return [
    { label: t('events.types.wedding'), value: 'WEDDING' },
    { label: t('events.types.conference'), value: 'CONFERENCE' },
    { label: t('events.types.corporate_party'), value: 'CORPORATE_PARTY' },
    { label: t('events.types.baby_shower'), value: 'BABY_SHOWER' },
    { label: t('events.types.graduation'), value: 'GRADUATION' },
    { label: t('events.types.birthday'), value: 'BIRTHDAY' },
    { label: t('events.types.fifteen_years'), value: 'FIFTEEN_YEARS' },
    { label: t('events.types.other'), value: 'OTHER' }
  ];
});

/* =========================================
   Reglas para habilitar acciones
========================================= */
const canSave = computed(() => {
  return quote.value.customer.name.trim().length > 0 &&
    quote.value.event.type &&
    quote.value.event.date &&
    quote.value.services.length > 0;
});

const canPreview = computed(() => canSave.value);

const canSend = computed(() => {
  // para simplificar: permitimos enviar siempre que se pueda guardar
  return canSave.value;
});

/* =========================================
   Handlers de servicios
========================================= */
const handleServicesUpdate = (updatedServices) => {
  quote.value.services = updatedServices;
};

const handleServiceAdded = (service) => {
  console.log('Service added:', service);
};

const handleServiceRemoved = (service) => {
  console.log('Service removed:', service);
};

/* =========================================
   Guardar cotización (crear / editar)
========================================= */
const handleSave = async () => {
  if (!canSave.value) return;

  isSaving.value = true;

  try {
    if (!currentUserId.value) {
      throw new Error(t('quotes.messages.missingOwner'));
    }

    // Aseguramos organizer y ownerId antes de serializar
    if (!quote.value.organizer?.id && organizerFromRoute.value) {
      quote.value.organizer = organizerFromRoute.value;
    }
    if (ownerIdForNewQuote.value) {
      quote.value.ownerId = ownerIdForNewQuote.value;
    }

    const quoteData = quote.value.toJSON();
    quoteData.updatedAt = new Date().toISOString();
    quoteData.ownerId = quote.value.ownerId;

    // customer = host si el que crea es host
    if (!isOrganizer.value) {
      quoteData.customer = quoteData.customer || {};
      quoteData.customer.id = currentUserId.value;
      quoteData.customerId = currentUserId.value;
    }

    // organizerId explícito (útil para filtros)
    if (quoteData.organizer?.id) {
      quoteData.organizerId = quoteData.organizer.id;
    }

    let savedQuote;

    if (isEditMode.value) {
      // Actualizar cotización existente
      savedQuote = await QuoteApiService.update(route.params.id, quoteData);
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('quotes.messages.updatedSuccessfully'),
        life: 3000
      });
    } else {
      // Nueva cotización: por defecto DRAFT
      quoteData.state = quoteData.state || QuoteOrder.STATES.DRAFT;
      savedQuote = await QuoteApiService.create(quoteData);
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('quotes.messages.createdSuccessfully'),
        life: 3000
      });
    }

    console.log('Quote saved:', savedQuote);
    router.push({ name: 'quotes' });
  } catch (error) {
    console.error('Error saving quote:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.saveError'),
      life: 5000
    });
  } finally {
    isSaving.value = false;
  }
};

/* =========================================
   Preview
========================================= */
const handlePreview = () => {
  if (!canPreview.value) return;
  showPreviewModal.value = true;
};

const closePreview = () => {
  showPreviewModal.value = false;
};

/* =========================================
   Enviar cotización
   - Si es nueva → guardar (DRAFT) y luego cambiar estado
   - Estado al enviar: PENDING
========================================= */
const handleSend = async () => {
  if (!canSend.value) return;

  isSending.value = true;

  try {
    if (!currentUserId.value) {
      throw new Error(t('quotes.messages.missingOwner'));
    }

    // Si no tiene ID todavía, guardamos primero
    if (!quote.value.id) {
      await handleSave();
    }

    // Cambiar estado a PENDING
    const updated = await QuoteApiService.changeState(quote.value.id, QuoteOrder.STATES.PENDING);
    quote.value = QuoteOrder.fromJSON(updated);

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.sentSuccessfully'),
      life: 3000
    });

    router.push({ name: 'quotes' });
  } catch (error) {
    console.error('Error sending quote:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.sendError'),
      life: 5000
    });
  } finally {
    isSending.value = false;
  }
};

const handleSaveAndSend = async () => {
  closePreview();
  await handleSave();
  if (quote.value.id) {
    await handleSend();
  }
};

const handleCancel = () => {
  router.push({ name: 'quotes' });
};

const handleBack = () => {
  router.push({ name: 'quotes' });
};

/* =========================================
   Cargar cotización para editar
========================================= */
const loadQuote = async (quoteId) => {
  isLoadingQuote.value = true;
  try {
    const data = await QuoteApiService.getById(quoteId);
    const loadedQuote = QuoteOrder.fromJSON(data);
    const userId = currentUserId.value;

    const ownerId = loadedQuote.ownerId ? String(loadedQuote.ownerId) : null;
    const organizerId = loadedQuote.organizer?.id ? String(loadedQuote.organizer.id) : null;
    const customerId = loadedQuote.customer?.id
      ? String(loadedQuote.customer.id)
      : (data.customerId != null ? String(data.customerId) : null);

    // Permisos básicos
    const isAllowed = () => {
      if (!userId) return false;
      if (isOrganizer.value) {
        return ownerId === userId || organizerId === userId;
      }
      return customerId === userId;
    };

    if (!isAllowed()) {
      throw new Error(t('quotes.messages.forbiddenQuote'));
    }

    loadedQuote.ownerId = ownerId || organizerId || userId;
    quote.value = loadedQuote;

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.loadedSuccessfully'),
      life: 2000
    });
  } catch (error) {
    console.error('Error loading quote:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.loadError'),
      life: 5000
    });
    router.push({ name: 'quotes' });
  } finally {
    isLoadingQuote.value = false;
  }
};

/* =========================================
   Lifecycle
========================================= */
onMounted(async () => {
  if (!user.value) {
    await restoreSession();
  }

  applyUserContextToQuote();

  if (isEditMode.value) {
    await loadQuote(route.params.id);
  }
});
</script>

<style scoped>
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

/* Header */
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

/* Secciones del formulario */
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

/* Grid de formulario */
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

.w-full {
  width: 100%;
}

/* Sidebar */
.quote-form__sidebar {
  position: relative;
}

/* Responsive */
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

  .quote-form__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
