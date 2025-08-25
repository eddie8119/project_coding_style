<template>
  <div class="flex h-full w-full flex-col items-center justify-center">
    <div class="spinner-circle" />
    <p class="loading-text text-brand-secondary">{{ t('common.loading') }}...</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.spinner-circle {
  width: 48px;
  height: 48px;
  border: 5px solid #1c99df;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 16px;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 1px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
