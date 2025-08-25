<template>
  <div
    v-if="formattedDeviceAlarmRecords && formattedDeviceAlarmRecords.length > 0"
    class="relative flex flex-col"
  >
    <H3Title :title="t('title.subTitle.alarm_history')" />

    <Table
      :data="formattedDeviceAlarmRecords || []"
      :columns="observation.columns"
      :actions="alarmActions"
      :loading="false"
      :show-id-column="true"
      :show-actions="false"
      :show-search="true"
      :last-update-time="lastUpdateTime"
      :show-pagination="false"
      max-height="calc(100vh - 360px)"
    >
      <!-- Add this new template slot -->
      <template #severity="{ row }">
        <span
          class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
          :class="[
            {
              'bg-secondary-red': row.severity.includes('W'),
              'bg-secondary-yellow': row.severity.includes('C'),
            },
          ]"
        >
          {{ row.severity.includes('W') ? t(`device.warning`) : t(`device.caution`) }} -
          {{ row.severity }}
        </span>
      </template>

      <template #alarm_status="{ row }">
        <span
          class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
          :class="[
            {
              'bg-secondary-green': row.alarm_status === AlarmStatus.RESOLVED,
              'bg-secondary-red': row.alarm_status === AlarmStatus.UNRESOLVED,
            },
          ]"
        >
          {{ t(`device.status.${row.alarm_status}`) }}
        </span>
      </template>
      <template #action_status="{ row }">
        <p>
          {{ t(`device.status.${row.action_status}`) }}
        </p>
      </template>
    </Table>

    <!-- AlarmHistoryDetailDialog -->
    <AlarmHistoryDetailDialog
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
import { useI18n } from 'vue-i18n';

import type { AlarmRecord } from '@/types/alarm';
import type { ObservationType } from '@/types/device';

import AlarmHistoryDetailDialog from '@/components/core/dialog/AlarmHistoryDetailDialog.vue';
import Table from '@/components/core/table/Table.vue';
import H3Title from '@/components/core/title/H3Title.vue';
import { useDialog } from '@/composables/useDialog';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { PH_ALARM_HISTORY_COLUMNS } from '@/constants/columns/ph';
import { AlarmStatus } from '@/types/label';

const { lastUpdateTime } = useUpdateTime();
const { showEditDialog, selectedObject, editObject, closeDialog } = useDialog();
const { t } = useI18n();

const props = defineProps<{
  observationType: ObservationType;
  formattedDeviceAlarmRecords: AlarmRecord[] | null;
}>();

const observation = computed(() => {
  switch (props.observationType) {
    case 'ph':
      return {
        columns: PH_ALARM_HISTORY_COLUMNS,
      };
    default:
      return {
        columns: PH_ALARM_HISTORY_COLUMNS,
      };
  }
});

const alarmActions = [
  {
    label: 'detail',
    onClick: (row: AlarmRecord) => {
      editObject(row);
    },
  },
];

// 樂觀更新
const handleSave = (): void => {};
</script>

<style lang="scss" scoped></style>
