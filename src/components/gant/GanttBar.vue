<template>
  <div
    class="gantt-bar absolute flex transform cursor-pointer items-center rounded-md text-sm font-medium shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg"
    :class="[barClasses, alignClasses]"
    :style="barStyles"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @dblclick.stop="handleOpenEdit"
  >
    <div class="accent-bar" />

    <!-- 內容區域 -->
    <div class="relative flex h-full flex-1 items-center overflow-hidden px-1">
      <span
        class="block w-full overflow-hidden text-ellipsis whitespace-nowrap pr-6 text-left text-primary-text"
      >
        {{ barText }}
      </span>

      <!-- Hover 時顯示刪除按鈕 -->
      <TrashButton
        v-if="isHovered"
        class="absolute right-3 top-1/2 -translate-y-1/2"
        @click.stop="handleDelete"
      />
    </div>

    <Tooltip :text="barText" :visible="isHovered" />

    <!-- 調整大小的手柄 -->
    <div class="resize-handle left-handle" @mousedown.stop="startResize($event, 'left')" />
    <div class="resize-handle right-handle" @mousedown.stop="startResize($event, 'right')" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import type { GanttSchedule } from '@/types/gantt';

import Tooltip from '@/components/ui/Tooltip.vue';
import TrashButton from '@/components/ui/TrashButton.vue';
import { useGanttBarResize } from '@/composables/planning/useGanttBarResize';

const props = defineProps<{
  taskId: string;
  schedule: GanttSchedule;
  dateRange: { startDate: Date; endDate: Date };
  columnWidth: number;
  startDate: Date;
  type: 'execution' | 'note';
  label?: string;
  align?: 'center' | 'withOnsite';
}>();

const emit = defineEmits<{
  (e: 'update-schedule', payload: { taskId: string; startDate: Date; endDate: Date }): void;
  (
    e: 'open-edit',
    payload: {
      taskId: string;
      content: string;
      startDate: Date;
      endDate: Date;
    }
  ): void;
  (e: 'delete', payload: { taskId: string }): void;
}>();

const isHovered = ref(false);
const BAR_SIDE_PADDING = 2;

// 使用抽離的拖曳調整 composable
const { isResizing, tempStartDate, tempEndDate, startResize } = useGanttBarResize({
  schedule: props.schedule,
  columnWidth: props.columnWidth,
  onUpdate: (payload) =>
    emit('update-schedule', {
      taskId: props.taskId,
      startDate: payload.startDate,
      endDate: payload.endDate,
    }),
});

const alignClasses = computed(() => {
  if (props.align === 'withOnsite') {
    // 稍微靠上一點，下面留空間給現場任務
    return 'top-2 gantt-align-onsite';
  }

  // 預設置中於 row
  return 'top-1/2 -translate-y-1/2 gantt-align-center';
});

// 計算甘特條的位置和寬度
const barStyles = computed(() => {
  // 優先使用拖曳中的暫存日期，否則使用原始日期
  const currentStartDate =
    isResizing.value && tempStartDate.value ? tempStartDate.value : props.schedule.startDate;

  const currentEndDate =
    isResizing.value && tempEndDate.value ? tempEndDate.value : props.schedule.endDate;

  const startDiff = Math.floor(
    (currentStartDate.getTime() - props.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const endDiff = Math.floor(
    (currentEndDate.getTime() - props.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const left = startDiff * props.columnWidth;
  const width = (endDiff - startDiff + 1) * props.columnWidth - BAR_SIDE_PADDING * 2; // 減去邊距

  return {
    left: `${left + BAR_SIDE_PADDING}px`, // 加上邊距
    width: `${Math.max(width, props.columnWidth - BAR_SIDE_PADDING * 2)}px`, // 最小寬度為一格
    height: props.type === 'execution' ? '22px' : '18px',
    zIndex: isResizing.value ? 20 : isHovered.value ? 10 : 5, // 拖曳時層級最高
  };
});

// 甘特條樣式類別
const barClasses = computed(() => {
  const baseClasses = ['gantt-bar'];

  if (props.type === 'execution') {
    baseClasses.push('bar-execution');
  } else {
    baseClasses.push('bar-note');
  }

  return baseClasses;
});

// 甘特條顯示文字
const barText = computed(() => {
  if (props.label && props.label.trim().length > 0) {
    return props.label;
  }

  const daysDiff =
    Math.floor(
      (props.schedule.endDate.getTime() - props.schedule.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  if (props.type === 'execution') {
    return `${daysDiff}天`;
  }

  return '註記';
});

const handleOpenEdit = () => {
  emit('open-edit', {
    taskId: props.taskId,
    content: props.label ?? '',
    startDate: props.schedule.startDate,
    endDate: props.schedule.endDate,
  });
};

const handleDelete = () => {
  emit('delete', { taskId: props.taskId });
};
</script>

<style scoped>
.gantt-bar {
  z-index: 5;
  min-width: 80px;
  border: 1px solid rgba(148, 163, 184, 0.7); /* slate-400 */
  background-color: rgba(241, 245, 249, 0.95); /* slate-100 */
  border-radius: 9999px;
  overflow: visible;
}

.gantt-bar:hover {
  z-index: 10;
}

.gantt-bar.bar-execution {
  border-color: rgba(190, 230, 60, 0.25);
}

/* 執行期間條 */
.bar-execution {
  background: linear-gradient(90deg, #d7f376 0%, #bee63c 35%, #98c21f 100%);
  opacity: 0.8;
}

/* 註記期間條（目前未使用，但保留較淡顏色） */
.bar-note {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  opacity: 0.9;
}

.accent-bar {
  height: 70%;
  width: 3px;
  margin-left: 8px; /* 約等於 padding-1 與左邊保持間距 */
  border-radius: 999px;
  background-color: #bee63c;
  box-shadow: 0 0 4px rgba(190, 230, 60, 0.6);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.gantt-bar:hover .accent-bar {
  transform: scaleY(1.05);
  box-shadow: 0 0 8px rgba(190, 230, 60, 0.9);
}

.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px;
  cursor: col-resize;
  z-index: 20;
  opacity: 0;
  transition: opacity 0.2s;
}

.resize-handle:hover,
.gantt-bar:hover .resize-handle {
  opacity: 1;
}

/* 視覺上的手柄樣式 (中間的豎線) */
.resize-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 12px;
  width: 4px;
  background-color: rgba(100, 116, 139, 0.5); /* slate-500 */
  border-radius: 2px;
}

.left-handle {
  left: -4px;
}

.right-handle {
  right: -4px;
}
</style>
