<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <ProgressSpinner v-if="isLoading" />
  <div v-if="isReady">
    <div class="relative flex h-screen flex-col">
      <div class="mb-4 flex-none">
        <TabNoLink v-model="locationIndex" :tabs-list="state.locations" />
      </div>
      <ShowUpdateTime :last-update-time="lastUpdateTime" />
      <div class="grid flex-1 grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-4">
        <DBGaugeChart v-for="gauge in deviceMeasurements" :key="gauge.ID" :gauge-props="gauge" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core';
import { ElMessage } from 'element-plus';
import { ref, watch } from 'vue';

import type { DeviceProps } from '@/types/record';

import { datainsightsApi } from '@/api/datainsights';
import { entitiesApi } from '@/api/entities';
import DBGaugeChart from '@/components/core/chart/gauge/DBGaugeChart.vue';
import ProgressSpinner from '@/components/core/ProgressSpinner.vue';
import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import TabNoLink from '@/components/core/tab/TabNoLink.vue';
import { useLocation } from '@/composables/useLocation';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { useWebSocket } from '@/composables/useWebSocket';
import { cleanID, sortByKey } from '@/utils/common';

const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();
const { wsParsedData } = useWebSocket();
const { locationIndex, getLocationDetails, fetchLocations } = useLocation();

const deviceMeasurements = ref<DeviceProps[]>([]);

// WebSocket 更新畫面、狀態等
watch(wsParsedData, (newVal: DeviceProps) => {
  if (!newVal) return;
  if (newVal) {
    const idx = deviceMeasurements.value.findIndex((device) => device.group === newVal.ID);
    if (idx !== -1) {
      deviceMeasurements.value[idx] = {
        ...deviceMeasurements.value[idx],
        ...newVal,
      };
      deviceMeasurements.value = [...deviceMeasurements.value]; // 觸發響應
      updateLastUpdateTime();
    }
  }
});

const fetchDevicesLatestMeasure = async (ids: string): Promise<Record<string, DeviceProps>> => {
  if (!ids) return {};
  try {
    const { data } = await datainsightsApi.getLatestMeasure(ids);
    return data.data.reduce(
      (acc, device) => {
        acc[cleanID(device.ID)] = device;
        return acc;
      },
      {} as Record<string, DeviceProps>
    );
  } catch (error) {
    ElMessage.error('取得裝置測量資料失敗');
    return {};
  }
};

// 封裝取得並合併裝置資料
// const getDeviceMeasurements = async (locationName: string): Promise<DeviceProps[]> => {
//   try {
//     const locationRes = await getLocationDetails(locationName);
//     const devices = locationRes?.data.devices || [];
//     if (!devices.length) return [];

//     const ids = devices.map((d) => d.ID).join(',');
//     const latestMeasures = await fetchDevicesLatestMeasure(ids);

//     // 合併裝置基本資料與最新測量
//     return devices
//       .filter((device) => latestMeasures[device.ID])
//       .map((device) => ({
//         ...device,
//         ...latestMeasures[device.ID],
//       }))
//       .sort((a, b) => sortByKey(a, b, 'tag'));
//   } catch (error) {
//     ElMessage.error('取得裝置資料失敗');
//     return [];
//   }
// };

// Data processing
const processLocationDevices = (
  locationDetailsResponse: Awaited<ReturnType<typeof entitiesApi.getLocationDetails>>,
  devicesLatestMeasure: Record<string, DeviceProps>
): DeviceProps[] => {
  return locationDetailsResponse.data.devices
    .filter((deviceDetail) => devicesLatestMeasure[deviceDetail.ID])
    .map((deviceDetail) => ({
      ...deviceDetail,
      ...devicesLatestMeasure[deviceDetail.ID],
    }));
};

//  拿測值 Fetch device measurements for the given device IDs
const fetchDeviceMeasurements = async (devices: DeviceProps[]) => {
  if (!devices || devices.length === 0) return [];

  try {
    const ids = devices.map((device: DeviceProps) => device.ID).join(',');

    const devicesLatestMeasure = await fetchDevicesLatestMeasure(ids);
    return devicesLatestMeasure;
  } catch (error) {
    console.error('Error fetching device measurements:', error);
    ElMessage.error('Failed to fetch device measurements');
    return {};
  }
};

// Update device measurements for the current location
const updateDeviceMeasurements = async (
  locationDevicesResponse: Awaited<ReturnType<typeof entitiesApi.getLocationDetails>>,
  devicesLatestMeasure: Record<string, DeviceProps>
) => {
  if (!locationDevicesResponse || !devicesLatestMeasure) return;

  try {
    const updatedDeviceMeasurements = processLocationDevices(
      locationDevicesResponse,
      devicesLatestMeasure
    );
    // console.log('locationDevicesResponseddd', locationDevicesResponse);
    // console.log('devicesLatestMeasure', devicesLatestMeasure);
    console.log('updatedDeviceMeasurementsdddd222', updatedDeviceMeasurements);

    deviceMeasurements.value = [...updatedDeviceMeasurements].sort((a, b) =>
      sortByKey(a, b, 'tag')
    );
  } catch (error) {
    console.error('Error updating device measurements:', error);
    ElMessage.error('Failed to update device measurements');
  }
};

const getLocationData = async (index: number): Promise<void> => {
  deviceMeasurements.value = [];
  const location = state.value.locations[index];
  if (!location?.name) return;

  // Step 1: Get location details
  const locationDevicesResponse = await getLocationDetails(location.name);
  if (!locationDevicesResponse) return;

  // Step 2: Fetch device measurements
  const devicesLatestMeasure = await fetchDeviceMeasurements(locationDevicesResponse.data.devices);

  // Step 3: Update the UI with the measurements
  await updateDeviceMeasurements(locationDevicesResponse, devicesLatestMeasure);
};

const initialState = {
  locations: [] as LocationData[],
};

const { state, isReady, isLoading } = useAsyncState(fetchLocations, initialState, {
  immediate: true,
  resetOnExecute: false,
  onSuccess: () => {
    getLocationData(locationIndex.value);
  },
  onError: (error) => {
    console.error('Error fetching locations:', error);
    ElMessage.error('Failed to fetch locations');
  },
});

let isFirstLoad = true;
watch(locationIndex, (newIndex: number) => {
  if (!isFirstLoad) {
    getLocationData(newIndex);
  }
  isFirstLoad = false;
});
</script>

<style lang="scss" scoped></style> -->
