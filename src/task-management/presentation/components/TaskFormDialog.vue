<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :header="isEditMode ? $t('tasks.form.editTitle') : $t('tasks.form.createTitle')"
    :modal="true"
    :style="{ width: '600px' }"
    :closable="true"
  >
    <div class="form-content">
      <!-- Título -->
      <div class="field mb-4">
        <label for="title" class="font-semibold mb-2 block">
          {{ $t('tasks.form.title') }}
          <span class="text-red-500">*</span>
        </label>
        <InputText
          id="title"
          v-model="formData.title"
          class="w-full"
          :class="{ 'p-invalid': v$.title.$error }"
          :placeholder="$t('tasks.form.titlePlaceholder')"
        />
        <small v-if="v$.title.$error" class="p-error">
          {{ v$.title.$errors[0].$message }}
        </small>
      </div>

      <!-- Descripción -->
      <div class="field mb-4">
        <label for="description" class="font-semibold mb-2 block">
          {{ $t('tasks.form.description') }}
          <span class="text-red-500">*</span>
        </label>
        <Textarea
          id="description"
          v-model="formData.description"
          rows="4"
          class="w-full"
          :class="{ 'p-invalid': v$.description.$error }"
          :placeholder="$t('tasks.form.descriptionPlaceholder')"
        />
        <small v-if="v$.description.$error" class="p-error">
          {{ v$.description.$errors[0].$message }}
        </small>
      </div>

      <!-- Evento (solo si hay múltiples eventos) -->
      <div v-if="showEventSelector" class="field mb-4">
        <label for="event" class="font-semibold mb-2 block">
          {{ $t('tasks.form.event') }}
          <span class="text-red-500">*</span>
        </label>
        <Dropdown
          id="event"
          v-model="formData.selectedEventId"
          :options="activeEvents"
          option-label="name"
          option-value="id"
          :placeholder="$t('tasks.form.selectEvent')"
          class="w-full"
          :class="{ 'p-invalid': v$.selectedEventId.$error }"
        />
        <small v-if="v$.selectedEventId.$error" class="p-error">
          {{ v$.selectedEventId.$errors[0].$message }}
        </small>
      </div>

      <!-- Fecha de vencimiento -->
      <div class="field mb-4">
        <label for="dueDate" class="font-semibold mb-2 block">
          {{ $t('tasks.form.dueDate') }}
          <span class="text-red-500">*</span>
        </label>
        <Calendar
          id="dueDate"
          v-model="formData.dueDate"
          dateFormat="dd/mm/yy"
          :minDate="minDate"
          :maxDate="maxDate"
          :showIcon="true"
          class="w-full"
          :class="{ 'p-invalid': v$.dueDate.$error }"
          :placeholder="$t('tasks.form.selectDate')"
        />
        <small v-if="v$.dueDate.$error" class="p-error">
          {{ v$.dueDate.$errors[0].$message }}
        </small>
        <small v-else-if="eventDateRange" class="text-600">
          {{ $t('tasks.form.dateRange', {
            start: formatDate(eventDateRange.startDate),
            end: formatDate(eventDateRange.endDate)
          }) }}
        </small>
      </div>

      <!-- Status (solo en modo edición) -->
      <div v-if="isEditMode" class="field mb-4">
        <label for="status" class="font-semibold mb-2 block">
          {{ $t('tasks.form.status') }}
        </label>
        <Dropdown
          id="status"
          v-model="formData.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <Button
        :label="$t('common.cancel')"
        icon="pi pi-times"
        @click="closeDialog"
        text
      />
      <Button
        :label="isEditMode ? $t('common.update') : $t('common.create')"
        icon="pi pi-check"
        @click="handleSubmit"
        :loading="loading"
        :disabled="v$.$invalid"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useTaskStore } from '../../application/services/task.store.js';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required, maxLength } from '@vuelidate/validators';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  eventId: {
    type: String,
    required: true
  },
  task: {
    type: Object,
    default: null
  },
  activeEvents: {
    type: Array,
    default: () => []
  },
  eventDateRange: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:visible', 'task-saved']);

const taskStore = useTaskStore();
const toast = useToast();
const { t, d } = useI18n();

const loading = ref(false);
const showEventSelector = computed(() => props.activeEvents && props.activeEvents.length > 1);
const isEditMode = computed(() => !!props.task); // ← AGREGA ESTA LÍNEA

const formData = ref({
  title: '',
  description: '',
  dueDate: null,
  status: 'PENDING',
  selectedEventId: props.eventId
});

const statusOptions = [
  { label: t('tasks.status.pending'), value: 'PENDING' },
  { label: t('tasks.status.inProgress'), value: 'IN_PROGRESS' },
  { label: t('tasks.status.completed'), value: 'COMPLETED' }
];

// Validaciones
const rules = {
  title: {
    required: required,
    maxLength: maxLength(200)
  },
  description: {
    required: required,
    maxLength: maxLength(1000)
  },
  dueDate: {
    required: required
  },
  selectedEventId: showEventSelector.value ? { required: required } : {}
};

const v$ = useVuelidate(rules, formData);

// Fechas mínimas y máximas basadas en el evento
const minDate = computed(() => {
  if (!props.eventDateRange) return new Date();
  return new Date(props.eventDateRange.startDate);
});

const maxDate = computed(() => {
  if (!props.eventDateRange) return null;
  return new Date(props.eventDateRange.endDate);
});

watch(() => props.visible, (newValue) => {
  if (newValue) {
    resetForm();
    if (props.task) {
      loadTaskData();
    }
  }
});

watch(() => props.eventId, (newValue) => {
  formData.value.selectedEventId = newValue;
});

function resetForm() {
  formData.value = {
    title: '',
    description: '',
    dueDate: null,
    status: 'PENDING',
    selectedEventId: props.eventId
  };
  v$.value.$reset();
}

function loadTaskData() {
  if (!props.task) return;

  formData.value = {
    title: props.task.title,
    description: props.task.description,
    dueDate: props.task.dueDate ? new Date(props.task.dueDate) : null,
    status: props.task.status,
    selectedEventId: props.task.eventId || props.eventId
  };
}

async function handleSubmit() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  loading.value = true;

  try {
    const taskData = {
      title: formData.value.title,
      description: formData.value.description,
      dueDate: formData.value.dueDate.toISOString().split('T')[0],
      status: formData.value.status
    };

    if (isEditMode.value) {
      await taskStore.updateTask(
        props.task.id,
        formData.value.selectedEventId,
        taskData
      );
    } else {
      await taskStore.createTask(formData.value.selectedEventId, taskData);
    }

    emit('task-saved');
    closeDialog();
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('tasks.messages.saveError'),
      detail: error.message,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

function closeDialog() {
  emit('update:visible', false);
  resetForm();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return d(date, 'short');
}
</script>

<style scoped>
.form-content {
  padding: 1rem 0;
}

.field {
  display: flex;
  flex-direction: column;
}

.p-error {
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.p-invalid {
  border-color: #d32f2f !important;
}

.text-red-500 {
  color: #d32f2f;
}
</style>
