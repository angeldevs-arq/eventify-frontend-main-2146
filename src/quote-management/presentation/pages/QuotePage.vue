<script setup>
import { useI18n } from 'vue-i18n';
import QuotesList from '../components/quotes-list.vue';

const { t } = useI18n();
</script>
<template>
  <main class="quote-page">
    <div class="quote-page__container">
      <!-- Header de la página -->
      <header class="quote-page__header">
        <h1 class="page-title">{{ $t('quotes.page.title') }}</h1>
        <p class="page-subtitle">{{ $t('quotes.page.subtitle') }}</p>
      </header>

      <!-- Componente de lista de cotizaciones -->
      <QuotesList />
    </div>
  </main>
</template>
<style scoped>
.quote-page {
  min-height: 100vh;
  background-color: #F8F9FA;
}

.quote-page__container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.quote-page__header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary-color, #3A506B);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #6C757D;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .quote-page__container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }
}
</style>
