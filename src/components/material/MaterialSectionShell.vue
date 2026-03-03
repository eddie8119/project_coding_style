<template>
  <div class="flex h-full w-full flex-col gap-4">
    <H3Title :title="title" class-name="text-lg font-semibold text-center" />

    <div>
      <slot name="add-header">
        <div v-if="addLabel" class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Label :label="addLabel" :class-name="addLabelClass" />
          <div v-if="$slots['add-right']">
            <slot name="add-right" />
          </div>
        </div>
      </slot>

      <slot name="add-form" />
    </div>

    <div class="flex flex-1 flex-col">
      <div
        v-if="isEmpty"
        class="flex min-h-[260px] min-w-[300px] flex-1 items-center justify-center rounded-lg border border-dashed border-white/10"
      >
        <slot name="empty">
          <EmptyStatePlaceholder :message="emptyStateMessage" />
        </slot>
      </div>
      <div v-else class="flex flex-1 flex-col">
        <slot name="before-divider" />
        <div v-if="showDivider" class="divider-line my-4" />

        <slot name="above-table" />

        <MaterialTable
          :columns="columns"
          :max-body-height="tableMaxBodyHeight"
          :table-min-width="tableMinWidth"
        >
          <slot name="rows" />
        </MaterialTable>

        <div class="mt-auto flex justify-end pt-2">
          <slot name="footer">
            <TextButton
              size="sm"
              variant="secondary"
              :disabled="batchButtonDisabled"
              @click="handleBatchClick"
            >
              {{ batchButtonLabel }}
            </TextButton>
          </slot>
        </div>

        <div v-if="$slots.chart" class="mt-4">
          <slot name="chart" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';

import TextButton from '@/components/core/button/TextButton.vue';
import EmptyStatePlaceholder from '@/components/core/EmptyStatePlaceholder.vue';
import H3Title from '@/components/core/title/H3Title.vue';
import Label from '@/components/core/title/Label.vue';
import MaterialTable from '@/components/table/MaterialTable.vue';

interface TableColumnDefinition {
  key: string;
  label: string;
  widthClass?: string;
  alignClass?: string;
}

const props = withDefaults(
  defineProps<{
    title: string;
    addLabel?: string;
    addLabelClass?: string;
    isEmpty: boolean;
    emptyStateMessage: string;
    columns: TableColumnDefinition[];
    tableMinWidth?: string;
    tableMaxBodyHeight?: string;
    showDivider?: boolean;
    batchButtonDisabled?: boolean;
    batchButtonLabel?: string;
  }>(),
  {
    addLabel: '',
    addLabelClass: undefined,
    tableMinWidth: '1000px',
    tableMaxBodyHeight: '420px',
    showDivider: true,
    batchButtonDisabled: false,
    batchButtonLabel: 'Batch Update',
  }
);

const emit = defineEmits<{ (e: 'batch-click'): void }>();

const {
  title,
  addLabel,
  addLabelClass,
  isEmpty,
  emptyStateMessage,
  columns,
  tableMinWidth,
  tableMaxBodyHeight,
  showDivider,
  batchButtonDisabled,
  batchButtonLabel,
} = toRefs(props);

const handleBatchClick = () => {
  emit('batch-click');
};
</script>
