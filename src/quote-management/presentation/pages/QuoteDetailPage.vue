<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import Avatar from 'primevue/avatar';

import QuoteStateBadge from '/src/quote-management/presentation/pages/QuoteStateBadge.vue';
import FinancialSummary from '../components/financial-summary.vue';
import { QuoteApiService } from '/src/quote-management/application/services/quote-api.service.js';
import { QuoteOrder } from '/src/quote-management/domain/model';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';

/* =========================================================
   COMPOSABLES & STATE
========================================================= */

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const { user, isOrganizer, isHost, restoreSession } = useAuth();
const quoteStates = QuoteOrder.STATES;

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const quote = ref(null);
const loading = ref(true);
const stateLoading = ref(false);

/* =========================================================
   COMPUTED PROPERTIES
========================================================= */

const isHostUser = computed(() => isHost.value);

const currentUserId = computed(() => {
  const value = user.value?.id;
  return value != null ? String(value) : null;
});

const isPending = computed(() => quote.value?.state === quoteStates.PENDING);
const isDraft = computed(() => quote.value?.state === quoteStates.DRAFT);
const isApproved = computed(() => quote.value?.state === quoteStates.APPROVED);

/* =========================================================
   DATE & CURRENCY FORMATTERS
========================================================= */

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d)) return '-';
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/* =========================================================
   ACTION HANDLERS
========================================================= */

const handleBack = () => {
  router.push({ name: 'quotes' });
};

const handleEdit = () => {
  router.push({ name: 'quote-edit', params: { id: props.id } });
};

const handleSend = async () => {
  stateLoading.value = true;
  try {
    await QuoteApiService.changeState(props.id, 'PENDING');

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.sentSuccessfully'),
      life: 3000
    });

    await loadQuote();
  } catch (error) {
    console.error('Error sending quote:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.sendError'),
      life: 5000
    });
  } finally {
    stateLoading.value = false;
  }
};

const changeQuoteState = async (newState) => {
  stateLoading.value = true;
  try {
    const response = await QuoteApiService.changeState(props.id, newState);
    const updatedQuote = QuoteOrder.fromJSON(response);

    if (quote.value) {
      quote.value.state = updatedQuote.state;
      quote.value.updatedAt = updatedQuote.updatedAt;
    }

    const msg = newState === QuoteOrder.STATES.APPROVED
      ? t('quotes.messages.stateApproved')
      : t('quotes.messages.stateDeclined');

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: msg,
      life: 3000,
    });
  } catch (error) {
    console.error('Error changing quote state:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.stateChangeError'),
      life: 5000,
    });
  } finally {
    stateLoading.value = false;
  }
};

const handleApprove = () => changeQuoteState(QuoteOrder.STATES.APPROVED);
const handleDecline = () => changeQuoteState(QuoteOrder.STATES.DECLINED);

/* =========================================================
   LOAD QUOTE DATA
========================================================= */

const loadQuote = async () => {
  loading.value = true;
  try {
    if (!user.value) {
      await restoreSession();
    }

    const data = await QuoteApiService.getById(props.id);
    const loadedQuote = QuoteOrder.fromJSON(data);

    const userId = currentUserId.value;
    const ownerId = loadedQuote.ownerId ? String(loadedQuote.ownerId) : null;
    const organizerId = loadedQuote.organizer?.id ? String(loadedQuote.organizer.id) : null;
    const customerId = loadedQuote.customer?.id
      ? String(loadedQuote.customer.id)
      : (data.customerId != null ? String(data.customerId) : null);

    const isAllowed = () => {
      if (!userId) return false;
      if (ownerId && ownerId === userId) return true;
      if (isOrganizer.value && organizerId) {
        return organizerId === userId;
      }
      return customerId === userId;
    };

    if (!isAllowed()) {
      throw new Error(t('quotes.messages.forbiddenQuote'));
    }

    loadedQuote.ownerId = ownerId || organizerId || customerId || userId;
    quote.value = loadedQuote;
  } catch (error) {
    console.error('Error loading quote:', error);

    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.loadError'),
      life: 5000
    });

    setTimeout(() => {
      router.push({ name: 'quotes' });
    }, 2000);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadQuote();
});
</script>

<template>
  <main class="quote-detail-page">
    <div class="quote-detail-page__container">
      <!-- ================================================================
           HEADER
           ================================================================ -->
      <header class="quote-detail-page__header">
        <div class="header-left">
          <Button
            icon="pi pi-arrow-left"
            :label="$t('common.back')"
            text
            severity="secondary"
            @click="handleBack"
            class="back-button"
          />
          <h1 class="page-title">{{ $t('quotes.detail.title') }}</h1>
        </div>

        <!-- Action buttons -->
        <div class="header-actions" v-if="quote && !loading">
          <Button
            v-if="isOrganizer && isDraft"
            :label="$t('quotes.actions.send')"
            icon="pi pi-send"
            @click="handleSend"
            class="action-btn"
            :loading="stateLoading"
            :disabled="stateLoading"
          />
          <Button
            v-if="isOrganizer && isDraft"
            :label="$t('common.edit')"
            icon="pi pi-pencil"
            @click="handleEdit"
            outlined
            severity="secondary"
            class="action-btn"
          />
          <Button
            v-if="isHostUser && isPending"
            :label="$t('quotes.actions.approve')"
            icon="pi pi-check"
            severity="success"
            class="action-btn"
            @click="handleApprove"
            :loading="stateLoading"
            :disabled="stateLoading"
          />
          <Button
            v-if="isHostUser && isPending"
            :label="$t('quotes.actions.decline')"
            icon="pi pi-times"
            severity="danger"
            class="action-btn"
            @click="handleDecline"
            :loading="stateLoading"
            :disabled="stateLoading"
          />
        </div>
      </header>

      <!-- ================================================================
           LOADING STATE
           ================================================================ -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p class="loading-text">{{ $t('common.loading') }}</p>
      </div>

      <!-- ================================================================
           MAIN CONTENT
           ================================================================ -->
      <div v-else-if="quote" class="quote-detail-page__content">

        <!-- ------- STATUS SECTION ------- -->
        <section class="detail-section status-section">
          <div class="status-wrapper">
            <h2 class="status-title">{{ $t('quotes.detail.status') }}</h2>
            <QuoteStateBadge :state="quote.state" />
          </div>
        </section>

        <!-- ------- INFORMATION CARDS ------- -->
        <section class="detail-section info-section">
          <h2 class="section-title">{{ $t('quotes.detail.information') }}</h2>

          <div class="info-cards-grid">
            <!-- Customer Card -->
            <div class="info-card">
              <div class="card-icon-header">
                <i class="pi pi-user card-icon"></i>
                <h3 class="card-title">{{ $t('quotes.form.customer') }}</h3>
              </div>
              <div class="card-body">
                <p class="primary-text">{{ quote.customer.name }}</p>
                <div v-if="quote.customer.email" class="contact-item">
                  <i class="pi pi-envelope"></i>
                  <p class="secondary-text">{{ quote.customer.email }}</p>
                </div>
                <div v-if="quote.customer.phone" class="contact-item">
                  <i class="pi pi-phone"></i>
                  <p class="secondary-text">{{ quote.customer.phone }}</p>
                </div>
              </div>
            </div>

            <!-- Event Card -->
            <div class="info-card">
              <div class="card-icon-header">
                <i class="pi pi-calendar-plus card-icon"></i>
                <h3 class="card-title">{{ $t('quotes.preview.event') }}</h3>
              </div>
              <div class="card-body">
                <p class="primary-text">{{ $t(`events.types.${quote.event.type.toLowerCase()}`) }}</p>
                <p v-if="quote.event.name" class="event-name secondary-text">
                  {{ quote.event.name }}
                </p>
                <div class="event-details">
                  <div class="detail-item">
                    <i class="pi pi-calendar"></i>
                    <p class="secondary-text">{{ formatDate(quote.event.date) }}</p>
                  </div>
                  <div class="detail-item">
                    <i class="pi pi-map-marker"></i>
                    <p class="secondary-text">{{ quote.event.location }}</p>
                  </div>
                  <div class="detail-item">
                    <i class="pi pi-users"></i>
                    <p class="secondary-text">{{ quote.event.numberOfGuests }} {{ $t('quotes.preview.guests') }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Organizer Card -->
            <div class="info-card">
              <div class="card-icon-header">
                <i class="pi pi-briefcase card-icon"></i>
                <h3 class="card-title">{{ $t('quotes.detail.organizer') }}</h3>
              </div>
              <div class="card-body organizer-body">
                <Avatar
                  :image="quote.organizer.avatar"
                  :label="quote.organizer.name.charAt(0)"
                  size="large"
                  shape="circle"
                  class="organizer-avatar"
                />
                <div class="organizer-info">
                  <p class="primary-text">{{ quote.organizer.name }}</p>
                  <p v-if="quote.organizer.role" class="role secondary-text">{{ quote.organizer.role }}</p>
                  <div v-if="quote.organizer.phone" class="contact-item">
                    <i class="pi pi-phone"></i>
                    <p class="secondary-text">{{ quote.organizer.phone }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ------- SERVICES TABLE ------- -->
        <section class="detail-section services-section">
          <div class="section-header">
            <h2 class="section-title">{{ $t('quotes.services.title') }}</h2>
            <span class="service-badge">
              {{ quote.services.length }} {{ $t('quotes.services.services') }}
            </span>
          </div>

          <div class="services-table-wrapper">
            <DataTable
              :value="quote.services"
              class="services-table"
              striped-rows
              :rows="10"
              responsive-layout="scroll"
            >
              <Column
                field="description"
                :header="$t('quotes.services.description')"
                class="service-col-description"
              >
                <template #body="{ data }">
                  <span class="service-description">{{ data.description }}</span>
                </template>
              </Column>

              <Column
                field="quantity"
                :header="$t('quotes.services.quantity')"
                class="service-col-qty"
              >
                <template #body="{ data }">
                  <span class="service-qty">{{ data.quantity }}</span>
                </template>
              </Column>

              <Column
                field="unitPrice"
                :header="$t('quotes.services.unitPrice')"
                class="service-col-price"
              >
                <template #body="{ data }">
                  <span class="service-price">{{ data.getFormattedUnitPrice() }}</span>
                </template>
              </Column>

              <Column
                field="total"
                :header="$t('quotes.services.total')"
                class="service-col-total"
              >
                <template #body="{ data }">
                  <span class="service-total">{{ data.getFormattedTotal() }}</span>
                </template>
              </Column>
            </DataTable>
          </div>
        </section>

        <!-- ------- FINANCIAL SUMMARY ------- -->
        <section class="detail-section financial-section">
          <FinancialSummary
            :subtotal="quote.subtotal"
            :vat="quote.vat"
            :total="quote.total"
            :vatPercentage="quote.vatPercentage"
            :currency="quote.currency"
            :serviceCount="quote.services.length"
            :showDetails="true"
            :showPaymentTerms="true"
          />
        </section>

        <!-- ------- METADATA ------- -->
        <section class="detail-section metadata-section">
          <h2 class="section-title">{{ $t('quotes.detail.metadata') }}</h2>

          <div class="metadata-grid">
            <div class="metadata-item">
              <div class="metadata-icon">
                <i class="pi pi-clock"></i>
              </div>
              <div class="metadata-content">
                <span class="metadata-label">{{ $t('quotes.detail.created') }}</span>
                <span class="metadata-value">{{ formatDateTime(quote.createdAt) }}</span>
              </div>
            </div>

            <div class="metadata-item">
              <div class="metadata-icon">
                <i class="pi pi-pencil"></i>
              </div>
              <div class="metadata-content">
                <span class="metadata-label">{{ $t('quotes.detail.lastUpdate') }}</span>
                <span class="metadata-value">{{ formatDateTime(quote.updatedAt) }}</span>
              </div>
            </div>

            <div class="metadata-item">
              <div class="metadata-icon">
                <i class="pi pi-hashtag"></i>
              </div>
              <div class="metadata-content">
                <span class="metadata-label">{{ $t('quotes.detail.quoteId') }}</span>
                <span class="metadata-value quote-id">{{ quote.id }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- ================================================================
           ERROR STATE
           ================================================================ -->
      <div v-else class="error-container">
        <div class="error-content">
          <i class="pi pi-exclamation-circle error-icon"></i>
          <h2 class="error-title">{{ $t('quotes.detail.notFound') }}</h2>
          <p class="error-message">{{ $t('quotes.detail.notFoundMessage') }}</p>
          <Button
            :label="$t('common.backToList')"
            icon="pi pi-arrow-left"
            @click="handleBack"
            class="error-button"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* ================================================================
   LAYOUT & CONTAINER
   ================================================================ */

.quote-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fa 100%);
  padding: 1.5rem;
}

.quote-detail-page__container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ================================================================
   HEADER
   ================================================================ */

.quote-detail-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 300px;
}

.back-button {
  color: var(--primary-color, #3A506B) !important;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color, #3A506B);
  margin: 0;
  line-height: 1.2;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.action-btn {
  min-width: 120px;
}

/* ================================================================
   LOADING & ERROR STATES
   ================================================================ */

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1.5rem;
}

.loading-text {
  font-size: 1rem;
  color: #6C757D;
  margin: 0;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.error-icon {
  font-size: 3rem;
  color: #DC3545;
  display: block;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
  margin: 0 0 0.5rem 0;
}

.error-message {
  color: #6C757D;
  margin-bottom: 1.5rem;
}

.error-button {
  margin-top: 1rem;
}

/* ================================================================
   CONTENT SECTIONS
   ================================================================ */

.quote-detail-page__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  background: white;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* ------- STATUS SECTION ------- */

.status-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-left: 4px solid var(--secondary-color, #5BC0BE);
}

.status-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.status-title {
  font-size: 1rem;
  font-weight: 500;
  color: #6C757D;
  margin: 0;
}

/* ------- INFO CARDS ------- */

.info-section {
  padding: 2rem;
}

.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.info-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid rgba(58, 80, 107, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(58, 80, 107, 0.1);
  transform: translateY(-2px);
}

.card-icon-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-icon {
  font-size: 1.5rem;
  color: var(--secondary-color, #5BC0BE);
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
  margin: 0;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.organizer-body {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.organizer-avatar {
  background-color: var(--secondary-color, #5BC0BE);
}

.organizer-info {
  flex: 1;
}

.primary-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
  margin: 0;
}

.secondary-text {
  font-size: 0.875rem;
  color: #6C757D;
  margin: 0;
}

.role {
  font-style: italic;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.contact-item i {
  font-size: 0.875rem;
  color: var(--secondary-color, #5BC0BE);
}

.event-name {
  margin-top: 0.25rem;
  font-weight: 500;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-item i {
  font-size: 0.875rem;
  color: var(--secondary-color, #5BC0BE);
  min-width: 20px;
}

/* ------- SERVICES TABLE ------- */

.services-section {
  padding: 2rem;
}

.service-badge {
  display: inline-block;
  background: var(--secondary-color, #5BC0BE);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.services-table-wrapper {
  overflow-x: auto;
  margin-top: 1.5rem;
}

.services-table {
  width: 100%;
}

:deep(.services-table .p-datatable-thead > tr > th) {
  background-color: #f8f9fa;
  color: var(--primary-color, #3A506B);
  font-weight: 600;
  border-color: rgba(0, 0, 0, 0.08);
  padding: 1rem;
}

:deep(.services-table .p-datatable-tbody > tr) {
  border-color: rgba(0, 0, 0, 0.08);
}

:deep(.services-table .p-datatable-tbody > tr > td) {
  padding: 1rem;
  color: #495057;
}

:deep(.services-table .p-datatable-tbody > tr:hover) {
  background-color: #f8f9fa;
}

:deep(.services-table.p-datatable-striped .p-datatable-tbody > tr:nth-child(odd)) {
  background-color: #fafbfc;
}

.service-description {
  font-weight: 500;
  color: var(--primary-color, #3A506B);
}

.service-qty,
.service-price,
.service-total {
  color: #495057;
  font-weight: 500;
}

.service-total {
  color: var(--secondary-color, #5BC0BE);
  font-weight: 600;
}

/* ------- FINANCIAL SECTION ------- */

.financial-section {
  padding: 2rem;
}

/* ------- METADATA ------- */

.metadata-section {
  padding: 2rem;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.metadata-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid var(--secondary-color, #5BC0BE);
}

.metadata-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  color: var(--secondary-color, #5BC0BE);
  flex-shrink: 0;
}

.metadata-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.metadata-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6C757D;
}

.metadata-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
}

.quote-id {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  word-break: break-all;
}

/* ================================================================
   RESPONSIVE DESIGN
   ================================================================ */

@media (max-width: 768px) {
  .quote-detail-page {
    padding: 1rem;
  }

  .quote-detail-page__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-left {
    flex-direction: column;
    min-width: auto;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .detail-section {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.125rem;
  }

  .info-cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .info-card {
    padding: 1rem;
  }

  .card-body {
    gap: 0.5rem;
  }

  .organizer-body {
    flex-direction: column;
    align-items: flex-start;
  }

  .metadata-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  :deep(.services-table .p-datatable-thead > tr > th) {
    padding: 0.75rem;
    font-size: 0.875rem;
  }

  :deep(.services-table .p-datatable-tbody > tr > td) {
    padding: 0.75rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .quote-detail-page {
    padding: 0.75rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .detail-section {
    padding: 1rem;
    border-radius: 8px;
  }

  .info-cards-grid {
    gap: 0.75rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .service-badge {
    align-self: flex-start;
  }

  .action-btn {
    min-width: 100px;
    font-size: 0.875rem;
  }
}
</style>
