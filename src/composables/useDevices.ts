/**
 * 用於管理設備相關的狀態和操作，包括設備列表的加載、編輯、過濾和排序等功能。
 *
 * @returns {Object}
 * @returns {Ref<Device[]>} devices - 設備列表
 * @returns {Ref<Device | null>} selectedDevice - 當前選中的設備
 * @returns {Ref<boolean>} showEditDialog - 控制編輯對話框的顯示狀態
 * @returns {Ref<boolean>} isEditing - 是否正在編輯設備
 * @returns {Ref<boolean>} isLoading - 設備列表加載狀態
 * @returns {Ref<string | null>} lastUpdateTime - 最後更新時間
 * @returns {ComputedRef<boolean>} hasDevices - 是否有設備數據
 * @returns {Function} editDevice - 開始編輯設備
 * @returns {Function} updateDevice - 更新設備信息
 * @returns {Function} closeEditDialog - 關閉編輯對話框
 * @returns {Function} sortDevices - 設備列表排序
 * @returns {Function} filterDevices - 設備列表過濾
 * @returns {Function} getLocalizedField - 獲取本地化的字段名稱
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';

import type { Device } from '@/types/device';
import type { Ref } from 'vue/dist/vue.js';

import { deviceApi } from '@/api/device';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { ObservationType } from '@/types/device';

const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

interface UseDevicesReturn {
  devices: Ref<Device[]>;
  fetchedDevices: Ref<Device[] | undefined>;
  isLoading: Ref<boolean>;
  lastUpdateTime: Ref<string | null>;
  selectedDevice: Ref<Device | null>;
  showEditDialog: Ref<boolean>;
  isEditing: Ref<boolean>;
  hasDevices: Ref<boolean>;
  editDevice: (device: Device) => void;
  patchDevice: (deviceId: string, updates: Partial<Device>) => Promise<Device>;
  applyLocalUpdate: (deviceId: string, updates: Partial<Device>) => void;
  closeEditDialog: () => void;
  sortDevices: (field: keyof Device, order: 'asc' | 'desc') => void;
  filterDevices: (query: string) => Device[];
  getLocalizedField: (fieldName: keyof Device) => string;
}

// todo: add observationType
export function useDevices(type: ObservationType): UseDevicesReturn {
  // 狀態管理
  const devices = ref<Device[]>([]);
  const selectedDevice = ref<Device | null>(null);
  const showEditDialog = ref<boolean>(false);
  const isEditing = ref<boolean>(false);

  // 加載狀態
  const { data: fetchedDevices, isLoading } = useQuery({
    queryKey: ['devices', type],
    queryFn: async (): Promise<Device[]> => {
      try {
        const response = await deviceApi.getDevices({ label: type });

        // 初始化欄位
        return response.data.devices
          .map((device: Device) => ({
            ...device,
            ph: undefined,
            temperature: undefined,
            mv: undefined,
            zero: undefined,
            slope: undefined,
            ppm: undefined,
          }))
          .sort((a, b) => {
            const statusOrder: Record<string, number> = {
              stopped: 0,
              warning: 1,
              caution: 2,
              running: 3,
            };
            const aOrder = statusOrder[a.status] ?? 2;
            const bOrder = statusOrder[b.status] ?? 2;
            return aOrder - bOrder;
          });
      } catch (error) {
        console.error('Failed to fetch devices:', error);
        return [];
      }
    },
    staleTime: 0,
    gcTime: 1000 * 30,
  });

  watch(fetchedDevices, (newVal) => {
    if (newVal) {
      devices.value = newVal ?? [];
      updateLastUpdateTime();
    }
  });

  // 計算屬性
  const hasDevices: Ref<boolean> = computed(() => devices.value.length > 0);

  // 設備操作方法
  const editDevice = (device: Device): void => {
    selectedDevice.value = { ...device };
    showEditDialog.value = true;
    isEditing.value = true;
  };

  const closeEditDialog = (): void => {
    selectedDevice.value = null;
    isEditing.value = false;
    showEditDialog.value = false; // 順序有影響
  };

  const patchDevice = async (deviceId: string, updates: Partial<Device>): Promise<Device> => {
    try {
      const response = await deviceApi.patchDevice(deviceId, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update device:', error);
      throw new Error('Failed to update device');
    }
  };

  // 樂觀更新
  const applyLocalUpdate = (deviceId: string, updates: Partial<Device>): void => {
    const index = devices.value.findIndex((device: Device) => device.ID === deviceId);
    if (index !== -1) {
      devices.value[index] = { ...devices.value[index], ...updates };
    }
  };

  // 過濾和排序
  const sortDevices = (field: keyof Device, order: 'asc' | 'desc') => {
    devices.value.sort((a, b) => {
      const valueA = a[field];
      const valueB = b[field];
      if (order === 'asc') {
        if (valueA === undefined || valueB === undefined) return 0;
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      }
      if (valueA === undefined || valueB === undefined) return 0;
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    });
  };

  const filterDevices = (query: string): Device[] => {
    if (!query) return devices.value;

    const searchQuery = query.toLowerCase();
    return devices.value.filter((device: Device) =>
      Object.entries(device).some(([value]) => String(value).toLowerCase().includes(searchQuery))
    );
  };

  // 本地化
  const getLocalizedField = (fieldName: keyof Device): string => {
    // 這裡可以根據 currentLanguage 返回對應的翻譯
    return fieldName;
  };

  return {
    // 狀態
    devices,
    fetchedDevices,
    selectedDevice,
    showEditDialog,
    isEditing,
    isLoading,
    lastUpdateTime,

    // 計算屬性
    hasDevices,

    // 方法
    editDevice,
    patchDevice,
    applyLocalUpdate,
    closeEditDialog,
    sortDevices,
    filterDevices,
    getLocalizedField,
  };
}
