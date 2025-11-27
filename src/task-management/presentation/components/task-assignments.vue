<template>
  <div class="task-assignments">
    <div class="assignments-header">
      <label class="assignment-label">Asignar a</label>
      <Button
        icon="pi pi-plus"
        label="Seleccionar Usuario"
        outlined
        size="small"
        @click="showUserSelector = true"
        class="select-user-btn"
      />
    </div>

    <!-- Assigned User Display -->
    <div v-if="assignedTo" class="assigned-user-card">
      <div class="user-info">
        <Avatar
          :label="assignedTo.charAt(0)"
          size="large"
          shape="circle"
          class="user-avatar"
        />
        <div class="user-details">
          <span class="user-name">{{ assignedTo }}</span>
          <span class="user-role">Miembro Asignado</span>
        </div>
      </div>
      <Button
        icon="pi pi-times"
        text
        rounded
        severity="danger"
        size="small"
        @click="removeAssignment"
        class="remove-btn"
      />
    </div>

    <!-- No Assignment -->
    <div v-else class="no-assignment">
      <i class="pi pi-user-minus"></i>
      <span>Esta tarea no está asignada a nadie</span>
    </div>

    <!-- User Selector Dialog -->
    <Dialog
      v-model:visible="showUserSelector"
      header="Seleccionar Miembro del Equipo"
      :modal="true"
      :closable="true"
      class="user-selector-dialog"
      :style="{ width: '500px' }"
    >
      <div class="user-selector-content">
        <!-- Search -->
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="userSearch"
            placeholder="Buscar usuario..."
            class="w-full"
          />
        </IconField>

        <!-- User List -->
        <div class="user-list">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="user-item"
            @click="selectUser(user)"
          >
            <Avatar
              :label="user.name.charAt(0)"
              size="medium"
              shape="circle"
              class="user-item-avatar"
            />
            <div class="user-item-info">
              <span class="user-item-name">{{ user.name }}</span>
              <span class="user-item-email">{{ user.email }}</span>
            </div>
            <i v-if="assignedTo === user.name" class="pi pi-check selected-icon"></i>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0" class="empty-users">
          <i class="pi pi-users"></i>
          <p>No se encontraron usuarios</p>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          text
          @click="showUserSelector = false"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

const props = defineProps({
  assignedTo: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:assignedTo']);

// Estado reactivo
const showUserSelector = ref(false);
const userSearch = ref('');

// Mock de usuarios disponibles
const availableUsers = ref([
  { id: 1, name: 'Andrea Ramirez', email: 'andrea.ramirez@eventify.com' },
  { id: 2, name: 'Carlos Mendoza', email: 'carlos.mendoza@eventify.com' },
  { id: 3, name: 'María Torres', email: 'maria.torres@eventify.com' },
  { id: 4, name: 'Juan Pérez', email: 'juan.perez@eventify.com' },
  { id: 5, name: 'Laura García', email: 'laura.garcia@eventify.com' },
  { id: 6, name: 'Roberto Silva', email: 'roberto.silva@eventify.com' },
  { id: 7, name: 'Ana Martínez', email: 'ana.martinez@eventify.com' }
]);

// Computed
const filteredUsers = computed(() => {
  if (!userSearch.value) return availableUsers.value;

  const query = userSearch.value.toLowerCase();
  return availableUsers.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );
});

// Métodos
const selectUser = (user) => {
  emit('update:assignedTo', user.name);
  showUserSelector.value = false;
  userSearch.value = '';
};

const removeAssignment = () => {
  emit('update:assignedTo', null);
};
</script>

<style scoped>
.task-assignments {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assignments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assignment-label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9375rem;
}

.select-user-btn {
  color: #5BC0BE;
  border-color: #5BC0BE;
}

.select-user-btn:hover {
  background-color: #5BC0BE;
  color: #FFFFFF;
}

/* Assigned User Card */
.assigned-user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #F8F9FA;
  border-radius: 8px;
  border: 1px solid #E9ECEF;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  background-color: #3A506B;
  color: #6FFFE9;
  font-weight: 600;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  font-weight: 600;
  color: #212529;
  font-size: 1rem;
}

.user-role {
  font-size: 0.875rem;
  color: #6C757D;
}

.remove-btn {
  color: #DC3545;
}

.remove-btn:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

/* No Assignment */
.no-assignment {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #FFF3CD;
  border-radius: 8px;
  border: 1px solid #FFC107;
  color: #856404;
}

.no-assignment i {
  font-size: 1.25rem;
}

/* User Selector Dialog */
.user-selector-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.w-full {
  width: 100%;
}

/* User List */
.user-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  background-color: #F8F9FA;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-item:hover {
  background-color: #E9ECEF;
}

.user-item-avatar {
  background-color: #5BC0BE;
  color: #FFFFFF;
  font-weight: 600;
}

.user-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-item-name {
  font-weight: 600;
  color: #212529;
}

.user-item-email {
  font-size: 0.875rem;
  color: #6C757D;
}

.selected-icon {
  color: #5BC0BE;
  font-size: 1.25rem;
}

/* Empty State */
.empty-users {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6C757D;
}

.empty-users i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .assignments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .select-user-btn {
    width: 100%;
  }

  .user-selector-dialog {
    width: 95vw !important;
  }
}
</style>
