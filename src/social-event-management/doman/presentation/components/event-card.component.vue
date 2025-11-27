<script>
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

export default {
  name: 'EventCard',
  components: {
    Card,
    Button,
    Tag
  },
  props: {
    event: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    formattedDate() {
      if (!this.event.date) return '';

      const date = new Date(this.event.date);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    headerClass() {
      return {
        'header-active': this.event.status === 'Active',
        'header-pending': this.event.status === 'Pending',
        'header-cancelled': this.event.status === 'Cancelled',
        'header-new': this.event.isNew
      };
    },
    statusSeverity() {
      if (this.event.status === 'Active') return 'success';
      if (this.event.status === 'Pending') return 'warn';
      if (this.event.status === 'Cancelled') return 'danger';
      return 'info';
    }
  }
};
</script>

<template>
  <Card class="event-card" :class="{ 'selected-card': selected }">
    <template #header>
      <div class="card-header-content" :class="headerClass">
        <h3 class="event-title">{{ event.title }}</h3>
        <p class="event-date">{{ formattedDate }}</p>
      </div>
    </template>

    <template #content>
      <div class="event-details">
        <div class="detail-row">

          <h3 class="detail-label">{{ $t('eventManagement.customer') }}</h3>
          <span class="detail-value">{{ event.customerName }}</span>
        </div>

        <div class="detail-row">

          <h3 class="detail-label">{{ $t('eventManagement.location') }}</h3>
          <span class="detail-value">{{ event.location }}</span>
        </div>

        <div class="status-row">
          <Tag
            :value="$t(`eventManagement.status.${event.status.toLowerCase()}`)"
            :severity="statusSeverity"
            class="event-status-tag"
          />
          <Button

            icon="pi pi-pencil"
            :label= "$t('eventManagement.edit')"
            size="small"
            severity="info"
            @click="$emit('edit')"
            class="edit-btn"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.event-card {
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-card.selected-card {
  box-shadow: 0 0 0 2px #5BC0BE;
}

.card-header-content {
  padding: 1.25rem;
  color: white;
  border-radius: 6px 6px 0 0;
  transition: background 0.3s ease;
}

/* Header classes según estado */
.card-header-content.header-active {
  background: linear-gradient(135deg, #3A506B 50%, #16a34a 100%);
}

.card-header-content.header-pending {
  background: linear-gradient(135deg, #3A506B 50%, #d97706 100%);
}

.card-header-content.header-cancelled {
  background: linear-gradient(135deg, #3A506B 50%, #991b1b 100%);
}

.card-header-content.header-new {
  background: linear-gradient(135deg, #3A506B 50%, #3aa9a7 100%);
}

.event-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #FFFFEF;
}

.event-date {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 600;
  color: #3A506B;
  min-width: 80px;
}

.detail-value {
  color: #495057;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.event-status-tag {
  font-weight: 600;
}

.edit-btn {
  min-width: 80px;
  background-color: #3A506B;
}

/* Responsive */
@media (max-width: 576px) {
  .card-header-content {
    padding: 1rem;
  }

  .event-title {
    font-size: 1.1rem;
  }

  .status-row {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .edit-btn {
    width: 100%;
  }
}
</style>
