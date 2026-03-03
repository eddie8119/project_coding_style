<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/80 backdrop-blur-[1px]"
    >
      <div
        class="panel-container panel-color-difference max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_20px_45px_rgba(0,0,0,0.35)] dark:border-gray-700 dark:bg-gray-900"
      >
        <div
          class="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-gray-700 dark:text-gray-100"
        >
          <span>{{ headerLabel }}</span>
          <DeleteButton
            class="text-color-difference text-color-difference-hover"
            width="w-6"
            height="h-6"
            icon-width="w-3.5"
            icon-height="h-3.5"
            @click="handleClose"
          />
        </div>
        <div class="text-color-difference h-[70vh] overflow-hidden px-4 py-3">
          <DayTimelineView
            v-if="dayGroup"
            :group="dayGroup"
            @update:task="handleUpdateTask"
            @delete="handleDeleteTask"
          />
          <EmptyStatePlaceholder v-else :message="t('message.no_tasks')" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';
import type { DayGroup } from '@/utils/scheduleGroupUtils';

import EmptyStatePlaceholder from '@/components/core/EmptyStatePlaceholder.vue';
import DayTimelineView from '@/components/schedule/DayTimelineView.vue';
import DeleteButton from '@/components/ui/DeleteButton.vue';
import { getMonthYear, getWeekDay } from '@/utils/date';

const props = defineProps<{
  open: boolean;
  date: Date | null;
  tasks: TaskResponse[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:task', taskId: string, patch: Partial<TaskResponse>): void;
  (e: 'delete', taskId: string): void;
}>();

const { t } = useI18n();

const dayGroup = computed<DayGroup | null>(() => {
  if (!props.date) return null;

  return {
    dateKey: props.date.toISOString().slice(0, 10),
    date: props.date,
    day: props.date.getDate(),
    weekDay: getWeekDay(props.date, t),
    monthYear: getMonthYear(props.date, t),
    tasks: props.tasks,
  };
});

const headerLabel = computed(() => {
  if (!props.date) return '';
  return `${getMonthYear(props.date, t)} ${props.date.getDate()} (${getWeekDay(props.date, t)}) - 日視圖`;
});

const handleClose = () => {
  emit('close');
};

const handleUpdateTask = (taskId: string, patch: Partial<TaskResponse>) => {
  emit('update:task', taskId, patch);
};

const handleDeleteTask = (taskId: string) => {
  emit('delete', taskId);
};
</script>
