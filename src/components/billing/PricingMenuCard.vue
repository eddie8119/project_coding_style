<template>
  <div
    class="relative flex flex-col rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800"
    :class="plan.borderClass"
  >
    <div class="mb-6">
      <h3 class="text-2xl font-extrabold" :class="plan.titleClass">{{ plan.title }}</h3>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ plan.subtitle }}</p>
    </div>
    <div class="mb-6">
      <div class="flex items-end gap-2">
        <span class="text-4xl font-black text-gray-900 dark:text-white">
          {{ plan.currencySymbol }} {{ plan.price }}
        </span>
        <span class="mb-1 text-gray-600 dark:text-gray-400">{{ plan.currency }}</span>
      </div>
    </div>
    <button
      class="mb-2 rounded-lg px-4 py-3 font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      :class="plan.buttonClass"
      :aria-busy="!plan.contactSales && loading"
      :aria-label="loading ? t('billing.processing') : plan.buttonText"
      :disabled="!plan.contactSales && loading"
      @click="plan.contactSales ? emit('contact') : emit('select', plan.id)"
    >
      <span>
        {{
          plan.contactSales ? plan.buttonText : loading ? t('billing.processing') : plan.buttonText
        }}
      </span>
    </button>
    <p class="mb-6 text-center text-xs text-gray-500 dark:text-gray-400">每用戶每月</p>
    <ul class="mt-auto space-y-3 text-sm text-gray-800 dark:text-gray-200">
      <li v-for="feature in plan.features" :key="feature" class="flex items-start">
        <span class="mr-2" :class="plan.checkClass" aria-hidden="true">✔</span>
        <span>{{ feature }}</span>
      </li>
    </ul>
    <p v-if="plan.note" class="mt-4 text-xs text-gray-500 dark:text-gray-400">{{ plan.note }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { PricingMenuPlan } from '@/types/billing';

interface Props {
  plan: PricingMenuPlan;
  loading: boolean;
}

defineProps<Props>();
const emit = defineEmits<{
  select: [planId: string];
  contact: [];
}>();

const { t } = useI18n();
</script>
