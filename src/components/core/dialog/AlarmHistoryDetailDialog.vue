<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.alarm_detail')"
    :is-submitting="isSubmitting"
    @submit="onSaveClicked"
    @cancel="onCancel"
  >
    <div class="mb-6 rounded-lg border p-4">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full"
            :class="[
              {
                'bg-secondary-yellow': props.selectedDevice.type === 'caution',
                'bg-secondary-red': props.selectedDevice.type === 'warning',
              },
            ]"
          >
            <i
              class="el-icon"
              :class="[
                {
                  'el-icon-warning': props.selectedDevice.type === 'caution',
                  'el-icon-error': props.selectedDevice.type === 'warning',
                },
              ]"
            />
          </div>
          <div>
            <h3 class="text-base font-medium">
              {{ props.selectedDevice.message }}
            </h3>
          </div>
        </div>
        <div>
          <span
            class="inline-flex rounded-full px-2 py-1 text-xs font-medium"
            :class="[
              {
                'bg-secondary-yellow': props.selectedDevice.type === 'caution',
                'bg-secondary-red': props.selectedDevice.type === 'warning',
              },
            ]"
          >
            {{ props.selectedDevice.type }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="flex flex-col">
          <span class="text-xs text-gray-500">{{ t('label.time') }}</span>
          <span>{{ props.selectedDevice.timestamp }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs text-gray-500">{{ t('label.status') }}</span>
          <span
            class="max-w-15 inline-flex w-auto rounded-full px-2 py-1 text-xs font-medium"
            :class="[
              {
                'bg-secondary-red': props.selectedDevice.status === 'pending',
                'bg-secondary-green': props.selectedDevice.status === 'handled',
              },
            ]"
          >
            {{ props.selectedDevice.status }}
          </span>
        </div>
        <div class="flex flex-col sm:col-span-2">
          <span class="text-xs text-gray-500">{{ t('label.detail') }}</span>
          <span>{{ props.selectedDevice.detail }}</span>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <h3 class="mb-2 text-base font-medium">
        {{ t('title.handling_records') }}
      </h3>
      <div
        v-if="
          props.selectedDevice.handlingRecords && props.selectedDevice.handlingRecords.length > 0
        "
      >
        <div
          v-for="(record, index) in props.selectedDevice.handlingRecords"
          :key="index"
          class="mb-3 rounded-lg border p-3"
        >
          <div class="mb-2 flex items-center justify-between">
            <span class="font-medium">{{ record.handler }}</span>
            <span class="text-sm text-gray-500">{{ record.timestamp }}</span>
          </div>
          <div class="mb-1">
            <span class="text-xs text-gray-500">{{ t('label.action') }}</span>
            <p>{{ record.action }}</p>
          </div>
          <div>
            <span class="text-xs text-gray-500">{{ t('label.note') }}</span>
            <p>{{ record.note }}</p>
          </div>
        </div>
      </div>
      <el-empty v-else :description="t('message.no_handling_records')" :image-size="100" />
    </div>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { DeviceAlarm } from '@/types/alarm';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';

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

watch(
  () => props.selectedDevice,
  () => {},
  { immediate: true, deep: true }
);

const onCancel = () => {
  emit('cancel');
};
</script>

<style lang="scss" scoped></style> -->
