<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';
import { QuoteApiService } from '@/quote-management/infrastructure/services/quote-api.service.js';
import { ServiceItemApiService } from '@/quote-management/infrastructure/services/service-item-api.service.js';
import { ProfileApiService } from '@/profile-management/infrastructure/services/profile-api.service.js';
import { Quote } from '@/quote-management/domain/model/quote.entity.js';
import { ServiceItem } from '@/quote-management/domain/model/service-item.entity.js';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const toast = useToast();
const { user } = useAuth();

// Props del organizador
const organizerId = ref(route.params.organizerId);
const organizerProfile = ref(null);
const hostProfile = ref(null); // Perfil del Host (usuario actual)
const loading = ref(false);
const submitting = ref(false);

// Formulario
const form = ref({
  title: '',
  eventType: '',
  eventDate: null,
  guestQuantity: 50,
  location: '',
  additionalNotes: ''
});

// Servicios solicitados
const requestedServices = ref([]);
const showServiceDialog = ref(false);
const newService = ref({
  description: '',
  quantity: 1
});

// Validación
const errors = ref({});

// Tipos de eventos
const eventTypes = computed(() => {
  // Valores en inglés que probablemente acepte el backend
  return [
    { label: 'Boda', value: 'WEDDING' },
    { label: 'Cumpleaños', value: 'BIRTHDAY' },
    { label: 'Evento Corporativo', value: 'CORPORATE' },
    { label: 'Conferencia', value: 'CONFERENCE' },
    { label: 'Graduación', value: 'GRADUATION' },
    { label: 'Aniversario', value: 'ANNIVERSARY' },
    { label: 'Bautizo', value: 'BAPTISM' },
    { label: 'Primera Comunión', value: 'COMMUNION' },
    { label: 'Baby Shower', value: 'BABY_SHOWER' },
    { label: 'Compromiso', value: 'ENGAGEMENT' },
    { label: 'Jubilación', value: 'RETIREMENT' },
    { label: 'Reunión', value: 'REUNION' },
    { label: 'Gala', value: 'GALA' },
    { label: 'Seminario', value: 'SEMINAR' },
    { label: 'Taller', value: 'WORKSHOP' },
    { label: 'Fiesta', value: 'PARTY' },
    { label: 'Otro', value: 'OTHER' }
  ];
});

// Categorías de servicios comunes
const serviceCategories = computed(() => {
  return ServiceItem.getCommonServiceCategories().map(cat => ({
    label: cat,
    value: cat
  }));
});

// Fecha mínima (hoy)
const minDate = computed(() => new Date());

// Validar formulario
const validateForm = () => {
  errors.value = {};

  if (!form.value.title?.trim()) {
    errors.value.title = 'El título es obligatorio';
  }

  if (!form.value.eventType) {
    errors.value.eventType = 'Selecciona un tipo de evento';
  }

  if (!form.value.eventDate) {
    errors.value.eventDate = 'La fecha del evento es obligatoria';
  } else if (new Date(form.value.eventDate) < new Date()) {
    errors.value.eventDate = 'La fecha debe ser futura';
  }

  if (!form.value.guestQuantity || form.value.guestQuantity < 1) {
    errors.value.guestQuantity = 'La cantidad de invitados debe ser mayor a 0';
  }

  if (!form.value.location?.trim()) {
    errors.value.location = 'La ubicación es obligatoria';
  }

  if (requestedServices.value.length === 0) {
    errors.value.services = 'Debes solicitar al menos un servicio';
  }

  return Object.keys(errors.value).length === 0;
};

// Cargar perfil del organizador
const loadOrganizerProfile = async () => {
  loading.value = true;
  try {
    organizerProfile.value = await ProfileApiService.getProfileById(organizerId.value);
  } catch (error) {
    console.error('Error loading organizer profile:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar el perfil del organizador',
      life: 5000
    });
    router.push({ name: 'host-dashboard' });
  } finally {
    loading.value = false;
  }
};

// Cargar perfil del Host (usuario actual)
const loadHostProfile = async () => {
  try {
    // Intentar obtener el profileId desde diferentes fuentes
    let profileId = user.value?.profileId || user.value?.id;

    if (!profileId) {
      // Si no existe, buscar por userId o email
      console.log('🔍 Buscando perfil del usuario:', user.value);

      // Opción 1: Si tienes un endpoint para buscar por userId
      // const profile = await ProfileApiService.getProfileByUserId(user.value.id);

      // Opción 2: Si tienes un endpoint para obtener el perfil actual
      // const profile = await ProfileApiService.getCurrentUserProfile();

      // Opción 3: Buscar todos los perfiles y filtrar por email (último recurso)
      const allProfiles = await ProfileApiService.getAllProfiles();
      const profile = allProfiles.find(p =>
        p.email === user.value?.email ||
        p.userId === user.value?.id
      );

      if (!profile) {
        throw new Error('No se encontró el perfil del usuario');
      }

      hostProfile.value = profile;
      console.log('✅ Perfil del Host cargado:', hostProfile.value);
    } else {
      // Si existe profileId, cargarlo directamente
      hostProfile.value = await ProfileApiService.getProfileById(profileId);
      console.log('✅ Perfil del Host cargado:', hostProfile.value);
    }
  } catch (error) {
    console.error('❌ Error loading host profile:', error);
    toast.add({
      severity: 'error',
      summary: 'Error de autenticación',
      detail: 'No se pudo cargar tu perfil. Por favor, verifica que tengas un perfil creado.',
      life: 5000
    });
    router.push({ name: 'host-dashboard' });
  }
};

// Manejar servicios
const handleAddService = () => {
  newService.value = {
    description: '',
    quantity: 1
  };
  showServiceDialog.value = true;
};

const confirmAddService = () => {
  if (!newService.value.description?.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Selecciona o escribe un servicio',
      life: 3000
    });
    return;
  }

  requestedServices.value.push({
    description: newService.value.description,
    quantity: newService.value.quantity,
    unitPrice: 0,
    totalPrice: 0
  });

  showServiceDialog.value = false;

  toast.add({
    severity: 'success',
    summary: 'Servicio agregado',
    detail: `${newService.value.description} agregado a tu solicitud`,
    life: 2000
  });
};

const removeService = (index) => {
  requestedServices.value.splice(index, 1);
};

// Enviar solicitud de cotización
const submitQuoteRequest = async () => {
  // Verificar que tenemos el perfil del host
  if (!hostProfile.value?.id) {
    toast.add({
      severity: 'error',
      summary: 'Error de autenticación',
      detail: 'No se pudo identificar tu perfil. Por favor, recarga la página.',
      life: 5000
    });
    return;
  }

  if (!validateForm()) {
    toast.add({
      severity: 'warn',
      summary: 'Formulario incompleto',
      detail: 'Por favor completa todos los campos requeridos',
      life: 3000
    });
    return;
  }

  submitting.value = true;
  try {
    console.log('📤 Creando cotización:', {
      organizerId: parseInt(organizerId.value),
      hostId: hostProfile.value.id,
      title: form.value.title
    });

    // 1. Crear la cotización
    const quoteData = {
      title: form.value.title,
      eventType: form.value.eventType,
      guestQuantity: form.value.guestQuantity,
      location: form.value.location,
      totalPrice: 0.01, // Mínimo válido, se actualizará cuando el organizador agregue precios
      state: 'PENDING',
      eventDate: new Date(form.value.eventDate).toISOString(),
      organizerId: parseInt(organizerId.value),
      hostId: hostProfile.value.id
    };

    const createdQuote = await QuoteApiService.createQuote(quoteData);

    // 2. Crear los service items solicitados (sin precio real)
    for (const service of requestedServices.value) {
      await ServiceItemApiService.createServiceItem(createdQuote.quoteId, {
        description: service.description,
        quantity: service.quantity,
        unitPrice: 0.01, // Precio mínimo temporal - El organizador lo actualizará
        totalPrice: 0.01 * service.quantity,
        quoteId: createdQuote.quoteId
      });
    }

    toast.add({
      severity: 'success',
      summary: '¡Cotización solicitada!',
      detail: `Tu solicitud ha sido enviada a ${organizerProfile.value.firstName}. Te notificaremos cuando agregue los precios.`,
      life: 5000
    });

    // Navegar a la vista de cotizaciones del host
    router.push({
      name: 'quote-detail',
      params: { id: createdQuote.quoteId }
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo crear la cotización. Intenta de nuevo.',
      life: 5000
    });
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  router.push({ name: 'host-dashboard' });
};

// Lifecycle
onMounted(async () => {
  if (!organizerId.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se especificó el organizador',
      life: 3000
    });
    router.push({ name: 'host-dashboard' });
    return;
  }

  loading.value = true;

  // Cargar perfiles en paralelo
  await Promise.all([
    loadOrganizerProfile(),
    loadHostProfile()
  ]);

  loading.value = false;
});
</script>

<template>
  <div class="quote-request-page">
    <div class="page-container">
      <!-- Header -->
      <header class="page-header">
        <Button
          icon="pi pi-arrow-left"
          label="Volver"
          text
          @click="handleCancel"
          class="back-button"
        />
        <h1 class="page-title">Solicitar Cotización</h1>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>Cargando...</p>
      </div>

      <!-- Formulario -->
      <div v-else class="form-content">
        <!-- Info del organizador -->
        <Card class="organizer-card">
          <template #header>
            <div class="organizer-header">
              <div class="organizer-avatar">
                <img
                  v-if="organizerProfile?.profileImageUrl"
                  :src="organizerProfile.profileImageUrl"
                  :alt="organizerProfile.firstName"
                />
                <div v-else class="avatar-placeholder">
                  {{ organizerProfile?.firstName?.charAt(0) }}{{ organizerProfile?.lastName?.charAt(0) }}
                </div>
              </div>
              <div class="organizer-info">
                <h3>{{ organizerProfile?.firstName }} {{ organizerProfile?.lastName }}</h3>
                <p>
                  <i class="pi pi-map-marker"></i>
                  {{ organizerProfile?.city }}, {{ organizerProfile?.country }}
                </p>
                <p>
                  <i class="pi pi-envelope"></i>
                  {{ organizerProfile?.email }}
                </p>
              </div>
            </div>
          </template>
          <template #content>
            <p class="organizer-description">
              Estás solicitando una cotización a este organizador.
              Completa los detalles de tu evento y selecciona los servicios que necesitas.
            </p>
          </template>
        </Card>

        <!-- Formulario de solicitud -->
        <Card class="request-form-card">
          <template #title>Detalles del Evento</template>
          <template #content>
            <form @submit.prevent="submitQuoteRequest" class="quote-form">
              <!-- Título -->
              <div class="form-field">
                <label for="title">
                  Título del Evento <span class="required">*</span>
                </label>
                <InputText
                  id="title"
                  v-model="form.title"
                  placeholder="Ej: Boda de María y Juan"
                  :class="{ 'p-invalid': errors.title }"
                  class="w-full"
                />
                <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
              </div>

              <!-- Tipo de Evento -->
              <div class="form-field">
                <label for="eventType">
                  Tipo de Evento <span class="required">*</span>
                </label>
                <Dropdown
                  id="eventType"
                  v-model="form.eventType"
                  :options="eventTypes"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Selecciona el tipo de evento"
                  :class="{ 'p-invalid': errors.eventType }"
                  class="w-full"
                />
                <small v-if="errors.eventType" class="p-error">{{ errors.eventType }}</small>
              </div>

              <!-- Fecha y Cantidad de Invitados -->
              <div class="form-row">
                <div class="form-field">
                  <label for="eventDate">
                    Fecha del Evento <span class="required">*</span>
                  </label>
                  <Calendar
                    id="eventDate"
                    v-model="form.eventDate"
                    :minDate="minDate"
                    showIcon
                    showTime
                    hourFormat="24"
                    dateFormat="dd/mm/yy"
                    placeholder="Selecciona fecha y hora"
                    :class="{ 'p-invalid': errors.eventDate }"
                    class="w-full"
                  />
                  <small v-if="errors.eventDate" class="p-error">{{ errors.eventDate }}</small>
                </div>

                <div class="form-field">
                  <label for="guestQuantity">
                    Cantidad de Invitados <span class="required">*</span>
                  </label>
                  <InputNumber
                    id="guestQuantity"
                    v-model="form.guestQuantity"
                    :min="1"
                    :max="10000"
                    showButtons
                    :class="{ 'p-invalid': errors.guestQuantity }"
                    class="w-full"
                  />
                  <small v-if="errors.guestQuantity" class="p-error">{{ errors.guestQuantity }}</small>
                </div>
              </div>

              <!-- Ubicación -->
              <div class="form-field">
                <label for="location">
                  Ubicación <span class="required">*</span>
                </label>
                <InputText
                  id="location"
                  v-model="form.location"
                  placeholder="Ej: Hotel Los Delfines, Lima"
                  :class="{ 'p-invalid': errors.location }"
                  class="w-full"
                />
                <small v-if="errors.location" class="p-error">{{ errors.location }}</small>
              </div>

              <!-- Servicios Solicitados -->
              <div class="form-field">
                <div class="services-header">
                  <label>
                    Servicios que Necesitas <span class="required">*</span>
                  </label>
                  <Button
                    label="Agregar Servicio"
                    icon="pi pi-plus"
                    @click="handleAddService"
                    size="small"
                    outlined
                  />
                </div>
                <small v-if="errors.services" class="p-error">{{ errors.services }}</small>

                <!-- Lista de servicios -->
                <DataTable
                  v-if="requestedServices.length > 0"
                  :value="requestedServices"
                  class="services-table"
                  :showGridlines="false"
                  stripedRows
                >
                  <Column field="description" header="Servicio" style="width: 60%">
                    <template #body="{ data }">
                      <span class="service-name">{{ data.description }}</span>
                    </template>
                  </Column>

                  <Column field="quantity" header="Cantidad" style="width: 30%">
                    <template #body="{ data }">
                      <span>{{ data.quantity }}</span>
                    </template>
                  </Column>

                  <Column style="width: 10%">
                    <template #body="{ index }">
                      <Button
                        icon="pi pi-times"
                        severity="danger"
                        text
                        rounded
                        @click="removeService(index)"
                        size="small"
                      />
                    </template>
                  </Column>
                </DataTable>

                <div v-else class="empty-services">
                  <i class="pi pi-shopping-cart"></i>
                  <p>No has agregado servicios aún</p>
                  <small>El organizador te cotizará los servicios que selecciones</small>
                </div>
              </div>

              <!-- Notas adicionales -->
              <div class="form-field">
                <label for="notes">Notas Adicionales</label>
                <Textarea
                  id="notes"
                  v-model="form.additionalNotes"
                  rows="4"
                  placeholder="Describe cualquier detalle especial o requerimiento para tu evento..."
                  class="w-full"
                />
              </div>

              <!-- Botones -->
              <div class="form-actions">
                <Button
                  label="Cancelar"
                  icon="pi pi-times"
                  severity="secondary"
                  outlined
                  @click="handleCancel"
                  :disabled="submitting"
                />
                <Button
                  label="Solicitar Cotización"
                  icon="pi pi-send"
                  type="submit"
                  :loading="submitting"
                />
              </div>
            </form>
          </template>
        </Card>
      </div>
    </div>

    <!-- Dialog para agregar servicio -->
    <Dialog
      v-model:visible="showServiceDialog"
      header="Agregar Servicio"
      :modal="true"
      :closable="true"
      :style="{ width: '500px' }"
    >
      <div class="service-dialog">
        <div class="form-field">
          <label for="serviceType">Tipo de Servicio</label>
          <Dropdown
            id="serviceType"
            v-model="newService.description"
            :options="serviceCategories"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecciona un servicio"
            class="w-full"
            editable
          />
          <small class="help-text">Puedes seleccionar de la lista o escribir tu propio servicio</small>
        </div>

        <div class="form-field">
          <label for="serviceQuantity">Cantidad</label>
          <InputNumber
            id="serviceQuantity"
            v-model="newService.quantity"
            :min="1"
            showButtons
            class="w-full"
          />
          <small class="help-text">Cantidad de este servicio que necesitas</small>
        </div>

        <div class="info-box">
          <i class="pi pi-info-circle"></i>
          <p>El organizador agregará los precios después de revisar tu solicitud</p>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          @click="showServiceDialog = false"
          text
        />
        <Button
          label="Agregar"
          icon="pi pi-check"
          @click="confirmAddService"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.quote-request-page {
  min-height: 100vh;
  background: #F8F9FA;
  padding: 2rem;
}

.page-container {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.back-button {
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #718096;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Organizer Card */
.organizer-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.organizer-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
}

.organizer-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e2e8f0;
  flex-shrink: 0;
}

.organizer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.organizer-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.organizer-info p {
  margin: 0.25rem 0;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.organizer-description {
  color: #718096;
  line-height: 1.6;
}

/* Form Card */
.request-form-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quote-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.required {
  color: #DC2626;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* Services Section */
.services-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.services-table {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  overflow: hidden;
}

.service-name {
  font-weight: 500;
  color: #374151;
}

.empty-services {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #D1D5DB;
  border-radius: 8px;
  color: #9CA3AF;
  text-align: center;
}

.empty-services i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.empty-services p {
  margin: 0.5rem 0;
  font-weight: 500;
}

.empty-services small {
  font-size: 0.875rem;
}

/* Service Dialog */
.service-dialog {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.help-text {
  color: #6B7280;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.25rem;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #EFF6FF;
  border-radius: 8px;
  border-left: 4px solid #3B82F6;
}

.info-box i {
  color: #3B82F6;
  font-size: 1.25rem;
}

.info-box p {
  margin: 0;
  color: #1E40AF;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

/* PrimeVue Overrides */
:deep(.p-card-title) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputnumber),
:deep(.p-textarea) {
  width: 100%;
}

:deep(.p-invalid) {
  border-color: #DC2626;
}

.p-error {
  color: #DC2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .quote-request-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .organizer-header {
    flex-direction: column;
    text-align: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .services-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
