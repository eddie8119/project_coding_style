import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';

import type { BillingStatus } from '@/api/billing';

import { getBillingStatus } from '@/api/billing';
import { useAuthStore } from '@/stores/useAuthStore';
import { isAccessTokenValid } from '@/utils/auth';

interface UseBillingReturn {
  billingStatus: Ref<BillingStatus | undefined>;
  isBillingEnabled: Ref<boolean>;
  isLoadingBillingStatus: Ref<boolean>;
  billingStatusError: Ref<Error | null>;
  refetchBillingStatus: () => Promise<void>;
}

interface UseBillingOptions {
  enabled?: boolean;
  requireAuth?: boolean;
}

const QUERY_KEY = 'billing-status';

export const useBilling = (options?: UseBillingOptions): UseBillingReturn => {
  const authStore = useAuthStore();

  const isAuthAndTokenValid = computed(() => authStore.isAuthenticated && isAccessTokenValid());

  const queryEnabled = computed(() => {
    if (options?.enabled === false) {
      return false;
    }

    if (options?.requireAuth === false) {
      return true;
    }

    return isAuthAndTokenValid.value;
  });

  const {
    data: billingStatus,
    isLoading: isLoadingBillingStatus,
    error: billingStatusError,
    refetch: refetchQueryBillingStatus,
  } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getBillingStatus,
    enabled: queryEnabled,
    staleTime: 1000 * 60 * 5,
  });

  const isBillingEnabled = computed(() => billingStatus.value?.enabled ?? false);

  const refetchBillingStatus = async (): Promise<void> => {
    await refetchQueryBillingStatus();
  };

  return {
    billingStatus,
    isBillingEnabled,
    isLoadingBillingStatus,
    billingStatusError,
    refetchBillingStatus,
  };
};
