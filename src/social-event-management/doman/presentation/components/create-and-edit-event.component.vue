<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

// Servicios
import EventService from '@/social-event-management/application/services/event.service.js';
import { useAuth } from '@/auth-management/infrastructure/composables/useAuth.js';

// Composables
const router = useRouter();
const { t } = useI18n();
const { user, restoreSession } = useAuth();

const currentUserId = computed(() => {
  const value = user.value?.id;
  return value != null ? String(value) : null;
});

// Props
const props = defineProps({
  id: {
    type: [String, Number],
    default: null
  }
});

// Estado reactivo
const eventData = ref({
  title: '',
  date: '',
  customerName: '',
  location: '',
  status: 'Active',
  userId: currentUserId.value
});

const loading = ref(false);

// Opciones para el dropdown de status
const statusOptions = computed(() => [
  { label: t('eventManagement.status.active'), value: 'Active' },
  { label: t('eventManagement.status.pending'), value: 'Pending' },
  { label: t('eventManagement.status.cancelled'), value: 'Cancelled' }
]);

// Computed: verificar si estamos en modo edición
const isEditMode = computed(() => !!props.id);

// Métodos
const fetchEvent = async () => {
  if (!isEditMode.value) return;

  loading.value = true;
  try {
    if (!user.value) {
      await restoreSession();
    }

    const response = await EventService.getEvent(props.id);
    const eventDataFromServer = { ...response.data };

    const ownerId = eventDataFromServer.userId != null ? String(eventDataFromServer.userId) : null;
    const userId = currentUserId.value;

    if (!userId || (ownerId && ownerId !== userId)) {
      throw new Error(t('eventManagement.messages.forbiddenEvent'));
    }

    // Si la fecha viene como string, convertirla a objeto Date
    if (eventDataFromServer.date && typeof eventDataFromServer.date === 'string') {
      eventDataFromServer.date = new Date(eventDataFromServer.date);
    }

    eventData.value = {
      ...eventDataFromServer,
      userId: ownerId || userId
    };
  } catch (error) {
    console.error('Error fetching event:', error);
    router.push('/events');
  } finally {
    loading.value = false;
  }
};

const saveEvent = async () => {
  loading.value = true;
  try {
    const dataToSend = { ...eventData.value };

    // Convertir Date object a string si es necesario
    if (dataToSend.date instanceof Date) {
      dataToSend.date = dataToSend.date.toISOString().split('T')[0];
    }
    if (!currentUserId.value) {
      throw new Error(t('eventManagement.messages.forbiddenEvent'));
    }

    dataToSend.userId = currentUserId.value;

    if (isEditMode.value) {
      await EventService.updateEvent(props.id, dataToSend);
    } else {
      await EventService.createEvent(dataToSend);
    }

    router.push('/events');
  } catch (error) {
    console.error('Error saving event:', error);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/events');
};

// Lifecycle: cargar datos si estamos en modo edición
onMounted(async () => {
  if (!user.value) {
    await restoreSession();
    eventData.value.userId = currentUserId.value;
  }

  fetchEvent();
});
</script>

<template>
  <div class="event-form-container text-5xl" >
    <div class="form-header">
      <h1>{{ isEditMode ? $t('eventManagement.editEvent') : $t('eventManagement.createEvent') }}</h1>
    </div>

    <form @submit.prevent="saveEvent" class="event-form">
      <div class="form-group">
        <label for="title" >Event Title</label >
        <InputText
          id="title"
          v-model="eventData.title"
          placeholder="Enter event title"
          :disabled="loading"
          class="w-full"
        />
      </div>

      <div class="form-group">
        <label for="date">Event Date</label>
        <Calendar
          id="date"
          v-model="eventData.date"
          placeholder="2025/11/15"
          dateFormat="yy-mm-dd"
          :disabled="loading"
          showIcon iconDisplay="input"
          class="w-full"
        />
      </div>

      <div class="form-group">
        <label for="customerName">Customer Name</label>
        <InputText
          id="customerName"
          v-model="eventData.customerName"
          placeholder="Enter customer name"
          :disabled="loading"
          class="w-full"
        />
      </div>

      <div class="form-group">
        <label for="location">Location</label>
        <InputText
          id="location"
          v-model="eventData.location"
          placeholder="Enter event location"
          :disabled="loading"
          class="w-full"
        />
      </div>

      <div class="form-group">
        <label for="status">Status</label>
        <Dropdown
          id="status"
          v-model="eventData.status"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          :disabled="loading"
          class="w-full"
        />
      </div>

      <div class="form-actions">
        <Button
          type="button"
          label="Cancel"
          severity="secondary"
          @click="goBack"
          :disabled="loading"
          class="cancel-btn"
        />
        <Button
          type="submit"
          :label="isEditMode ? 'Update Event' : 'Create Event'"
          :loading="loading"
          class="save-btn"
        />
      </div>
    </form>
  </div>
</template>

<style scoped>
/* Contenedor principal */
.event-form-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* Header del formulario */
.form-header {
  padding: 1.5rem;
  font-weight: bold;

  color: #3a506b;
  border-radius: 6px 6px 0 0;
}

.form-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

/* Formulario */
.event-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Grupos de formulario */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #3A506B;
  font-size: 0.95rem;
}

/* Acciones del formulario */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.cancel-btn {
  min-width: 120px;
}

.save-btn {
  min-width: 150px;
  background-color: #3A506B;
  border-color: #5BC0BE;
}

.save-btn:hover {
  background-color: #3A506B !important;
  border-color: #4aa9a7 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .event-form-container {
    margin: 1rem auto;
    padding: 0 0.5rem;
  }

  .form-header h1 {
    font-size: 1.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
    min-width: unset;
  }
}
</style>
