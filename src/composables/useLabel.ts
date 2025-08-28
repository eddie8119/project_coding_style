/**
 * 用於獲取。
 *
 * @returns {Object}
 */

import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DeviceWithAlarms, DeviceWithStatus } from '@/types/label';

import { labelApi } from '@/api/label';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { formatRelativeTime } from '@/utils/dateTime';

interface UseLabelReturn {
  isLoadingAlarmRecords: Ref<boolean>;
  isLoadingLabels: Ref<boolean>;
  fetchedLabels: Ref<DeviceWithStatus[]>;
  formattedAlarmRecords: Ref<DeviceWithAlarms[]>;
  refetchAlarmRecords: () => Promise<void>;
  refetchLabels: () => Promise<void>;
  lastUpdateTime: Ref<string | null>;
}

export function useLabel(): UseLabelReturn {
  const { t } = useI18n();
  const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();
  const queryClient = useQueryClient();

  const {
    data: fetchedLabels,
    isLoading: isLoadingLabels,
    refetch: refetchQueryLabels,
  } = useQuery<DeviceWithStatus[], Error, DeviceWithStatus[], ['labels']>({
    queryKey: ['labels'],
    queryFn: async () => {
      const response = await labelApi.getLabels();
      updateLastUpdateTime();
      return response.data;
    },
    staleTime: 0,
    gcTime: 0,
  });

  const refetchLabels = async (): Promise<void> => {
    // 添加隨機參數防止緩存
    await queryClient.invalidateQueries({ queryKey: ['labels'] });
    await refetchQueryLabels();
  };

  const {
    data: fetchedLabelsAlarmRecords,
    isLoading: isLoadingAlarmRecords,
    refetch: refetchQueryAlarmRecords,
  } = useQuery<DeviceWithAlarms[]>({
    queryKey: ['labels', 'alarmRecords'],
    queryFn: async () => {
      const response = await labelApi.getAlarmRecords({ alarm_status: 'unresolved' });
      return response.data;
    },
    staleTime: 0, // 保持預設
    gcTime: 0, // 保持預設
  });

  const refetchAlarmRecords = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['labels', 'alarmRecords'] });
    await refetchQueryAlarmRecords();
  };

  const formattedAlarmRecords = computed(() => {
    if (!fetchedLabelsAlarmRecords.value) return [];
    // 先格式化，再排序
    return fetchedLabelsAlarmRecords.value
      .map((record: DeviceWithAlarms) => {
        const id = record.ID.split('_')[0];
        const parts = record.version ? record.version.split('#') : [];
        const status = parts.length > 1 ? parts[1] : 'N/A';
        const rawTimestamp = parts.length > 2 ? parts[2] : null;
        const time = formatRelativeTime(rawTimestamp, t);
        return {
          ...record,
          id,
          status,
          time,
          rawTimestamp: rawTimestamp ? parseInt(rawTimestamp, 10) : 0,
        };
      })
      .sort((a, b) => {
        const aHasW = a.status.includes('W');
        const bHasW = b.status.includes('W');

        // W 優先級高於 C
        if (aHasW && !bHasW) return -1; // a 有 W，b 沒有 W，a 排前面
        if (!aHasW && bHasW) return 1; // b 有 W，a 沒有 W，b 排前面

        // alarm_status 相同時，再依 timestamp 由近到遠
        return (b.rawTimestamp ?? 0) - (a.rawTimestamp ?? 0);
      });
  });

  return {
    isLoadingAlarmRecords,
    isLoadingLabels,
    fetchedLabels: fetchedLabels as Ref<DeviceWithStatus[]>,
    refetchLabels,
    refetchAlarmRecords,
    formattedAlarmRecords,
    lastUpdateTime,
  };
}
