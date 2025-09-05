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
          <p class="uppercase">
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
          :show-alarm-severity="showAlarmSeverity"
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
import { computed, nextTick, ref, watch } from 'vue';
import { defineAsyncComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import type { CaliData } from '@/types/calibration';
import type { Device } from '@/types/device';
import type { ObservationType } from '@/types/device';
import type { Measure } from '@/types/measure';
import type { ActionWsData, WsData } from '@/types/websocket';

const RealTimeRead = defineAsyncComponent(() => import('@/components/core/chart/RealTimeRead.vue'));
const DeviceAlarmHistoryBulletinBoard = defineAsyncComponent(
  () => import('@/components/core/situationRoom/DeviceAlarmHistoryBulletinBoard.vue')
);
const DeviceBasicInfo = defineAsyncComponent(
  () => import('@/components/device/DeviceBasicInfo.vue')
);
const DeviceMeasurement = defineAsyncComponent(
  () => import('@/components/device/DeviceMeasurement.vue')
);
const DeviceReplaceHistory = defineAsyncComponent(
  () => import('@/components/device/DeviceReplaceHistory.vue')
);
const HandleProcess = defineAsyncComponent(() => import('@/components/device/HandleProcess.vue'));
const HistoryReadContainer = defineAsyncComponent(
  () => import('@/components/device/HistoryReadContainer.vue')
);
const SensorRead = defineAsyncComponent(() => import('@/components/device/SensorRead.vue'));
import Loading from '@/components/core/loading/Loading.vue';
import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import StatusShow from '@/components/core/StatusShow.vue';
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
// 為了傳遞HandleProcess需要的變數
const showAlarmTitle = ref<string | null>(null);
const showAlarmContent = ref<string | null>(null);
const showAlarmSeverity = ref<string | null>(null);

// 儀器只要不是 NOT_AVAILABLE 就可以做操作
const isShowHandleProcess = computed(() => {
  return localDeviceActionStatus.value !== DeviceActionStatus.NOT_AVAILABLE;
});
const isHasUnresolved = computed<boolean>(() => {
  if (!formattedDeviceAlarmRecords.value) return false;
  return formattedDeviceAlarmRecords.value?.some(
    (record) => record.alarm_status === AlarmStatus.UNRESOLVED
  );
});

watch(
  fetchedDevice,
  async (newVal) => {
    if (newVal) {
      localTag.value = newVal.tag ?? t('device.no_tag');
      localStatus.value = newVal.status;
      localDeviceActionStatus.value = newVal.action_status;
      try {
        pageData.value = await initFetchData();
        await nextTick();
        updateAlarmDisplay();
        // 確保 updateAlarmDisplay 總是在 formattedDeviceAlarmRecords 的資料完全更新後才執行
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    }
  },
  { immediate: true }
);

async function initFetchData() {
  try {
    if (!id.value) return { latestCalibration: [], latestMeasures: [] };

    const results = await Promise.allSettled([
      fetchLatestCalibration(id.value),
      fetchLatestMeasure(id.value),
      refetchDeviceAlarmsRecords(),
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
}

const deviceLatestCalibrationData = computed(
  () => pageData.value?.latestCalibration?.[0] || undefined
);
const deviceLatestMeasureData = computed(() => pageData.value?.latestMeasures?.[0] || undefined);

// 處理WebSocket
const deviceRealMeasurementData = ref<WsData | undefined>(undefined);
const handleStatus = ref<string | undefined>(undefined);
const handleId = ref<string | undefined>(undefined);

// topic 數量不多、處理邏輯簡單，用 if 即可
watch(wsParsedData, async (newVal) => {
  if (!newVal) return;
  if (newVal.ID !== id.value) return;

  // 先檢查 app 類型，再處理不同狀態
  switch (newVal.app) {
    // 這個是為了觀測化學式即時監測
    case 'real-time':
      handleRealTimeData(newVal);
      break;
    // 這個是為了觀測儀器校正的狀態變化
    case 'action':
      await handleActionData(newVal);

      break;
  }
});

async function handleActionData(newVal: ActionWsData) {
  // 只有當 action 的 ID 與當前設備 ID 匹配時才處理
  if (newVal.ID === id.value) {
    handleStatus.value = newVal.status;
    handleId.value = newVal.ID;

    if (newVal.status === ProcessStatus.FINISH) {
      localStatus.value = DeviceStatus.RUNNING;
      showAlarmTitle.value = null;

      ElMessage.success(t('message.success.update_success'));
      // 故意延遲的 讓畫面稍微停一下
      await delayAndRefresh();
    }
  }
}

// 更新警報介面顯示
function updateAlarmDisplay() {
  if (
    formattedDeviceAlarmRecords.value &&
    formattedDeviceAlarmRecords.value.some(
      (record) => record.alarm_status === AlarmStatus.UNRESOLVED
    )
  ) {
    showAlarmTitle.value = formattedDeviceAlarmRecords.value[0].details.split(':')[0];
    showAlarmContent.value = formattedDeviceAlarmRecords.value[0].details.split(':')[1];
    showAlarmSeverity.value = formattedDeviceAlarmRecords.value[0].severity;
  } else {
    showAlarmTitle.value = null;
    showAlarmContent.value = null;
  }
}

function handleRealTimeData(newVal: WsData) {
  if (newVal.ID === id.value) {
    deviceRealMeasurementData.value = newVal;
  }
}

async function delayAndRefresh() {
  await new Promise((resolve) => setTimeout(resolve, 15000));
  await refetchDeviceAlarmsRecords();
  updateAlarmDisplay();
}

// 編輯資訊
async function updateDeviceData(updatedDevice: Device) {
  if (!fetchedDevice.value) return;

  try {
    const changes = getDifferences<Device>(fetchedDevice.value, updatedDevice);
    if (Object.keys(changes).length === 0) {
      ElMessage.info(t('message.sign.no_change'));
      return;
    }

    await patchDevice(fetchedDevice.value.ID, changes);
    applyLocalUpdate(changes);
    await refetchDevice();
    ElMessage.success(t('message.success.update_success'));
  } catch (error) {
    console.error('Failed to update device:', error);
    ElMessage.error(t('message.error.update_failed'));
  }
}
</script>

<style scoped></style>
