<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import QuoteStateBadge from '/src/quote-management/presentation/pages/QuoteStateBadge.vue';

const { t } = useI18n();

const props = defineProps({
  canSave: {
    type: Boolean,
    default: false
  },
  canPreview: {
    type: Boolean,
    default: false
  },
  canSend: {
    type: Boolean,
    default: false
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  isSending: {
    type: Boolean,
    default: false
  },
  quoteState: {
    type: String,
    default: null
  },
  lastUpdate: {
    type: [Date, String],
    default: null
  },
  showInfo: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['save', 'preview', 'send', 'cancel']);

// Computed
const formattedDate = computed(() => {
  if (!props.lastUpdate) return '';
  const date = new Date(props.lastUpdate);
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Métodos
const handleSave = () => {
  emit('save');
};

const handlePreview = () => {
  emit('preview');
};

const handleSend = () => {
  emit('send');
};

const handleCancel = () => {
  emit('cancel');
};
</script>
<template>
  <aside class="quote-actions">
    <h3 class="quote-actions__title">{{ $t('quotes.actions.title') }}</h3>

    <div class="quote-actions__buttons">
      <!-- Save -->
      <Button
        :label="$t('quotes.actions.save')"
        icon="pi pi-save"
        :disabled="!canSave || isSaving"
        :loading="isSaving"
        @click="handleSave"
        class="action-button save-button"
      />

      <!-- Preview -->
      <Button
        :label="$t('quotes.actions.preview')"
        icon="pi pi-eye"
        :disabled="!canPreview"
        @click="handlePreview"
        class="action-button preview-button"
        outlined
      />

      <!-- Send -->
      <Button
        :label="$t('quotes.actions.send')"
        icon="pi pi-send"
        :disabled="!canSend || isSending"
        :loading="isSending"
        @click="handleSend"
        class="action-button send-button"
        outlined
      />

      <!-- Cancel -->
      <Button
        :label="$t('quotes.actions.cancel')"
        icon="pi pi-times"
        @click="handleCancel"
        class="action-button cancel-button"
        severity="danger"
        outlined
      />
    </div>

    <!-- Estado de la cotización -->
    <div v-if="quoteState" class="quote-actions__state">
      <span class="state-label">{{ $t('quotes.actions.currentState') }}:</span>
      <QuoteStateBadge :state="quoteState" />
    </div>

    <!-- Información adicional -->
    <div v-if="showInfo" class="quote-actions__info">
      <div class="info-item">
        <i class="pi pi-calendar"></i>
        <span>{{ $t('quotes.actions.lastUpdate') }}: {{ formattedDate }}</span>
      </div>
    </div>
  </aside>
</template>
<style scoped>
.quote-actions {
  position: sticky;
  top: 2rem;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.quote-actions__title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #E9ECEF;
}

.quote-actions__buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-button {
  width: 100%;
  justify-content: center;
  font-weight: 500;
}

.save-button {
  background-color: var(--primary-color, #3A506B);
  border-color: var(--primary-color, #3A506B);
  color: var(--accent-color, #6FFFE9);
}

.save-button:hover:not(:disabled) {
  background-color: var(--secondary-color, #5BC0BE);
  border-color: var(--secondary-color, #5BC0BE);
  color: #FFFFFF;
}

.preview-button {
  color: var(--secondary-color, #5BC0BE);
  border-color: var(--secondary-color, #5BC0BE);
}

.preview-button:hover:not(:disabled) {
  background-color: var(--secondary-color, #5BC0BE);
  color: #FFFFFF;
}

.send-button {
  color: #28A745;
  border-color: #28A745;
}

.send-button:hover:not(:disabled) {
  background-color: #28A745;
  color: #FFFFFF;
}

.cancel-button {
  margin-top: 0.5rem;
}

/* Estado */
.quote-actions__state {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E9ECEF;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.state-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6C757D;
}

/* Información adicional */
.quote-actions__info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E9ECEF;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6C757D;
}

.info-item i {
  color: var(--secondary-color, #5BC0BE);
}

/* Responsive */
@media (max-width: 768px) {
  .quote-actions {
    position: relative;
    top: 0;
    margin-bottom: 1rem;
  }

  .quote-actions__buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .action-button {
    flex: 1 1 calc(50% - 0.375rem);
    min-width: 120px;
  }

  .cancel-button {
    margin-top: 0;
    flex-basis: 100%;
  }
}
</style>
