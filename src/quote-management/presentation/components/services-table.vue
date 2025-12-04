<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dialog from 'primevue/dialog';
import { ServiceItemApiService } from '../../infrastructure/services/service-item-api.service.js';
import { ServiceItem } from '../../domain/model/service-item.entity.js';

const props = defineProps({
  quoteId: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  currency: {
    type: String,
    default: 'S/'
  }
});

const emit = defineEmits(['update:services', 'service-added', 'service-removed']);

const { t } = useI18n();
const toast = useToast();

// Estado reactivo
const services = ref([]);
const loading = ref(false);
const showAddDialog = ref(false);
const newService = ref({
  description: '',
  quantity: 1,
  unitPrice: 0
});

// Computed
const total = computed(() => {
  return services.value.reduce((sum, service) => {
    return sum + (service.totalPrice || 0);
  }, 0);
});

// Métodos
const formatCurrency = (amount) => {
  return `${props.currency} ${Number(amount).toFixed(2)}`;
};

const calculateServiceTotal = (service) => {
  return (service.quantity || 0) * (service.unitPrice || 0);
};

const loadServices = async () => {
  if (!props.quoteId) return;

  loading.value = true;
  try {
    const data = await ServiceItemApiService.getServiceItemsByQuote(props.quoteId);
    services.value = data.map(item => ServiceItem.fromBackend(item));
    emit('update:services', services.value);
  } catch (error) {
    console.error('Error loading services:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('quotes.services.loadError'),
      life: 5000
    });
    services.value = [];
  } finally {
    loading.value = false;
  }
};

const handleAddService = () => {
  newService.value = {
    description: '',
    quantity: 1,
    unitPrice: 0
  };
  showAddDialog.value = true;
};

const confirmAddService = async () => {
  if (!newService.value.description?.trim()) {
    toast.add({
      severity: 'warn',
      summary: t('common.warning'),
      detail: t('quotes.services.descriptionRequired'),
      life: 3000
    });
    return;
  }

  if (newService.value.unitPrice <= 0) {
    toast.add({
      severity: 'warn',
      summary: t('common.warning'),
      detail: t('quotes.services.priceRequired'),
      life: 3000
    });
    return;
  }

  loading.value = true;
  try {
    const createdItem = await ServiceItemApiService.createServiceItemAuto(
      props.quoteId,
      newService.value.description,
      newService.value.quantity,
      newService.value.unitPrice
    );

    const newServiceItem = ServiceItem.fromBackend(createdItem);
    services.value.push(newServiceItem);

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.services.addedSuccessfully'),
      life: 3000
    });

    showAddDialog.value = false;
    emit('update:services', services.value);
    emit('service-added', newServiceItem);
  } catch (error) {
    console.error('Error adding service:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('quotes.services.addError'),
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

const handleServiceUpdate = async (index) => {
  const service = services.value[index];

  if (!service.id) {
    return;
  }

  // Recalcular total
  service.totalPrice = calculateServiceTotal(service);

  loading.value = true;
  try {
    await ServiceItemApiService.updateServiceItemAuto(
      props.quoteId,
      service.id,
      {
        description: service.description,
        quantity: service.quantity,
        unitPrice: service.unitPrice
      }
    );

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.services.updatedSuccessfully'),
      life: 2000
    });

    emit('update:services', services.value);
  } catch (error) {
    console.error('Error updating service:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('quotes.services.updateError'),
      life: 5000
    });

    await loadServices();
  } finally {
    loading.value = false;
  }
};

const handleRemoveService = async (index) => {
  const service = services.value[index];

  if (!service.id) {
    services.value.splice(index, 1);
    emit('update:services', services.value);
    return;
  }

  loading.value = true;
  try {
    await ServiceItemApiService.deleteServiceItem(props.quoteId, service.id);

    services.value.splice(index, 1);

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.services.deletedSuccessfully'),
      life: 3000
    });

    emit('update:services', services.value);
    emit('service-removed', service.id);
  } catch (error) {
    console.error('Error removing service:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('quotes.services.deleteError'),
      life: 5000
    });
  } finally {
    loading.value = false;
  }
};

// Exponer métodos para uso externo
defineExpose({
  loadServices,
  getTotal: () => total.value
});

// Cargar servicios al montar si hay quoteId
if (props.quoteId) {
  loadServices();
}
</script>

<template>
  <section class="services-table">
    <div class="services-table__header">
      <h3 class="section-title">{{ $t('quotes.services.title') }}</h3>
      <Button
        :label="$t('quotes.services.addService')"
        icon="pi pi-plus"
        @click="handleAddService"
        :disabled="disabled || loading"
        class="add-service-btn"
        outlined
      />
    </div>

    <DataTable
      :value="services"
      :loading="loading"
      class="services-data-table"
      responsiveLayout="scroll"
      :showGridlines="false"
      stripedRows
    >
      <Column field="description" :header="$t('quotes.services.description')" style="min-width: 200px">
        <template #body="{ data, index }">
          <InputText
            v-model="data.description"
            :placeholder="$t('quotes.services.descriptionPlaceholder')"
            :disabled="disabled"
            @blur="handleServiceUpdate(index)"
            class="service-input"
          />
        </template>
      </Column>

      <Column field="quantity" :header="$t('quotes.services.quantity')" style="width: 120px">
        <template #body="{ data, index }">
          <InputNumber
            v-model="data.quantity"
            :min="1"
            :max="9999"
            :disabled="disabled"
            @blur="handleServiceUpdate(index)"
            class="service-input"
            showButtons
            buttonLayout="horizontal"
            decrementButtonClass="p-button-text"
            incrementButtonClass="p-button-text"
          />
        </template>
      </Column>

      <Column field="unitPrice" :header="$t('quotes.services.unitPrice')" style="width: 150px">
        <template #body="{ data, index }">
          <InputNumber
            v-model="data.unitPrice"
            :min="0"
            :minFractionDigits="2"
            :maxFractionDigits="2"
            :disabled="disabled"
            @blur="handleServiceUpdate(index)"
            class="service-input"
            mode="currency"
            currency="PEN"
            locale="es-PE"
          />
        </template>
      </Column>

      <Column field="totalPrice" :header="$t('quotes.services.total')" style="width: 150px">
        <template #body="{ data }">
          <span class="service-total">{{ formatCurrency(data.totalPrice) }}</span>
        </template>
      </Column>

      <Column style="width: 80px" v-if="!disabled">
        <template #body="{ index }">
          <Button
            icon="pi pi-times"
            severity="danger"
            text
            rounded
            @click="handleRemoveService(index)"
            :disabled="disabled || loading"
            class="remove-service-btn"
          />
        </template>
      </Column>

      <template #empty>
        <div class="empty-services">
          <i class="pi pi-shopping-cart empty-icon"></i>
          <p>{{ $t('quotes.services.noServices') }}</p>
        </div>
      </template>
    </DataTable>

    <!-- Total -->
    <div class="services-total">
      <span class="total-label">{{ $t('quotes.services.totalAmount') }}:</span>
      <span class="total-amount">{{ formatCurrency(total) }}</span>
    </div>

    <!-- Diálogo para agregar servicio -->
    <Dialog
      v-model:visible="showAddDialog"
      :header="$t('quotes.services.addNewService')"
      :modal="true"
      :closable="true"
      class="add-service-dialog"
      :style="{ width: '500px' }"
    >
      <div class="dialog-content">
        <div class="form-field">
          <label for="service-description">{{ $t('quotes.services.description') }}</label>
          <InputText
            id="service-description"
            v-model="newService.description"
            :placeholder="$t('quotes.services.descriptionPlaceholder')"
            class="w-full"
          />
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="service-quantity">{{ $t('quotes.services.quantity') }}</label>
            <InputNumber
              id="service-quantity"
              v-model="newService.quantity"
              :min="1"
              showButtons
              class="w-full"
            />
          </div>

          <div class="form-field">
            <label for="service-price">{{ $t('quotes.services.unitPrice') }}</label>
            <InputNumber
              id="service-price"
              v-model="newService.unitPrice"
              :min="0"
              :minFractionDigits="2"
              mode="currency"
              currency="PEN"
              locale="es-PE"
              class="w-full"
            />
          </div>
        </div>

        <div class="calculated-total">
          <span>{{ $t('quotes.services.total') }}:</span>
          <strong>{{ formatCurrency(newService.quantity * newService.unitPrice) }}</strong>
        </div>
      </div>

      <template #footer>
        <Button
          :label="$t('common.cancel')"
          icon="pi pi-times"
          @click="showAddDialog = false"
          text
        />
        <Button
          :label="$t('common.save')"
          icon="pi pi-check"
          @click="confirmAddService"
          :loading="loading"
        />
      </template>
    </Dialog>
  </section>
</template>

<style scoped>
.services-table {
  width: 100%;
}

.services-table__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2D3748;
  margin: 0;
}

.add-service-btn {
  border-color: var(--primary-color, #3A506B);
  color: var(--primary-color, #3A506B);
}

.add-service-btn:hover {
  background-color: var(--primary-color, #3A506B);
  color: white;
}

.services-data-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.service-input {
  width: 100%;
}

.service-total {
  font-weight: 600;
  color: #28A745;
}

.remove-service-btn {
  color: #DC2626;
}

.empty-services {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: #9CA3AF;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.services-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
}

.total-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: #495057;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #28A745;
}

/* Dialog */
.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.calculated-total {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #F3F4F6;
  border-radius: 6px;
  font-size: 1.125rem;
}

.calculated-total strong {
  color: #28A745;
}

/* Responsive */
@media (max-width: 768px) {
  .services-table__header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .add-service-btn {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
