<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <div class="relative flex flex-col">
    <Table
      :data="initFormatFetchData"
      :columns="observation.columns"
      :actions="alarmActions"
      :loading="isLoading"
      :show-id-column="true"
      :show-actions="true"
      :show-search="true"
      :last-update-time="lastUpdateTime"
      :initial-last-update-time="lastUpdateTime"
      :observation-type="props.observationType"
      max-height="calc(100vh - 360px)"
    >

      <template #status="{ row }">
        <StatusShow :status="row.status ?? DeviceStatus.RUNNING" />
      </template>
      <template #alarm_settings="{ row }">
        <AlarmBar
          :low-bound="row.low_bound"
          :high-bound="row.high_bound"
          :lower-threshold="row.lower_threshold"
          :upper-threshold="row.upper_threshold"
        />
      </template>
    </Table>

   
    <DeviceAlarmEditDialog
      v-if="showEditDialog"
      :show-edit-dialog="showEditDialog"
      :selected-device="selectedObject"
      @save="handleSave"
      @cancel="closeDialog"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { DeviceAlarm } from '@/types/alarm';
import type { AlarmSetting } from '@/types/alarm';

import AlarmBar from '@/components/core/chart/AlarmBar.vue';
import DeviceAlarmEditDialog from '@/components/core/dialog/DeviceAlarmEditDialog.vue';
import StatusShow from '@/components/core/StatusShow.vue';
import Table from '@/components/core/table/Table.vue';
import { useDevices } from '@/composables/useDevices';
import { useDialog } from '@/composables/useDialog';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { PH_DEVICES_ALARM_COLUMNS } from '@/constants/columns/ph';
import { DeviceStatus } from '@/types/device';

const props = defineProps<{ observationType: string }>();

const { devices, isLoading } = useDevices({
  alarm_settings: true,
  label: `${props.observationType}`,
});
const { lastUpdateTime } = useUpdateTime();
const { showEditDialog, selectedObject, editObject, closeDialog } = useDialog<DeviceAlarm>();

const observation = computed(() => {
  switch (props.observationType) {
    case 'ph':
      return {
        columns: PH_DEVICES_ALARM_COLUMNS,
      };
    default:
      return {
        columns: PH_DEVICES_ALARM_COLUMNS,
      };
  }
});

const initFormatFetchData = computed(() => {
  return devices.value.map((device: DeviceAlarm) => {
    return {
      ...device,
      upper_threshold: device.alarm_settings.find(
        (alarm: AlarmSetting) => alarm.alarm_type === 'upper'
      )?.threshold,
      lower_threshold: device.alarm_settings.find(
        (alarm: AlarmSetting) => alarm.alarm_type === 'lower'
      )?.threshold,
      upper_active: device.alarm_settings.find(
        (alarm: AlarmSetting) => alarm.alarm_type === 'upper'
      )?.active,
      lower_active: device.alarm_settings.find(
        (alarm: AlarmSetting) => alarm.alarm_type === 'lower'
      )?.active,
    };
    // 我增加屬性 upper_threshold / lower_threshold / upper_active / lower_active
  });
});

const alarmActions = [
  {
    label: 'edit',
    onClick: (row: DeviceAlarm) => {
      editObject(row);
    },
  },
];

// 樂觀更新
const handleSave = (data: DeviceAlarm): void => {
  initFormatFetchData.value = initFormatFetchData.value.map((device: DeviceAlarm) => {
    if (device.ID === data.ID) {
      return data;
    }
    return device;
  });
};
</script>

<style lang="scss" scoped></style> -->
