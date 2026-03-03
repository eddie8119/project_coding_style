<template>
  <div class="flex h-full flex-col bg-slate-50 dark:bg-gray-800">
    <div
      class="gantt-table-header flex flex-col border-b border-slate-200 px-4 dark:border-gray-700"
      :style="sidebarHeaderStyle"
    >
      <div class="flex items-center" :style="projectInfoStyle">
        <ProjectLink
          :project-id="projectId"
          class="text-lg font-semibold text-slate-900 dark:text-white"
        >
          {{ projectName }}
        </ProjectLink>
      </div>
      <div
        v-for="label in sidebarHeaderLabels"
        :key="label"
        class="gantt-label-row text-xs font-medium uppercase tracking-wide text-slate-500 last:border-b dark:text-gray-300"
        :style="noteRowStyle"
      >
        {{ label }}
      </div>
    </div>

    <!-- 類別列表：每個工程類別一行，即使目前沒有任務也會顯示 -->
    <div class="tasks-list flex-1">
      <div
        v-for="category in categories"
        :key="category.id"
        class="gantt-task-row hover:bg-white/70 dark:hover:bg-gray-700/60"
        :style="categoryRowStyle"
      >
        <div class="flex w-full items-center justify-between gap-2.5">
          <div class="flex items-center gap-2.5">
            <div class="h-2 w-2 rounded-full bg-brand-tertiary" />
            <span class="truncate text-sm font-medium text-slate-700 dark:text-gray-200">
              {{ category.name }}
            </span>
          </div>
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-transparent hover:text-slate-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-transparent dark:hover:text-gray-100"
            @click.stop="emitCreateTask(category.id, category.name)"
          >
            <AddIcon class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
    <!-- 考慮中 是否要放置 -->
    <div class="flex items-center justify-center py-2">
      <TextButton variant="secondary" size="sm" class="w-[60px]" @click="handleAddCategory">
        <AddIcon />
      </TextButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { GanttProject } from '@/types/gantt';

import TextButton from '@/components/core/button/TextButton.vue';
import ProjectLink from '@/components/core/link/ProjectLink.vue';
import AddIcon from '@/components/ui/AddIcon.vue';
import { GANTT_LAYOUT, getGanttSidebarHeaderHeight } from '@/constants/ganttLayout';

defineProps<{
  projectName: string;
  projectId: string;
  categories: GanttProject['categories'];
}>();

const emit = defineEmits<{
  (e: 'create-task', payload: { categoryId: string; categoryName: string }): void;
  (e: 'request-create-category'): void;
}>();

const { t } = useI18n();

const sidebarHeaderLabels = computed(() => [
  t('excel.progress_template.special_holiday'),
  t('excel.progress_template.construction_payment_remittance'),
  t('excel.progress_template.pre_construction_preparation'),
]);

const sidebarHeaderStyle = computed(() => ({
  height: `${getGanttSidebarHeaderHeight()}px`,
}));

const projectInfoStyle = computed(() => ({
  height: `${GANTT_LAYOUT.headerProjectInfoHeight}px`,
}));

const noteRowStyle = computed(() => ({
  height: `${GANTT_LAYOUT.noteRowHeight}px`,
}));

const categoryRowStyle = computed(() => ({
  height: `${GANTT_LAYOUT.categoryRowHeight}px`,
}));

const emitCreateTask = (categoryId: string, categoryName: string) => {
  emit('create-task', { categoryId, categoryName });
};

const handleAddCategory = () => {
  emit('request-create-category');
};
</script>
