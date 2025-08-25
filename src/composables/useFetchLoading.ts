/**
 * 用於獲取主題儀器列的 警報設定。
 *
 * @returns {Object}
 * @returns {boolean} isLoading - 加載狀態
 * @returns {boolean} hasFetched - 是否已經獲取過數據
 */

import { ref, type Ref } from 'vue';

interface UseFetchLoading {
  isLoading: Ref<boolean>;
  hasFetched: Ref<boolean>;
  updateLoading: (loading: boolean) => void;
  updateHasFetched: (fetched: boolean) => void;
}

export function useFetchLoading(): UseFetchLoading {
  const hasFetched = ref(false);
  const isLoading = ref(false);

  const updateLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const updateHasFetched = (fetched: boolean) => {
    hasFetched.value = fetched;
  };

  return {
    isLoading,
    hasFetched,
    updateLoading,
    updateHasFetched,
  };
}
