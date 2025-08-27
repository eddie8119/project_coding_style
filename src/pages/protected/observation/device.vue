<template>
  <div class="main-content">
    <div v-if="isLoading" class="flex h-[400px] items-center justify-center">
      <Loading />
    </div>
    <template v-else>
      <div class="relative flex w-full items-center justify-between">
        <ShowUpdateTime :last-update-time="deviceLastUpdateTime" />
      </div>

      <div class="flex flex-col gap-4">
        <div class="mb-2 flex items-center gap-4 text-2xl font-bold">
          <p>
            {{ localTag }}
          </p>
          |
          <StatusShow :status="localStatus" />
          <div v-if="isHasUnresolved" class="flex items-center gap-4">
            |
            <span class="text-secondary-red">{{ showAlarmTitle }}</span>
          </div>
        </div>

        <HandleProcess
          v-if="isHasUnresolved"
          :id="id"
          :formatted-device-alarm-records="formattedDeviceAlarmRecords"
          :is-admin="isAdmin"
          :is-show-handle-process="isShowHandleProcess"
          :handle-status="handleStatus"
          :local-tag="localTag"
          :handle-id="handleId"
          :observation-type="props.observationType"
          :show-alarm-content="showAlarmContent"
        />

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DeviceBasicInfo
            v-if="fetchedDevice"
            :device-data="fetchedDevice"
            :is-admin="isAdmin"
            :observation-type="props.observationType"
            @update:device-data="updateDeviceData"
          />
          <DeviceMeasurement
            :device-real-measurement-data="deviceRealMeasurementData"
            :device-latest-calibration-data="deviceLatestCalibrationData"
            :device-latest-measure-data="deviceLatestMeasureData"
            :observation-type="props.observationType"
          />
        </div>

        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <SensorRead
            :device-measurement-data="deviceRealMeasurementData"
            :device-latest-measure-data="deviceLatestMeasureData"
            :observation-type="props.observationType"
          />
          <RealTimeRead
            :device-measurement-data="deviceRealMeasurementData"
            :observation-type="props.observationType"
          />
          <DeviceReplaceHistory :observation-type="props.observationType" />
        </div>
        <HistoryReadContainer v-if="fetchedDevice" :id="id" :fetched-device="fetchedDevice" />
        <DeviceAlarmHistoryBulletinBoard
          :observation-type="props.observationType"
          :formatted-device-alarm-records="formattedDeviceAlarmRecords"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { watch, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import type { CaliData } from '@/types/calibration';
import type { Device } from '@/types/device';
import type { ObservationType } from '@/types/device';
import type { Measure } from '@/types/measure';
import type { WsData } from '@/types/websocket';

import RealTimeRead from '@/components/core/chart/RealTimeRead.vue';
import Loading from '@/components/core/loading/Loading.vue';
import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import DeviceAlarmHistoryBulletinBoard from '@/components/core/situationRoom/DeviceAlarmHistoryBulletinBoard.vue';
import StatusShow from '@/components/core/StatusShow.vue';
import DeviceBasicInfo from '@/components/device/DeviceBasicInfo.vue';
import DeviceMeasurement from '@/components/device/DeviceMeasurement.vue';
import DeviceReplaceHistory from '@/components/device/DeviceReplaceHistory.vue';
import HandleProcess from '@/components/device/HandleProcess.vue';
import HistoryReadContainer from '@/components/device/HistoryReadContainer.vue';
import SensorRead from '@/components/device/SensorRead.vue';
import { useAlarmRecords } from '@/composables/useAlarmRecords';
import { useAuth } from '@/composables/useAuth';
import { useDataInsights } from '@/composables/useDataInsights';
import { useDevice } from '@/composables/useDevice';
import { useWebSocket } from '@/composables/useWebSocket';
import { ProcessStatus } from '@/types/action';
import { DeviceActionStatus, DeviceStatus } from '@/types/device';
import { AlarmStatus } from '@/types/label';
import { getDifferences } from '@/utils/common';

const route = useRoute();
const { t } = useI18n();
const id = computed(() => route.params.id as string);

const {
  fetchedDevice,
  refetchDevice,
  isLoading,
  lastUpdateTime: deviceLastUpdateTime,
  applyLocalUpdate,
  patchDevice,
} = useDevice(id);

const { wsParsedData } = useWebSocket();
const { fetchLatestCalibration, fetchLatestMeasure } = useDataInsights();
const { formattedDeviceAlarmRecords, refetchDeviceAlarmsRecords } = useAlarmRecords(id.value);
const { isAdmin } = useAuth();

const props = defineProps<{
  observationType: ObservationType;
}>();

const pageData = ref<{
  latestCalibration: CaliData[];
  latestMeasures: Measure[];
}>({
  latestCalibration: [],
  latestMeasures: [],
});
const localTag = ref<string>('');
const localStatus = ref<DeviceStatus>(DeviceStatus.STOPPED);
const localDeviceActionStatus = ref<DeviceActionStatus | undefined>(undefined);
const showAlarmTitle = ref<string | null>(null);
const showAlarmContent = ref<string | null>(null);

const isShowHandleProcess = computed(() => {
  return localDeviceActionStatus.value !== DeviceActionStatus.NOT_AVAILABLE;
});
const isHasUnresolved = computed<boolean>(() => {
  if (!formattedDeviceAlarmRecords.value) return false;
  return formattedDeviceAlarmRecords.value?.some(
    (record) => record.alarm_status === AlarmStatus.UNRESOLVED
  );
});

const initFetchData = async () => {
  try {
    if (!id.value) return { latestCalibration: [], latestMeasures: [] };

    const results = await Promise.allSettled([
      fetchLatestCalibration(id.value),
      fetchLatestMeasure(id.value),
    ]);

    const latestCalibration =
      results[0].status === 'fulfilled' ? (results[0].value as CaliData[]) : [];
    const latestMeasures = results[1].status === 'fulfilled' ? (results[1].value as Measure[]) : [];

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`API call ${index} failed:`, result.reason);
      }
    });

    return {
      latestCalibration,
      latestMeasures,
    };
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return { latestCalibration: [], latestMeasures: [] };
  }
};

watch(
  fetchedDevice,
  async (newVal) => {
    if (newVal) {
      localTag.value = newVal.tag ?? t('device.no_tag');
      localStatus.value = newVal.status;
      localDeviceActionStatus.value = newVal.action_status;
      try {
        pageData.value = await initFetchData();
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    }
  },
  { immediate: true }
);

const deviceLatestCalibrationData = computed(
  () => pageData.value?.latestCalibration?.[0] || undefined
);
const deviceLatestMeasureData = computed(() => pageData.value?.latestMeasures?.[0] || undefined);

// 處理WebSocket
const deviceRealMeasurementData = ref<WsData | undefined>(undefined);
const handleStatus = ref<string | undefined>(undefined);
const handleId = ref<string | undefined>(undefined);

// topic 數量不多、處理邏輯簡單，用 if 即可
watch(wsParsedData, (newVal) => {
  if (!newVal) return;

  // 先檢查 app 類型，再處理不同狀態
  switch (newVal.app) {
    case 'real-time':
      if (newVal.ID === id.value) {
        deviceRealMeasurementData.value = newVal;
      }
      break;
    case 'action':
      // 只有當 action 的 ID 與當前設備 ID 匹配時才處理
      if (newVal.ID === id.value) {
        handleStatus.value = newVal.status;
        handleId.value = newVal.ID;

        if (newVal.status === ProcessStatus.FINISH) {
          ElMessage.success(t('message.success.update_success'));
          // 故意延遲的 讓畫面稍微停一下
          setTimeout(() => {
            refetchDeviceAlarmsRecords();
          }, 5000);
        }
      }
      break;
  }
});

// 處理 alarm 介面提示
watch(formattedDeviceAlarmRecords, (newVal) => {
  if (!newVal) return;
  if (newVal.some((record) => record.alarm_status === AlarmStatus.UNRESOLVED)) {
    showAlarmTitle.value = newVal[0].details.split(':')[0];
    showAlarmContent.value = newVal[0].details.split(':')[1];
  } else {
    showAlarmTitle.value = null;
    showAlarmContent.value = null;
  }
});

// 編輯資訊
const updateDeviceData = async (updatedDevice: Device) => {
  if (!fetchedDevice.value) return;

  try {
    const changes = getDifferences<Device>(fetchedDevice.value, updatedDevice);
    if (Object.keys(changes).length === 0) {
      ElMessage.info(t('message.sign.no_change'));
      return;
    }

    await patchDevice(fetchedDevice.value.ID, changes);
    applyLocalUpdate(changes);
    refetchDevice();
    ElMessage.success(t('message.success.update_success'));
  } catch (error) {
    console.error('Failed to update device:', error);
    ElMessage.error(t('message.error.update_failed'));
  }
};
</script>

<style scoped></style>
