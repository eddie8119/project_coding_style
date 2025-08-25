<template>
  <div class="relative flex flex-col">
    <Table
      :data="props.devices"
      :columns="DEVICE_COLUMNS"
      :actions="deviceActions"
      :loading="props.loading"
      :show-id-column="true"
      :show-actions="true"
      :show-search="true"
      :last-update-time="lastUpdateTime"
      max-height="calc(100vh - 250px)"
      @edit="emit('edit', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Device } from '@/types/device';

import Table from '@/components/core/table/Table.vue';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { DEVICE_COLUMNS } from '@/constants/columns/device';

const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

const props = defineProps<{
  devices: Device[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'edit', device: Device): void;
}>();

const deviceActions = [
  {
    label: 'Edit',
    onClick: (row: Device) => {
      emit('edit', row);
      updateLastUpdateTime();
    },
  },
];
</script>

<style lang="scss" scoped></style>
