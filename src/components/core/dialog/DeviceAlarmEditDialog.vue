<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.edit_device_alarm')"
    :is-submitting="isSubmitting"
    @submit="onSaveClicked"
    @cancel="onCancel"
  >
    <div class="flex w-full items-center gap-2">
      <div class="flex w-56 flex-col items-center gap-4">
        <div class="flex">
          <p class="mr-1">device</p>
          <StatusShow :status="deviceActive ?? DeviceStatus.RUNNING" />
        </div>
        <el-switch
          v-model="allAlarmActive"
          :active-text="'on'"
          :inactive-text="'off'"
          :disabled="!deviceActive"
          @change="handleMainSwitchChange"
        />
      </div>
      <div class="flex flex-col gap-6">
        <div v-for="(field, index) in fields" :key="field.key" class="mb-2">
          <AlarmSettingGroup
            v-model="field.value"
            :disabled="!allAlarmActive"
            :enabled="field.value.active"
            :low-bound="props.selectedDevice.low_bound"
            :high-bound="props.selectedDevice.high_bound"
            @enable-change="handleSettingEnable(index, $event)"
          />
        </div>
      </div>
    </div>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm, useFieldArray } from 'vee-validate';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { z } from 'zod';

import type { AlarmSetting, DeviceAlarm } from '@/types/alarm';

import { alarmApi } from '@/api/alarm';
import AlarmSettingGroup from '@/components/core/alarm/AlarmSettingGroup.vue';
import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import StatusShow from '@/components/core/StatusShow.vue';
import { DeviceStatus } from '@/types/device';
import { editDeviceAlarmSchema } from '@/utils/schemas/editDeviceAlarmSchema';

const { t } = useI18n();

const props = defineProps<{
  showEditDialog: boolean;
  selectedDevice: DeviceAlarm;
}>();

const emit = defineEmits<{
  (e: 'save', selectedDevice: DeviceAlarm): void;
  (e: 'cancel'): void;
}>();

const dialogVisible = computed({
  get: () => props.showEditDialog,
  set: () => emit('cancel'),
});

const { handleSubmit, errors, isSubmitting, setValues } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      alarm_settings: z.array(editDeviceAlarmSchema),
    })
  ),
  initialValues: {
    alarm_settings: props.selectedDevice?.alarm_settings || [],
  },
});

const { fields, update } = useFieldArray<AlarmSetting>('alarm_settings');

watch(
  () => props.selectedDevice,
  (newDevice: DeviceAlarm) => {
    if (newDevice) {
      setValues({ alarm_settings: newDevice.alarm_settings || [] });
    }
  },
  { immediate: true, deep: true }
);

const deviceActive = computed(() => {
  return props.selectedDevice.active;
});

// toogle開關
const allAlarmActive = computed(() => {
  return fields.value.some((field) => field.value.active);
});

const handleMainSwitchChange = (value: boolean): void => {
  fields.value.forEach((field, index: number) => {
    update(index, { ...field.value, active: value });
  });
};

const handleSettingEnable = (index: number, value: boolean): void => {
  const field = fields.value[index];
  if (field) {
    update(index, { ...field.value, active: value });
  }
};

const onSubmit = handleSubmit(async (values): Promise<void> => {
  const updatedDevice = { ...props.selectedDevice, ...values };
  await alarmApi.patchAlarmSettingBatch(values.alarm_settings);
  emit('save', updatedDevice as DeviceAlarm);
  onCancel();
});

const onSaveClicked = () => {
  if (Object.keys(errors.value).length > 0) {
    console.error('Validation errors:', errors.value);
    return;
  }
  onSubmit();
};

const onCancel = () => {
  emit('cancel');
};
</script>

<style lang="scss" scoped></style> -->
