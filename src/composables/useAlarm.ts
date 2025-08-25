/**
 * 用於獲取主題儀器列的 警報設定。
 *
 * @returns {Object}
 * @returns {Ref<boolean>} isLoading - 警報設定加載狀態
 * @returns {Ref<AlarmSetting[]>} fetchedDevicesAlarms - 從API獲取的警報設定
 * @returns {Ref<string>} lastUpdateTime - 最後更新時間
 */

import { useQuery } from '@tanstack/vue-query';

import type { AlarmSetting } from '@/types/alarm';
import type { Ref } from 'vue/dist/vue.js';

import { alarmApi } from '@/api/alarm';
import { useUpdateTime } from '@/composables/useUpdateTime';

const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

interface UseAlarmReturn {
  isLoading: Ref<boolean>;
  fetchedDevicesAlarms: Ref<AlarmSetting[]>;
  lastUpdateTime: Ref<string | null>;
}

export function useAlarm(): UseAlarmReturn {
  // 加載狀態
  const { data: fetchedDevicesAlarms, isLoading } = useQuery({
    queryKey: ['alarm'],
    queryFn: async () => {
      const response = await alarmApi.getAlarmsSetting();
      if (response.data.data) {
        updateLastUpdateTime();
      }
      return response.data.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: true,
  });

  return {
    isLoading,
    fetchedDevicesAlarms: fetchedDevicesAlarms as Ref<AlarmSetting[]>,
    lastUpdateTime,
  };
}
