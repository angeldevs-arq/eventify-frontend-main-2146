<!-- src/bounded-contexts/quote-management/presentation/components/services-table.vue -->

<template>
  <section class="services-table">
    <div class="services-table__header">
      <h3 class="section-title">{{ $t('quotes.services.title') }}</h3>
      <Button
        :label="$t('quotes.services.addService')"
        icon="pi pi-plus"
        @click="handleAddService"
        :disabled="disabled"
        class="add-service-btn"
        outlined
      />
    </div>

    <DataTable
      :value="services"
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

      <Column field="total" :header="$t('quotes.services.total')" style="width: 150px">
        <template #body="{ data }">
          <span class="service-total">{{ formatCurrency(data.total) }}</span>
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
            :disabled="disabled"
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

    <!-- Diálogo para agregar servicio -->
    <Dialog
      v-model:visible="showAddDialog"
      :header="$t('quotes.services.addNewService')"
      :modal="true"
      :closable="true"
      class="add-service-dialog"
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
      </div>

      <template #footer>
        <Button
          :label="$t('common.cancel')"
          icon="pi pi-times"
          @click="showAddDialog = false"
          text
        />
        <Button
          :label="$t('common.add')"
          icon="pi pi-check"
          @click="confirmAddService"
          :disabled="!isNewServiceValid"
        />
      </template>
    </Dialog>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { ServiceItem } from '../../domain/model';

const { t } = useI18n();

const props = defineProps({
  services: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  currency: {
    type: String,
    default: 'S/.'
  }
});

const emit = defineEmits(['update:services', 'service-added', 'service-removed', 'service-updated']);

// Estado reactivo
const showAddDialog = ref(false);
const newService = ref({
  description: '',
  quantity: 1,
  unitPrice: 0
});

// Computed
const isNewServiceValid = computed(() => {
  return newService.value.description.trim().length > 0 &&
    newService.value.quantity > 0 &&
    newService.value.unitPrice >= 0;
});

// Métodos
const formatCurrency = (value) => {
  return `${props.currency} ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const handleAddService = () => {
  showAddDialog.value = true;
  resetNewService();
};

const resetNewService = () => {
  newService.value = {
    description: '',
    quantity: 1,
    unitPrice: 0
  };
};

const confirmAddService = () => {
  if (!isNewServiceValid.value) return;

  const service = new ServiceItem({
    description: newService.value.description,
    quantity: newService.value.quantity,
    unitPrice: newService.value.unitPrice,
    currency: props.currency
  });

  const updatedServices = [...props.services, service];
  emit('update:services', updatedServices);
  emit('service-added', service);

  showAddDialog.value = false;
  resetNewService();
};

const handleRemoveService = (index) => {
  const service = props.services[index];
  const updatedServices = props.services.filter((_, i) => i !== index);

  emit('update:services', updatedServices);
  emit('service-removed', service);
};

const handleServiceUpdate = (index) => {
  const service = props.services[index];
  emit('service-updated', { index, service });
};
</script>

<style scoped>
.services-table {
  background: #FFFFFF;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.services-table__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
  margin: 0;
}

.add-service-btn {
  color: var(--secondary-color, #5BC0BE);
  border-color: var(--secondary-color, #5BC0BE);
}

.add-service-btn:hover {
  background-color: var(--secondary-color, #5BC0BE);
  color: #FFFFFF;
}

/* Tabla */
.services-data-table {
  border: 1px solid #E9ECEF;
  border-radius: 6px;
}

:deep(.p-datatable-thead > tr > th) {
  background-color: #F8F9FA;
  color: #495057;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1rem;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 0.75rem 1rem;
}

.service-input {
  width: 100%;
}

.service-total {
  font-weight: 600;
  color: #28A745;
  font-size: 1rem;
}

.remove-service-btn {
  color: #DC3545;
}

.remove-service-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

/* Empty state */
.empty-services {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
