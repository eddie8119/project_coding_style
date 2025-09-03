/**
 * 用於獲取主題儀器列的 警報設定。
 *
 * @returns {Object}
 * @returns {Ref<boolean>} isLoading - 警報設定加載狀態
 * @returns {Ref<AlarmRecord[]>} formattedDeviceAlarmRecords - 警報設定
 * @returns {Ref<string | null>} lastUpdateTime - 最後更新時間
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, watchEffect } from 'vue';

import type { AlarmRecord } from '@/types/alarm';
import type { Ref } from 'vue/dist/vue.js';

import { alarmApi } from '@/api/alarm';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { AlarmStatus } from '@/types/label';

const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

interface UseAlarmRecordsReturn {
  isLoading: Ref<boolean>;
  lastUpdateTime: Ref<string | null>;
  formattedDeviceAlarmRecords: Ref<AlarmRecord[] | null>;
  refetchDeviceAlarmsRecords: () => Promise<void>;
}

export function useAlarmRecords(id: string): UseAlarmRecordsReturn {
  const {
    data: fetchedDeviceAlarmsRecords,
    isLoading,
    isSuccess,
    refetch: refetchQueryAlarmsRecords,
  } = useQuery({
    queryKey: ['device-alarm-records', id],
    queryFn: async () => {
      try {
        const response = await alarmApi.getDeviceAlarmRecords(id);
        return response.data;
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    enabled: computed(() => !!id),
  });

  const refetchDeviceAlarmsRecords = async (): Promise<void> => {
    await refetchQueryAlarmsRecords();
  };

  watchEffect(() => {
    if (isSuccess.value) {
      updateLastUpdateTime();
    }
  });

  const formattedDeviceAlarmRecords = computed(() => {
    const device = fetchedDeviceAlarmsRecords.value;
    if (!device || !Array.isArray(device.alarm_records)) return null;

    return device.alarm_records
      .map((alarm) => {
        const parts = alarm.version ? alarm.version.split('#') : [];
        const severity = parts.length > 1 ? parts[1] : 'N/A';
        const rawTimestamp = parts.length > 2 ? parts[2] : '';
        const timestampNum = parseInt(rawTimestamp, 10);
        const timestamp = new Date(timestampNum).toLocaleString();
        return {
          ...alarm,
          alarm_status: alarm.alarm_status as AlarmStatus,
          device: device.device,
          severity,
          timestamp,
          timestampNum,
        };
      })
      .sort((a, b) => {
        // 1. unresolved 優先
        if (a.alarm_status !== b.alarm_status) {
          return a.alarm_status === AlarmStatus.UNRESOLVED ? -1 : 1;
        }
        // 2. 其餘依 timestamp 由新到舊
        return (b.timestampNum || 0) - (a.timestampNum || 0);
      });
  });

  return {
    isLoading,
    lastUpdateTime,
    formattedDeviceAlarmRecords,
    refetchDeviceAlarmsRecords,
  };
}
