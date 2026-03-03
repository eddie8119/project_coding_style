<template>
  <div class="pointer-events-none absolute inset-0 flex">
    <div
      v-for="dateCol in projectDateColumns"
      :key="dateCol.date.toISOString() + '-onsite-' + categoryId"
      class="relative h-full flex-shrink-0"
      :style="{ width: `${columnWidth}px` }"
    >
      <div class="flex h-full flex-col items-stretch justify-end pb-0.5">
        <button
          v-if="getOnsiteTasksForDate(dateCol.date).length > 0"
          type="button"
          class="pointer-events-auto mx-auto inline-flex max-h-10 w-[90%] flex-col items-start justify-center rounded-md bg-brand-primary px-1 py-0.5 text-left text-[11px] font-medium text-lime-900 shadow-sm transition hover:bg-primary-card"
          @click="openPopover(dateCol.date, $event)"
        >
          <span class="block w-full truncate">
            {{ getOnsiteTasksForDate(dateCol.date)[0]?.title }}
          </span>
          <span
            v-if="getOnsiteTasksForDate(dateCol.date).length > 1"
            class="mt-0.5 block w-full truncate text-[10px] font-normal text-lime-950/80"
          >
            +{{ getOnsiteTasksForDate(dateCol.date).length - 1 }} more
          </span>
        </button>
      </div>
    </div>
  </div>

  <GanttOnsitePopover
    :visible="isPopoverOpen"
    :position="popoverStyle"
    :tasks="selectedTasks"
    :date-label="popoverDateLabel"
    @close="closePopover"
    @open-day-view="handleOpenDayView"
  />

  <GanttOnsiteDayDialog
    :open="isDayDialogOpen"
    :date="dayDialogDate"
    :tasks="dayDialogTasks"
    @close="closeDayView"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import GanttOnsiteDayDialog from './GanttOnsiteDayDialog.vue';
import GanttOnsitePopover from './GanttOnsitePopover.vue';

import type { ExcelDateColumn } from '@/types/gantt';
import type { TaskResponse } from '@/types/response';
import type { OnsiteTaskCategoryDateMap } from '@/utils/gantt/onsiteTasks';

import { getMonthYear, getWeekDay } from '@/utils/date';

const props = defineProps<{
  categoryId: string;
  projectDateColumns: ExcelDateColumn[];
  columnWidth: number;
  onsiteTaskByCategoryAndDate: OnsiteTaskCategoryDateMap;
}>();

const { t } = useI18n();

const isPopoverOpen = ref(false);
const selectedTasks = ref<TaskResponse[]>([]);
const selectedDate = ref<Date | null>(null);
const popoverStyle = ref<{ top: string; left: string } | null>(null);
const isDayDialogOpen = ref(false);
const dayDialogDate = ref<Date | null>(null);
const dayDialogTasks = ref<TaskResponse[]>([]);

const getOnsiteTasksForDate = (date: Date): TaskResponse[] => {
  const dateKey = date.getTime();
  const dateMap = props.onsiteTaskByCategoryAndDate.get(props.categoryId);
  return dateMap?.get(dateKey) ?? [];
};

const popoverDateLabel = computed(() => {
  if (!selectedDate.value) return '';
  const d = selectedDate.value;
  return `${getMonthYear(d, t)} ${d.getDate()} (${getWeekDay(d, t)})`;
});

const openPopover = (date: Date, event: MouseEvent) => {
  const tasks = getOnsiteTasksForDate(date);
  selectedTasks.value = tasks;
  selectedDate.value = date;

  const target = event.currentTarget as HTMLElement | null;
  const rect = target?.getBoundingClientRect();

  if (rect) {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const top = rect.bottom + 8;
    const left = rect.left + rect.width / 2 - 130; // 260 / 2

    // 簡單避免超出畫面
    const clampedTop = Math.min(top, viewportHeight - 340);
    const clampedLeft = Math.min(Math.max(8, left), viewportWidth - 268);

    popoverStyle.value = {
      top: `${clampedTop}px`,
      left: `${clampedLeft}px`,
    };
  } else {
    popoverStyle.value = null;
  }

  isPopoverOpen.value = true;
};

const closePopover = () => {
  isPopoverOpen.value = false;
  selectedTasks.value = [];
  selectedDate.value = null;
  popoverStyle.value = null;
};

const handleOpenDayView = () => {
  if (!selectedDate.value || selectedTasks.value.length === 0) return;
  dayDialogDate.value = selectedDate.value;
  dayDialogTasks.value = [...selectedTasks.value];
  isPopoverOpen.value = false;
  isDayDialogOpen.value = true;
};

const closeDayView = () => {
  isDayDialogOpen.value = false;
};
</script>
