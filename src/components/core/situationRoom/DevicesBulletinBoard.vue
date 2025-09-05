<template>
  <div class="relative flex flex-col">
    <Table
      :data="devices"
      :columns="observation.columns"
      :loading="isLoading"
      :show-id-column="true"
      :show-actions="false"
      :show-search="true"
      :show-pagination="true"
      :last-update-time="lastUpdateTime"
      :observation-type="props.observationType"
      :actions="[]"
      max-height="calc(100vh - 360px)"
      @edit="() => {}"
    >
      <!-- Add this new template slot -->
      <template #product_name="{ row }">
        <p class="uppercase">{{ row.product_name }}</p>
      </template>
      <template #ph_measurement_value="{ row }">
        <span v-if="row.ph === null || row.ph === undefined">N/A</span>
        <!-- 注意undefined情境  沒定義會跑到 v-else -->
        <ProgressBar v-else :value="row.ph ?? 0" :observation-type="props.observationType" />
      </template>
      <template #ppm_measurement_value="{ row }">
        <span v-if="row.ppm === null || row.ppm === undefined">N/A</span>
        <ProgressBar v-else :value="row.ppm ?? 0" :observation-type="props.observationType" />
      </template>
      <template #mv_measurement_value="{ row }">
        <span v-if="row.mv === null || row.mv === undefined">N/A</span>
        <ProgressBar v-else :value="row.mv ?? 0" :observation-type="props.observationType" />
      </template>
      <template #status="{ row }">
        <StatusShow :status="row.status ?? DeviceStatus.RUNNING" />
      </template>
      <template #action_status="{ row }">
        <StatusShow :status="row.action_status ?? DeviceActionStatus.IDLE" />
      </template>
    </Table>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

import type { CaliData } from '@/types/calibration';
import type {
  Device,
  FlourideDevice,
  NH3NDevice,
  ORPDevice,
  PHDevice,
  RealTimeData,
} from '@/types/device';
import type { Measure } from '@/types/measure';

import ProgressBar from '@/components/core/chart/ProgressBar.vue';
import StatusShow from '@/components/core/StatusShow.vue';
import Table from '@/components/core/table/Table.vue';
import { useDataInsights } from '@/composables/useDataInsights';
import { useDevices } from '@/composables/useDevices';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { useWebSocket } from '@/composables/useWebSocket';
import { FLUORIDE_DEVICES_MONITOR_COLUMNS } from '@/constants/columns/flouride';
import { NH3N_DEVICES_MONITOR_COLUMNS } from '@/constants/columns/nh3n';
import { ORP_DEVICES_MONITOR_COLUMNS } from '@/constants/columns/orp';
import { PH_DEVICES_MONITOR_COLUMNS } from '@/constants/columns/ph';
import { DeviceActionStatus, DeviceStatus } from '@/types/device';
import { ObservationType } from '@/types/device';

const props = defineProps<{ observationType: ObservationType }>();

const { devices, isLoading, fetchedDevices } = useDevices(props.observationType);
const { wsParsedData } = useWebSocket();
const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();
const { fetchLatestMeasure, fetchLatestCalibration } = useDataInsights();

const observation = computed(() => {
  switch (props.observationType) {
    case ObservationType.PH:
      return {
        columns: PH_DEVICES_MONITOR_COLUMNS,
      };
    case ObservationType.ORP:
      return {
        columns: ORP_DEVICES_MONITOR_COLUMNS,
      };
    case ObservationType.NH3N:
      return {
        columns: NH3N_DEVICES_MONITOR_COLUMNS,
      };
    case ObservationType.FLOURIDE:
      return {
        columns: FLUORIDE_DEVICES_MONITOR_COLUMNS,
      };
    default:
      return {
        columns: PH_DEVICES_MONITOR_COLUMNS,
      };
  }
});

const initFetchData = async () => {
  try {
    let ids = '';
    devices.value.forEach((device: Device) => {
      ids += device.ID + ',';
    });

    // 資料加工 將不同來源指標合併到devices.value
    if (ids) {
      const latestMeasures = await fetchLatestMeasure(ids);
      const latestCalibrations = await fetchLatestCalibration(ids);

      devices.value.forEach((device: Device) => {
        const measure = latestMeasures.find((m: Measure) => m.ID === device.ID + '_measurement');
        const calibration = latestCalibrations.find(
          (c: CaliData) => c.ID === device.ID + '_calibration'
        );

        switch (props.observationType) {
          case 'ph':
            if (measure) {
              (device as PHDevice).ph = measure.ph;
              (device as PHDevice).temperature = measure.temperature;
              (device as PHDevice).mv = measure.mv;
            }
            if (calibration) {
              (device as PHDevice).slope = calibration.slope;
              (device as PHDevice).zero = calibration.zero;
            }
            break;
          case 'orp':
            if (measure) {
              (device as ORPDevice).mv = measure.mv;
            }
            if (calibration) {
              (device as ORPDevice).offset = calibration.offset;
            }
            break;
          case 'nh3n':
            if (measure) {
              (device as NH3NDevice).ppm = measure.ppm;
            }
            if (calibration) {
              (device as NH3NDevice).sensitivity = calibration.sensitivity;
            }
            break;
          case 'flouride':
            if (measure) {
              (device as FlourideDevice).ppm = measure.ppm;
            }
            if (calibration) {
              (device as FlourideDevice).sensitivity = calibration.sensitivity;
            }
            break;
        }
      });
    }

    return;
  } catch (error) {
    console.error(error);
  }
};

const handleRealTimeUpdate = (realTimeData: RealTimeData) => {
  const idx = devices.value.findIndex((device: Device) => device.ID === realTimeData.ID);
  if (idx === -1) return;

  const deviceToUpdate = devices.value[idx];
  const dataToUpdate = { ...realTimeData };

  delete (dataToUpdate as Partial<RealTimeData>).app;
  delete (dataToUpdate as Partial<RealTimeData>).version;

  devices.value[idx] = { ...deviceToUpdate, ...dataToUpdate };
  devices.value = [...devices.value];
  updateLastUpdateTime();
};

watch(
  fetchedDevices,
  async (newDevices) => {
    if (newDevices && newDevices.length > 0) {
      await initFetchData();
    }
  },
  { immediate: true }
);

watch(wsParsedData, (newVal) => {
  // 確認 newVal 存在
  if (!newVal || (newVal as RealTimeData).app !== 'real-time') return;

  switch (newVal.app) {
    case 'real-time':
      handleRealTimeUpdate(newVal as RealTimeData);
      break;
  }
});
</script>

<style lang="scss" scoped></style>
