<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :header="$t('quotes.preview.title')"
    :modal="true"
    :closable="true"
    :dismissableMask="true"
    class="quote-preview-dialog"
    :style="{ width: '90vw', maxWidth: '900px' }"
  >
    <div class="preview-content">
      <!-- Header con información del cliente y organizador -->
      <div class="preview-header">
        <div class="client-info">
          <h2 class="quotation-title">{{ $t('quotes.preview.quotation') }}</h2>

          <div class="info-block">
            <span class="info-label">{{ $t('quotes.preview.for') }}:</span>
            <p class="client-name">{{ quote.customer.name }}</p>
            <p class="client-contact">{{ quote.customer.email }}</p>
          </div>

          <div class="info-block">
            <span class="info-label">{{ $t('quotes.preview.event') }}:</span>
            <p class="event-name">{{ quote.event.name || $t(`events.types.${quote.event.type.toLowerCase()}`) }}</p>
            <p class="event-details">
              {{ $t('quotes.preview.date') }}: {{ formatDate(quote.event.date) }}
            </p>
            <p class="event-details">
              {{ $t('quotes.preview.location') }}: {{ quote.event.location }}
            </p>
            <p class="event-details">
              {{ $t('quotes.preview.guests') }}: {{ quote.event.numberOfGuests }}
            </p>
          </div>
        </div>

        <div class="organizer-info">
          <Avatar
            :image="quote.organizer.avatar"
            :label="quote.organizer.name.charAt(0)"
            size="xlarge"
            shape="circle"
            class="organizer-avatar"
          />
          <p class="organizer-name">{{ quote.organizer.name }}</p>
          <p class="organizer-role">{{ quote.organizer.role }}</p>
          <p class="organizer-contact">{{ $t('quotes.preview.tel') }}: {{ quote.organizer.phone }}</p>
        </div>
      </div>

      <!-- Tabla de servicios -->
      <div class="preview-services">
        <DataTable :value="quote.services" class="services-preview-table">
          <Column field="description" :header="$t('quotes.services.description')"></Column>
          <Column field="quantity" :header="$t('quotes.services.quantity')" style="width: 100px"></Column>
          <Column field="unitPrice" :header="$t('quotes.services.unitPrice')" style="width: 150px">
            <template #body="{ data }">
              {{ formatCurrency(data.unitPrice) }}
            </template>
          </Column>
          <Column field="totalPrice" :header="$t('quotes.services.total')" style="width: 150px">
            <template #body="{ data }">
              <span class="service-total">{{ formatCurrency(data.totalPrice) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Resumen financiero -->
      <div class="preview-financial">
        <div class="financial-row">
          <span class="financial-label">{{ $t('quotes.financial.subtotal') }}:</span>
          <span class="financial-value">{{ formatCurrency(financialTotals.subtotal) }}</span>
        </div>
        <div class="financial-row">
          <span class="financial-label">{{ $t('quotes.financial.vat') }} ({{ vatPercentage * 100 }}%):</span>
          <span class="financial-value">{{ formatCurrency(financialTotals.vat) }}</span>
        </div>
        <div class="financial-row total-row">
          <span class="financial-label">{{ $t('quotes.financial.total') }}:</span>
          <span class="financial-value total-value">{{ formatCurrency(financialTotals.total) }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="preview-footer">
        <Button
          :label="$t('quotes.preview.editAgain')"
          icon="pi pi-pencil"
          @click="handleEdit"
          outlined
          class="edit-again-btn"
        />
        <Button
          :label="$t('quotes.preview.saveAndSend')"
          icon="pi pi-send"
          @click="handleSaveAndSend"
          class="save-send-btn"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  quote: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:visible', 'edit', 'save-and-send']);

/* =========================================
   🔥 COMPUTED FINANCIALS
========================================= */
const vatPercentage = 0.18;

const financialTotals = computed(() => {
  if (!props.quote?.services) {
    return { subtotal: 0, vat: 0, total: 0 };
  }

  const subtotal = props.quote.services.reduce((sum, service) => {
    const serviceTotal = service.totalPrice || (service.quantity * service.unitPrice) || 0;
    return sum + serviceTotal;
  }, 0);

  const vat = subtotal * vatPercentage;
  const total = subtotal + vat;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    vat: Number(vat.toFixed(2)),
    total: Number(total.toFixed(2))
  };
});

// Métodos
const formatCurrency = (amount) => {
  return `${props.quote.currency || 'S/'} ${Number(amount).toFixed(2)}`;
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const handleEdit = () => {
  emit('edit');
};

const handleSaveAndSend = () => {
  emit('save-and-send');
};
</script>

<style scoped>
.quote-preview-dialog :deep(.p-dialog-header) {
  background-color: var(--primary-color, #3A506B);
  color: var(--accent-color, #6FFFE9);
}

.quote-preview-dialog :deep(.p-dialog-header-icon) {
  color: var(--accent-color, #6FFFE9);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
}

/* Header */
.preview-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #E9ECEF;
}

.quotation-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color, #3A506B);
  margin: 0 0 1.5rem 0;
}

.info-block {
  margin-bottom: 1.5rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6C757D;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.client-name,
.event-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #212529;
  margin: 0.5rem 0 0.25rem 0;
}

.client-contact,
.event-details {
  font-size: 0.9375rem;
  color: #6C757D;
  margin: 0.25rem 0;
}

/* Organizer */
.organizer-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background-color: #F8F9FA;
  border-radius: 8px;
}

.organizer-avatar {
  margin-bottom: 1rem;
  background-color: var(--primary-color, #3A506B);
}

.organizer-name {
  font-size: 1rem;
  font-weight: 600;
  color: #212529;
  margin: 0.5rem 0 0.25rem 0;
}

.organizer-role {
  font-size: 0.875rem;
  color: #6C757D;
  margin: 0.25rem 0;
}

.organizer-contact {
  font-size: 0.875rem;
  color: #495057;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
}

/* Services Table */
.preview-services {
  margin: 1rem 0;
}

.services-preview-table {
  border: 1px solid #E9ECEF;
  border-radius: 6px;
}

.services-preview-table :deep(.p-datatable-thead > tr > th) {
  background-color: #F8F9FA;
  color: #495057;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.service-total {
  font-weight: 600;
  color: #28A745;
}

/* Financial Summary */
.preview-financial {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background-color: #F8F9FA;
  border-radius: 8px;
  margin-left: auto;
  min-width: 350px;
}

.financial-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.financial-label {
  font-size: 0.9375rem;
  color: #495057;
  font-weight: 500;
}

.financial-value {
  font-size: 1rem;
  color: #212529;
  font-weight: 600;
}

.total-row {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid var(--secondary-color, #5BC0BE);
}

.total-row .financial-label {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary-color, #3A506B);
}

.total-value {
  font-size: 1.5rem;
  color: var(--secondary-color, #5BC0BE);
  font-weight: 700;
}

/* Footer */
.preview-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.edit-again-btn {
  color: #6C757D;
  border-color: #6C757D;
}

.edit-again-btn:hover {
  background-color: #6C757D;
  color: #FFFFFF;
}

.save-send-btn {
  background-color: var(--primary-color, #3A506B);
  border-color: var(--primary-color, #3A506B);
  color: var(--accent-color, #6FFFE9);
}

.save-send-btn:hover {
  background-color: var(--secondary-color, #5BC0BE);
  border-color: var(--secondary-color, #5BC0BE);
  color: #FFFFFF;
}

/* Responsive */
@media (max-width: 768px) {
  .preview-header {
    grid-template-columns: 1fr;
  }

  .organizer-info {
    order: -1;
  }

  .preview-financial {
    min-width: 100%;
    margin-left: 0;
  }

  .preview-footer {
    flex-direction: column;
  }

  .edit-again-btn,
  .save-send-btn {
    width: 100%;
  }
}
</style>
