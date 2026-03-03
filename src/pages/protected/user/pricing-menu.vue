<template>
  <div class="min-h-screen">
    <!-- Billing Status Alert -->
    <div v-if="!billingEnabled" class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20"
      >
        <div class="flex">
          <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <div class="ml-3">
            <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {{ t('billing.disabled') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing Cards -->
    <div class="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p class="mt-4 text-gray-600 dark:text-gray-400">{{ t('common.loading') }}</p>
        </div>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <PricingMenuCard
          v-for="plan in pricingPlans"
          :key="plan.id"
          :plan="plan"
          :loading="loadingPlanId === plan.id && !plan.contactSales"
          @select="handleSelectPlan"
          @contact="handleContactSales"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { createCheckoutSession } from '@/api/billing';
import PricingMenuCard from '@/components/billing/PricingMenuCard.vue';
import { usePricingPlans } from '@/composables/billing/usePricingPlans';
import { useBilling } from '@/composables/query/useBilling';

const { t } = useI18n();

const loadingPlanId = ref<string | null>(null);
const { plans: pricingPlans } = usePricingPlans();

const { isBillingEnabled: billingEnabled, isLoadingBillingStatus: isLoading } = useBilling({
  requireAuth: false,
});

const handleSelectPlan = async (planId: string) => {
  try {
    loadingPlanId.value = planId;
    const result = await createCheckoutSession(planId);
    if (result.data?.url) {
      window.location.href = result.data.url;
    }
  } catch (error) {
    console.error('Failed to create checkout session:', error);
  } finally {
    loadingPlanId.value = null;
  }
};

const handleContactSales = () => {
  window.location.href =
    'mailto:support@interior-helper.app?subject=Contact%20Sales%20-%20Lite%20Seat';
};
</script>
