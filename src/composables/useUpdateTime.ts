/**
 * 用於提供「最後更新時間」字串，
 * 可透過 `updateLastUpdateTime()` 手動更新為當前時間。
 *
 * @returns {Object}
 * @returns {Ref<string | null>} lastUpdateTime - 響應式的最後更新時間字串。
 * @returns {Function} updateLastUpdateTime - 會將 lastUpdateTime 更新為目前的當地時間。
 */

import { ref, type Ref } from 'vue';

interface UseUpdateTimeReturn {
  lastUpdateTime: Ref<string | null>;
  updateLastUpdateTime: () => void;
}

export const useUpdateTime = (): UseUpdateTimeReturn => {
  const lastUpdateTime = ref<string | null>(null);
  // 選用null- 代表的是「從未更新過」。這是一個我們刻意設定的、明確的「空」狀態

  const updateLastUpdateTime = (): void => {
    lastUpdateTime.value = new Date().toLocaleString();
  };

  return {
    lastUpdateTime,
    updateLastUpdateTime,
  };
};
