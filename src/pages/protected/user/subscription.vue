<template>
  <div class="min-h-screen">
    <!-- Header -->
    <!-- <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ t('billing.mySubscription') }}
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {{ t('billing.subscriptionDescription') }}
      </p>
    </div> -->

    <!-- Content -->
    <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div v-if="isLoading">
        <Loading />
      </div>

      <!-- No Subscription -->
      <div
        v-else-if="!subscription"
        class="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="text-center">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            {{ t('billing.noActiveSubscription') }}
          </h3>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            {{ t('billing.noActiveSubscriptionDesc') }}
          </p>
          <RouterLink
            to="/user/pricing-menu"
            class="mt-6 inline-block rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
          >
            {{ t('billing.browsePlans') }}
          </RouterLink>
        </div>
      </div>

      <!-- Active Subscription -->
      <div v-else class="space-y-6">
        <!-- Subscription Card -->
        <div
          class="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ subscription.plan }}
              </h2>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                {{ t(`billing.status.${subscription.status}`) }}
              </p>
            </div>
            <span
              :class="[
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                subscription.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
              ]"
            >
              {{ t(`billing.status.${subscription.status}`) }}
            </span>
          </div>

          <!-- Period Info -->
          <div class="mt-8 grid grid-cols-2 gap-6">
            <div v-for="info in periodInfo" :key="info.key">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t(info.labelKey) }}
              </p>
              <p class="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                {{ info.value }}
              </p>
            </div>
          </div>

          <!-- Cancellation Info -->
          <div
            v-if="subscription.cancel_at_period_end"
            class="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20"
          >
            <p class="text-sm text-yellow-800 dark:text-yellow-200">
              {{
                t('billing.cancelledAtPeriodEnd', {
                  date: formatDate(subscription.current_period_end),
                })
              }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4">
          <button
            v-for="button in actionButtons"
            :key="button.key"
            :class="button.class"
            @click="button.handler"
          >
            {{ t(button.labelKey) }}
          </button>
        </div>

        <!-- Billing History -->
        <div
          class="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('billing.billingHistory') }}
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ t('billing.billingHistoryDesc') }}
          </p>
          <button
            class="mt-4 rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
            @click="handleViewBillingHistory"
          >
            {{ t('billing.viewInvoices') }}
          </button>
        </div>

        <!-- Plan Upgrades -->
        <div
          class="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ t('billing.pricing') }}
            </h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {{ t('billing.pricingDescription') }}
            </p>
          </div>
          <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate as formatDateFn } from 'date-fns';
import { ElMessageBox } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UserSubscription } from '@/types/billing';

import {
  cancelSubscription,
  createCheckoutSession,
  createCustomerPortalSession,
  getUserSubscription,
} from '@/api/billing';
import PricingMenuCard from '@/components/billing/PricingMenuCard.vue';
import Loading from '@/components/core/loading/Loading.vue';
import { usePricingPlans } from '@/composables/billing/usePricingPlans';

const { t } = useI18n();

const isLoading = ref(false);
const subscription = ref<UserSubscription | null>(null);
const loadingPlanId = ref<string | null>(null);
const { plans: pricingPlans } = usePricingPlans();

const formatDate = (dateString: string) => {
  return formatDateFn(new Date(dateString), 'MMM dd, yyyy');
};

const periodInfo = computed(() => {
  if (!subscription.value) {
    return [];
  }

  return [
    {
      key: 'currentPeriodStart',
      labelKey: 'billing.currentPeriodStart',
      value: formatDate(subscription.value.current_period_start),
    },
    {
      key: 'currentPeriodEnd',
      labelKey: 'billing.currentPeriodEnd',
      value: formatDate(subscription.value.current_period_end),
    },
  ];
});

onMounted(async () => {
  try {
    isLoading.value = true;
    subscription.value = await getUserSubscription();
  } catch (error) {
    console.error('Failed to load subscription:', error);
  } finally {
    isLoading.value = false;
  }
});

const handleManagePayment = async () => {
  try {
    const result = await createCustomerPortalSession();
    if (result.data?.url) {
      window.location.href = result.data.url;
    }
  } catch (error) {
    console.error('Failed to create customer portal session:', error);
  }
};

const handleCancelSubscription = async () => {
  try {
    await ElMessageBox.confirm(t('billing.confirmCancel'), t('common.warning'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    });
  } catch {
    return;
  }

  try {
    await cancelSubscription();
    subscription.value = await getUserSubscription();
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
  }
};

const handleResumeSubscription = async () => {
  try {
    subscription.value = await getUserSubscription();
  } catch (error) {
    console.error('Failed to resume subscription:', error);
  }
};

const handleViewBillingHistory = async () => {
  try {
    const result = await createCustomerPortalSession();
    if (result.data?.url) {
      window.location.href = result.data.url;
    }
  } catch (error) {
    console.error('Failed to open customer portal:', error);
  }
};

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

const actionButtons = computed(() => {
  const sub = subscription.value;

  const buttons = [
    {
      key: 'manage',
      class:
        'flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
      labelKey: 'billing.managePayment',
      handler: handleManagePayment,
    },
  ];

  if (!sub) {
    return buttons;
  }

  if (!sub.cancel_at_period_end) {
    buttons.push({
      key: 'cancel',
      class:
        'flex-1 rounded-lg border border-red-300 bg-white px-6 py-3 font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-600 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-gray-600',
      labelKey: 'billing.cancelSubscription',
      handler: handleCancelSubscription,
    });
  } else {
    buttons.push({
      key: 'resume',
      class:
        'flex-1 rounded-lg border border-green-300 bg-white px-6 py-3 font-semibold text-green-600 transition-colors hover:bg-green-50 dark:border-green-600 dark:bg-gray-700 dark:text-green-400 dark:hover:bg-gray-600',
      labelKey: 'billing.resumeSubscription',
      handler: handleResumeSubscription,
    });
  }

  return buttons;
});
</script>
