<script>
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

export default {
  name: 'QuoteCard',
  components: {
    Card,
    Button,
    Tag
  },
  emits: ['view', 'create-event'],
  props: {
    quote: {
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
      if (!this.quote?.event?.date) return 'Sin fecha';

      const date = new Date(this.quote.event.date);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    eventTypeLabel() {
      if (!this.quote?.event?.type) return 'Sin tipo';

      const types = {
        'WEDDING': 'Boda',
        'CONFERENCE': 'Conferencia',
        'CORPORATE_PARTY': 'Fiesta Corporativa',
        'BABY_SHOWER': 'Baby Shower',
        'GRADUATION': 'Graduación',
        'BIRTHDAY': 'Cumpleaños',
        'FIFTEEN_YEARS': 'Quinceañero',
        'OTHER': 'Otro'
      };
      return types[this.quote.event.type] || this.quote.event.type;
    },
    headerClass() {
      return {
        'header-approved': this.quote.state === 'APPROVED',
        'header-pending': this.quote.state === 'PENDING',
        'header-rejected': this.quote.state === 'REJECTED',
        'header-draft': this.quote.state === 'DRAFT'
      };
    },
    statusSeverity() {
      if (this.quote.state === 'APPROVED') return 'success';
      if (this.quote.state === 'PENDING') return 'warn';
      if (this.quote.state === 'REJECTED') return 'danger';
      return 'info';
    },
    formattedTotal() {
      if (!this.quote?.total) return 'S/ 0.00';

      const amount = this.quote.total;
      const currency = this.quote.currency || 'PEN';

      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: currency
      }).format(amount);
    },
    serviceCount() {
      return this.quote?.services?.length || 0;
    },
    guestCount() {
      return this.quote?.event?.numberOfGuests || 0;
    },
    customerName() {
      return this.quote?.customer?.name || 'Sin nombre';
    },
    eventLocation() {
      return this.quote?.event?.location || 'Sin ubicación';
    }
  }
};
</script>

<template>
  <Card class="quote-card" :class="{ 'selected-card': selected }">
    <template #header>
      <div class="card-header-content" :class="headerClass">

          <h3 class="quote-title">{{ eventTypeLabel }}</h3>
          <p class="quote-date">{{ formattedDate }}</p>


      </div>
    </template>

    <template #content>
      <div class="quote-details">
        <div class="detail-row">
          <h3 class="detail-label">{{ $t('eventManagement.customer') }}</h3>
          <span class="detail-value">{{ customerName }}</span>
        </div>

        <div class="detail-row">
          <h3 class="detail-label">{{ $t('eventManagement.location') }}</h3>
          <span class="detail-value">{{ eventLocation }}</span>
        </div>

        <div class="detail-row">
          <h3 class="detail-label">{{ $t('eventManagement.guests') }}</h3>
          <span class="detail-value">{{ guestCount }} Guests </span>
        </div>


        <div class="status-row">
          <Tag
            value="Aprobada"
            severity="success"
            class="quote-status-tag"
          />
          <div class="action-buttons">
            <Button
              icon="pi pi-eye"
              label="Ver"
              size="small"
              severity="info"
              @click="$emit('view')"
              class="view-btn"
            />

          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.quote-card {
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
  border-color: #3A506B;
}

.quote-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.quote-card.selected-card {
  box-shadow: 0 0 0 2px #5BC0BE;

}

.card-header-content {
  padding: 1.25rem;
  color: white;
  border-radius: 6px 6px 0 0;
  transition: background 0.3s ease;
}

/* Header classes según estado */
.card-header-content.header-approved {
  background: linear-gradient(135deg, #3A506B 50%, #16a34a 100%);
}

.card-header-content.header-pending {
  background: linear-gradient(135deg, #3A506B 50%, #d97706 100%);
}

.card-header-content.header-rejected {
  background: linear-gradient(135deg, #3A506B 50%, #991b1b 100%);
}

.card-header-content.header-draft {
  background: linear-gradient(135deg, #3A506B 50%, #4B5563 100%);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.quote-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #FFFFEF;
  flex: 1;
}

.quote-id {
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.quote-date {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.quote-details {
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

.total-row {
  padding-top: 0.5rem;
  border-top: 1px solid #e9ecef;
}

.total-amount {
  font-size: 1.125rem;
  font-weight: 700;
  color: #3A506B;
}

.services-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6B7280;
  font-size: 0.875rem;
}

.services-info i {
  color: #5BC0BE;
}

.status-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.quote-status-tag {
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  flex: 1;
  background-color: #3A506B ;
}

.create-event-btn {
  flex: 1;
  min-width: 100px;
}

/* Responsive */
@media (max-width: 576px) {
  .card-header-content {
    padding: 1rem;
  }

  .quote-title {
    font-size: 1.1rem;
  }

  .status-row {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: column;
  }

  .view-btn,
  .create-event-btn {
    width: 100%;
  }
}
</style>
