<template>
  <div
    class="w-full overflow-hidden rounded-lg border border-slate-300 bg-transparent shadow-sm dark:border-gray-700 lg:shadow-md"
  >
    <!-- 甘特圖容器 -->
    <div class="gantt-container flex">
      <!-- 左側：任務分類 + 名稱列表 -->
      <div
        class="border-r border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-800 lg:min-w-[220px] lg:max-w-[260px] lg:flex-shrink-0 lg:self-start"
      >
        <GanttSidebar
          :project-name="project.name"
          :categories="project.categories"
          :project-id="project.id"
          @create-task="handleCreateTask"
          @request-create-category="handleRequestCreateCategory"
        />
      </div>

      <!-- 右側：時間軸 + 甘特條（X 軸可滾動） -->
      <div
        class="flex-1 overflow-x-auto"
        :class="{
          'lg:overflow-y-auto': true,
        }"
      >
        <GanttTimeline
          :categories="project.categories"
          :date-columns="project.dateColumns"
          :special-holidays="project.specialHolidays"
          :payment-remittances="project.paymentRemittances"
          :pre-construction-notes="project.preConstructionNotes"
          :date-range="project.dateRange"
          :onsite-task="onsiteTask"
          @update-schedule="handleScheduleUpdate"
          @open-edit="handleOpenEdit"
          @delete="handleDelete"
          @update-note="handleUpdateNote"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GanttSidebar from './GanttSidebar.vue';
import GanttTimeline from './GanttTimeline.vue';

import type { GanttNoteType, GanttProject } from '@/types/gantt';
import type { TaskResponse } from '@/types/response';

defineProps<{
  project: GanttProject;
  onsiteTask?: TaskResponse[];
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
  (e: 'create-task', payload: { categoryId: string; categoryName: string }): void;
  (e: 'request-create-category'): void;
  (
    e: 'update-note',
    payload: {
      type: GanttNoteType;
      date: Date;
      value: string;
    }
  ): void;
}>();

const handleScheduleUpdate = (payload: { taskId: string; startDate: Date; endDate: Date }) => {
  emit('update-schedule', payload);
};

const handleOpenEdit = (payload: {
  taskId: string;
  content: string;
  startDate: Date;
  endDate: Date;
}) => {
  emit('open-edit', payload);
};

const handleDelete = (payload: { taskId: string }) => {
  emit('delete', payload);
};

const handleCreateTask = (payload: { categoryId: string; categoryName: string }) => {
  emit('create-task', payload);
};

const handleRequestCreateCategory = () => {
  emit('request-create-category');
};

const handleUpdateNote = (payload: { type: GanttNoteType; date: Date; value: string }) => {
  emit('update-note', payload);
};
</script>

<style scoped></style>
