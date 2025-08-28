/**
 * 用於管理設備相關的狀態和操作，包括設備列表的加載、編輯、過濾和排序等功能。
 *
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, ref, toValue, watch } from 'vue';

import type { Device } from '@/types/device';
import type { MaybeRefOrGetter, Ref } from 'vue';

import { deviceApi } from '@/api/device';
import { useUpdateTime } from '@/composables/useUpdateTime';

const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

interface UseDeviceReturn {
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  device: Ref<Device | undefined>;
  refetchDevice: () => Promise<void>;
  fetchedDevice: Ref<Device | undefined>;
  lastUpdateTime: Ref<string | null>;
  patchDevice: (deviceId: string, updates: Partial<Device>) => Promise<void>;
  applyLocalUpdate: (updates: Partial<Device>) => void;
}

export function useDevice(id: MaybeRefOrGetter<string>): UseDeviceReturn {
  const device = ref<Device | undefined>();

  // 設備查詢
  const {
    data: fetchedDevice,
    isLoading,
    error,
    refetch: refetchQueryDevice,
  } = useQuery({
    queryKey: ['device', id],
    queryFn: async (): Promise<Device | null> => {
      const deviceId = toValue(id);
      if (!deviceId) return null;

      const response = await deviceApi.getDevice(deviceId);
      updateLastUpdateTime();
      return response.data.device;
    },
    staleTime: 0,
    gcTime: 1000 * 30,
    enabled: computed(() => !!toValue(id)), // 只有當 id 存在時才執行查詢
    retry: (failureCount, error) => {
      // 自定義重試邏輯
      if (error instanceof Error && error.message.includes('404')) {
        return false; // 不重試 404 錯誤
      }
      return failureCount < 3;
    },
  });

  // 使用包裝函式  不然都必須知道 QueryObserverResult 這個來自 @tanstack/vue-query 套件的特定類型。這形成了一種「洩漏抽象」的設計。
  const refetchDevice = async (): Promise<void> => {
    await refetchQueryDevice();
  };

  watch(fetchedDevice, (newVal) => {
    if (newVal) {
      device.value = newVal;
      updateLastUpdateTime();
    }
  });

  // Function to apply local updates to the device state
  const applyLocalUpdate = (updates: Partial<Device>) => {
    if (fetchedDevice.value) {
      fetchedDevice.value = { ...fetchedDevice.value, ...updates };
    }
  };

  const patchDevice = async (deviceId: string, updates: Partial<Device>) => {
    try {
      // Optimistically update the local state
      applyLocalUpdate(updates);

      // Make the API call
      await deviceApi.patchDevice(deviceId, updates);

      // Optionally, refetch to ensure consistency
      // await refetchDevice();
    } catch (err) {
      console.error('Failed to patch device:', err);
      // Revert the optimistic update on failure
      // You might want to store the original state before patching to revert accurately
      // For now, we can refetch to get the server state
      await refetchDevice();
      throw err; // Re-throw the error to be handled by the caller
    }
  };

  return {
    isLoading,
    error,
    device,
    refetchDevice,
    fetchedDevice: fetchedDevice as Ref<Device | undefined>,
    lastUpdateTime,
    patchDevice,
    applyLocalUpdate,
  };
}

// 為什麼不用 fetchedDevice，改用 device？
// API 資料 fetchedDevice，UI 用複製體 device）完全正確且推薦，這是現代前端常見的資料流設計模式！
