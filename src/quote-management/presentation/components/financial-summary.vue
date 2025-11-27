<template>
  <section class="financial-summary">
    <h3 class="financial-summary__title">{{ $t('quotes.financial.title') }}</h3>

    <div class="financial-summary__content">
      <!-- Subtotal -->
      <div class="summary-row">
        <span class="summary-label">{{ $t('quotes.financial.subtotal') }}:</span>
        <span class="summary-value">{{ formatCurrency(subtotal) }}</span>
      </div>

      <!-- VAT -->
      <div class="summary-row vat-row">
        <span class="summary-label">
          {{ $t('quotes.financial.vat') }} ({{ vatPercentage }}%):
        </span>
        <span class="summary-value">{{ formatCurrency(vat) }}</span>
      </div>

      <!-- Divider -->
      <div class="summary-divider"></div>

      <!-- Total -->
      <div class="summary-row total-row">
        <span class="summary-label total-label">{{ $t('quotes.financial.total') }}:</span>
        <span class="summary-value total-value">{{ formatCurrency(total) }}</span>
      </div>
    </div>

    <!-- Información adicional -->
    <div v-if="showDetails" class="financial-summary__details">
      <div class="detail-item">
        <i class="pi pi-shopping-cart"></i>
        <span>{{ serviceCount }} {{ $t('quotes.financial.services') }}</span>
      </div>
      <div v-if="showPaymentTerms" class="detail-item payment-terms">
        <i class="pi pi-info-circle"></i>
        <span>{{ $t('quotes.financial.paymentTerms') }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  subtotal: {
    type: Number,
    default: 0
  },
  vat: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  vatPercentage: {
    type: Number,
    default: 18
  },
  currency: {
    type: String,
    default: 'S/.'
  },
  serviceCount: {
    type: Number,
    default: 0
  },
  showDetails: {
    type: Boolean,
    default: true
  },
  showPaymentTerms: {
    type: Boolean,
    default: false
  }
});

// Métodos
const formatCurrency = (value) => {
  return `${props.currency} ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};
</script>

<style scoped>
.financial-summary {
  background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #E9ECEF;
}

.financial-summary__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--secondary-color, #5BC0BE);
}

.financial-summary__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Filas del resumen */
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.summary-label {
  font-size: 0.9375rem;
  color: #495057;
  font-weight: 500;
}

.summary-value {
  font-size: 1rem;
  color: #212529;
  font-weight: 600;
}

/* Fila VAT */
.vat-row {
  background-color: rgba(91, 192, 190, 0.05);
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0.25rem 0;
}

.vat-row .summary-label {
  color: #6C757D;
}

.vat-row .summary-value {
  color: var(--secondary-color, #5BC0BE);
}

/* Divider */
.summary-divider {
  height: 2px;
  background: linear-gradient(to right, #E9ECEF, var(--secondary-color, #5BC0BE), #E9ECEF);
  margin: 0.5rem 0;
}

/* Fila Total */
.total-row {
  background-color: var(--primary-color, #3A506B);
  padding: 1rem;
  border-radius: 6px;
  margin-top: 0.5rem;
}

.total-label {
  font-size: 1.125rem;
  color: var(--accent-color, #6FFFE9);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.total-value {
  font-size: 1.5rem;
  color: #FFFFFF;
  font-weight: 700;
}

/* Detalles adicionales */
.financial-summary__details {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #E9ECEF;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6C757D;
}

.detail-item i {
  color: var(--secondary-color, #5BC0BE);
  font-size: 1rem;
}

.payment-terms {
  background-color: #FFF3CD;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border-left: 3px solid #FFC107;
  color: #856404;
}

.payment-terms i {
  color: #FFC107;
}

/* Animación sutil */
.total-row {
  transition: transform 0.2s ease;
}

.total-row:hover {
  transform: scale(1.02);
}

/* Responsive */
@media (max-width: 768px) {
  .financial-summary {
    padding: 1rem;
  }

  .financial-summary__title {
    font-size: 1rem;
  }

  .summary-label {
    font-size: 0.875rem;
  }

  .summary-value {
    font-size: 0.9375rem;
  }

  .total-label {
    font-size: 1rem;
  }

  .total-value {
    font-size: 1.25rem;
  }
}
</style>
