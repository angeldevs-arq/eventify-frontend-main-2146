<template>
  <div class="quote-request-form">
    <div class="form-container">
      <!-- Header -->
      <header class="form-header">
        <div class="header-content">
          <i class="pi pi-file-edit header-icon"></i>
          <div>
            <h1 class="form-title">{{ $t('quotes.request.title') }}</h1>
            <p class="form-subtitle">{{ $t('quotes.request.subtitle') }}</p>
          </div>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <ProgressSpinner />
        <p class="loading-text">{{ $t('common.loading') }}</p>
      </div>

      <!-- Form Content -->
      <form v-else @submit.prevent="submitQuoteRequest" class="quote-form-content">
        <!-- Customer Information -->
        <section class="form-section">
          <h2 class="section-title">
            <i class="pi pi-user"></i>
            {{ $t('quotes.form.customerInfo') }}
          </h2>

          <div class="form-grid">
            <div class="form-field full-width">
              <label for="customerName">{{ $t('quotes.form.customerName') }} *</label>
              <InputText
                id="customerName"
                v-model="formData.customerName"
                :placeholder="$t('quotes.form.customerNamePlaceholder')"
                :class="{ 'p-invalid': submitted && !formData.customerName }"
                disabled
              />
              <small v-if="submitted && !formData.customerName" class="p-error">
                {{ $t('quotes.validation.customerNameRequired') }}
              </small>
            </div>

            <div class="form-field">
              <label for="customerEmail">{{ $t('quotes.form.customerEmail') }}</label>
              <InputText
                id="customerEmail"
                v-model="formData.customerEmail"
                type="email"
                :placeholder="$t('quotes.form.customerEmailPlaceholder')"
                disabled
              />
            </div>

            <div class="form-field">
              <label for="customerPhone">{{ $t('quotes.form.customerPhone') }}</label>
              <InputText
                id="customerPhone"
                v-model="formData.customerPhone"
                :placeholder="$t('quotes.form.customerPhonePlaceholder')"
                disabled
              />
            </div>
          </div>
        </section>

        <!-- Event Information -->
        <section class="form-section">
          <h2 class="section-title">
            <i class="pi pi-calendar-plus"></i>
            {{ $t('quotes.form.eventInfo') }}
          </h2>

          <div class="form-grid">
            <div class="form-field">
              <label for="eventType">{{ $t('quotes.form.eventType') }} *</label>
              <Dropdown
                id="eventType"
                v-model="formData.eventType"
                :options="eventTypeOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('quotes.form.selectEventType')"
                :class="{ 'p-invalid': submitted && !formData.eventType }"
              />
              <small v-if="submitted && !formData.eventType" class="p-error">
                {{ $t('quotes.validation.eventTypeRequired') }}
              </small>
            </div>

            <div class="form-field">
              <label for="eventDate">{{ $t('quotes.form.eventDate') }} *</label>
              <Calendar
                id="eventDate"
                v-model="formData.eventDate"
                dateFormat="dd/mm/yy"
                :placeholder="$t('quotes.form.selectDate')"
                :minDate="minDate"
                :class="{ 'p-invalid': submitted && !formData.eventDate }"
                showIcon
              />
              <small v-if="submitted && !formData.eventDate" class="p-error">
                {{ $t('quotes.validation.eventDateRequired') }}
              </small>
            </div>

            <div class="form-field">
              <label for="guestQuantity">{{ $t('quotes.form.numberOfGuests') }}</label>
              <InputNumber
                id="guestQuantity"
                v-model="formData.guestQuantity"
                :min="0"
                :placeholder="$t('quotes.form.numberOfGuestsPlaceholder')"
              />
            </div>

            <div class="form-field">
              <label for="location">{{ $t('quotes.form.location') }}</label>
              <InputText
                id="location"
                v-model="formData.location"
                :placeholder="$t('quotes.form.locationPlaceholder')"
              />
            </div>

            <div class="form-field full-width">
              <label for="description">{{ $t('quotes.form.description') }}</label>
              <Textarea
                id="description"
                v-model="formData.description"
                rows="4"
                :placeholder="$t('quotes.form.descriptionPlaceholder')"
              />
            </div>
          </div>
        </section>

        <!-- 🔥 SERVICES REQUEST SECTION -->
        <section class="form-section">
          <h2 class="section-title">
            <i class="pi pi-list"></i>
            {{ $t('quotes.request.servicesNeeded') }}
          </h2>
          <p class="section-description">
            {{ $t('quotes.request.servicesDescription') }}
          </p>

          <!-- Service Request Items -->
          <div class="service-requests-list">
            <div
              v-for="(service, index) in requestedServices"
              :key="index"
              class="service-request-item"
            >
              <div class="service-request-content">
                <div class="service-field">
                  <label>{{ $t('quotes.services.description') }} *</label>
                  <InputText
                    v-model="service.description"
                    :placeholder="$t('quotes.request.serviceDescriptionPlaceholder')"
                    :class="{ 'p-invalid': submitted && !service.description }"
                  />
                </div>

                <div class="service-field quantity-field">
                  <label>{{ $t('quotes.services.quantity') }}</label>
                  <InputNumber
                    v-model="service.quantity"
                    :min="1"
                    :placeholder="$t('quotes.request.quantityPlaceholder')"
                  />
                </div>

                <div class="service-actions">
                  <Button
                    type="button"
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    rounded
                    @click="removeService(index)"
                    :disabled="requestedServices.length === 1"
                    v-tooltip.top="$t('quotes.services.removeService')"
                  />
                </div>
              </div>

              <div class="service-notes">
                <label>{{ $t('quotes.request.serviceNotes') }}</label>
                <Textarea
                  v-model="service.notes"
                  rows="2"
                  :placeholder="$t('quotes.request.serviceNotesPlaceholder')"
                />
              </div>
            </div>
          </div>

          <!-- Add Service Button -->
          <div class="add-service-container">
            <Button
              type="button"
              :label="$t('quotes.request.addAnotherService')"
              icon="pi pi-plus"
              severity="secondary"
              outlined
              @click="addService"
            />
          </div>
        </section>

        <!-- Budget Range (Optional) -->
        <section class="form-section">
          <h2 class="section-title">
            <i class="pi pi-dollar"></i>
            {{ $t('quotes.request.budgetRange') }}
          </h2>
          <p class="section-description">
            {{ $t('quotes.request.budgetDescription') }}
          </p>

          <div class="form-grid">
            <div class="form-field">
              <label for="minBudget">{{ $t('quotes.request.minBudget') }}</label>
              <InputNumber
                id="minBudget"
                v-model="formData.minBudget"
                mode="currency"
                currency="PEN"
                locale="es-PE"
                :min="0"
              />
            </div>

            <div class="form-field">
              <label for="maxBudget">{{ $t('quotes.request.maxBudget') }}</label>
              <InputNumber
                id="maxBudget"
                v-model="formData.maxBudget"
                mode="currency"
                currency="PEN"
                locale="es-PE"
                :min="0"
              />
            </div>
          </div>
        </section>

        <!-- Form Actions -->
        <div class="form-actions">
          <Button
            type="button"
            :label="$t('common.cancel')"
            icon="pi pi-times"
            severity="secondary"
            outlined
            @click="handleCancel"
            :disabled="isSubmitting"
          />
          <Button
            type="submit"
            :label="$t('quotes.request.submit')"
            icon="pi pi-send"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          />
        </div>
      </form>
    </div>
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
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Tooltip from 'primevue/tooltip';

import { QuoteApiService } from '../../infrastructure/services/quote-api.service.js';
import { ProfileApiService } from '@/profile-management/infrastructure/services/profile-api.service.js';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';

/* =========================================
   COMPOSABLES
========================================= */
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();
const { user, restoreSession } = useAuth();

/* =========================================
   STATE
========================================= */
const isLoading = ref(true);
const isSubmitting = ref(false);
const submitted = ref(false);

const formData = ref({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  eventType: '',
  eventDate: null,
  guestQuantity: 0,
  location: '',
  description: '',
  minBudget: null,
  maxBudget: null
});

// 🔥 REQUESTED SERVICES
const requestedServices = ref([
  {
    description: '',
    quantity: 1,
    notes: ''
  }
]);

/* =========================================
   COMPUTED
========================================= */
const minDate = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
});

const eventTypeOptions = computed(() => [
  { label: t('events.types.wedding'), value: 'WEDDING' },
  { label: t('events.types.birthday'), value: 'BIRTHDAY' },
  { label: t('events.types.corporate'), value: 'CORPORATE' },
  { label: t('events.types.anniversary'), value: 'ANNIVERSARY' },
  { label: t('events.types.graduation'), value: 'GRADUATION' },
  { label: t('events.types.other'), value: 'OTHER' }
]);

const isFormValid = computed(() => {
  const hasBasicInfo =
    formData.value.customerName?.trim().length > 0 &&
    formData.value.eventType &&
    formData.value.eventDate instanceof Date;

  const hasValidServices = requestedServices.value.some(
    service => service.description?.trim().length > 0
  );

  return hasBasicInfo && hasValidServices;
});

/* =========================================
   🔥 SERVICES MANAGEMENT
========================================= */
const addService = () => {
  requestedServices.value.push({
    description: '',
    quantity: 1,
    notes: ''
  });
};

const removeService = index => {
  if (requestedServices.value.length > 1) {
    requestedServices.value.splice(index, 1);
  }
};

/* =========================================
   🔥 LOAD USER DATA
========================================= */
const loadUserData = async () => {
  try {
    console.log('👤 Loading user data...');

    if (!user.value) {
      await restoreSession();
    }

    const profile = await ProfileApiService.getProfileById(user.value.id);

    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

    formData.value.customerName =
      fullName ||
      profile.username ||
      user.value.username ||
      '';

    formData.value.customerEmail = profile.email || user.value.email || '';
    formData.value.customerPhone = profile.phone || user.value.phone || '';

    console.log('✅ User data loaded:', {
      name: formData.value.customerName,
      email: formData.value.customerEmail
    });
  } catch (error) {
    console.error('Error loading user data:', error);

    if (user.value) {
      formData.value.customerName = user.value.username || 'Invitado';
      formData.value.customerEmail = user.value.email || '';
    }
  }
};

/* =========================================
   🔥 SUBMIT QUOTE REQUEST
========================================= */
const submitQuoteRequest = async () => {
  submitted.value = true;

  if (!isFormValid.value) {
    toast.add({
      severity: 'warn',
      summary: t('common.warning'),
      detail: t('quotes.validation.fillRequired'),
      life: 3000
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const organizerIdParam = route.params.organizerId || route.query.organizerId;
    const organizerId = organizerIdParam ? Number(organizerIdParam) : null;

    if (!organizerId || Number.isNaN(organizerId)) {
      console.error('organizerId no encontrado o inválido en la ruta', organizerIdParam);
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: 'No se encontró el organizador al que enviar la cotización.',
        life: 4000
      });
      isSubmitting.value = false;
      return;
    }

    // Para evitar el error "Total price cannot be negative" del backend,
    // enviamos un totalPrice mínimo fijo (luego el organizador lo ajustará).
    const payload = {
      title: `${formData.value.eventType} - ${formData.value.customerName}`,
      customerName: formData.value.customerName.trim(),
      eventType: formData.value.eventType,
      guestQuantity: formData.value.guestQuantity || 0,
      location: formData.value.location || '',
      totalPrice: 1,                 // 👈 mínimo válido (> 0)
      state: 'PENDING',              // 👈 requerido por CreateQuoteResource
      eventDate: formData.value.eventDate.toISOString(),
      organizerId,
      hostId: user.value.id
    };

    console.log('📤 Creando cotización con servicios solicitados:', {
      ...payload,
      requestedServices: requestedServices.value,
      servicesCount: requestedServices.value.filter(s => s.description?.trim()).length
    });

    const response = await QuoteApiService.createQuote(payload);

    console.log('✅ Quote creado exitosamente:', response);

    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('quotes.messages.requestSent'),
      life: 3000
    });

    setTimeout(() => {
      router.push({
        name: 'quote-detail',
        params: { id: response.quoteId || response.id }
      });
    }, 1000);
  } catch (error) {
    console.error('Error creating quote:', error);

    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: error.message || t('quotes.messages.requestError'),
      life: 5000
    });
  } finally {
    isSubmitting.value = false;
  }
};

/* =========================================
   CANCEL HANDLER
========================================= */
const handleCancel = () => {
  router.push({ name: 'quotes' });
};

/* =========================================
   LIFECYCLE
========================================= */
onMounted(async () => {
  isLoading.value = true;

  try {
    await loadUserData();
  } catch (error) {
    console.error('Error initializing form:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.quote-request-form {
  min-height: 100vh;
  background-color: #F8F9FA;
  padding: 2rem;
}

.form-container {
  max-width: 900px;
  margin: 0 auto;
}

/* ================================================================
   HEADER
   ================================================================ */

.form-header {
  background: linear-gradient(135deg, var(--primary-color, #3A506B) 0%, var(--secondary-color, #5BC0BE) 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  font-size: 3rem;
  opacity: 0.9;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
}

/* ================================================================
   LOADING
   ================================================================ */

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 0 0 12px 12px;
  gap: 1rem;
}

.loading-text {
  font-size: 1rem;
  color: #6C757D;
  margin: 0;
}

/* ================================================================
   FORM CONTENT
   ================================================================ */

.quote-form-content {
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  padding: 2rem;
  border-bottom: 1px solid #E9ECEF;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color, #3A506B);
  margin: 0 0 1rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--secondary-color, #5BC0BE);
}

.section-title i {
  font-size: 1.5rem;
  color: var(--secondary-color, #5BC0BE);
}

.section-description {
  font-size: 0.9375rem;
  color: #6C757D;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

/* ================================================================
   FORM GRID
   ================================================================ */

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

.form-field .p-error {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* ================================================================
   🔥 SERVICE REQUESTS LIST
   ================================================================ */

.service-requests-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.service-request-item {
  background: #F8F9FA;
  border: 2px solid #E9ECEF;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
}

.service-request-item:hover {
  border-color: var(--secondary-color, #5BC0BE);
  box-shadow: 0 2px 8px rgba(91, 192, 190, 0.15);
}

.service-request-content {
  display: grid;
  grid-template-columns: 1fr auto 50px;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
}

.service-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.service-field label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9375rem;
}

.quantity-field {
  width: 120px;
}

.service-actions {
  display: flex;
  align-items: flex-end;
  padding-bottom: 0.25rem;
}

.service-notes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.service-notes label {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
}

.add-service-container {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
}

/* ================================================================
   FORM ACTIONS
   ================================================================ */

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #F8F9FA;
  border-radius: 0 0 12px 12px;
}

/* ================================================================
   RESPONSIVE
   ================================================================ */

@media (max-width: 768px) {
  .quote-request-form {
    padding: 1rem;
  }

  .form-header {
    padding: 1.5rem;
    border-radius: 8px 8px 0 0;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .service-request-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .quantity-field {
    width: 100%;
  }

  .service-actions {
    justify-content: flex-end;
    padding-bottom: 0;
  }

  .form-actions {
    flex-direction: column-reverse;
    padding: 1rem;
  }

  .form-actions button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .quote-request-form {
    padding: 0.5rem;
  }

  .form-header {
    padding: 1rem;
  }

  .header-icon {
    font-size: 2rem;
  }

  .form-title {
    font-size: 1.25rem;
  }

  .form-subtitle {
    font-size: 0.875rem;
  }

  .form-section {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.125rem;
  }
}
</style>
