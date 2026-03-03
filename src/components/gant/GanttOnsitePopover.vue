<template>
  <Teleport to="body">
    <div v-if="visible">
      <div class="bg-black/5 fixed inset-0 z-[60]" @click="$emit('close')" />

      <div
        v-if="position"
        class="panel-container dark:text-g fixed z-[70] max-h-[360px] w-[280px] overflow-hidden p-1 shadow-[0_12px_32px_4px_rgba(0,0,0,0.12),0_8px_20px_rgba(0,0,0,0.08)] dark:border-gray-700 dark:bg-gray-900 dark:shadow-[0_12px_32px_4px_rgba(0,0,0,0.6),0_8px_20px_rgba(0,0,0,0.4)]"
        :style="{ top: position.top, left: position.left }"
      >
        <div
          class="flex items-center justify-between border-b border-slate-200 px-3.5 py-2.5 text-xs font-semibold dark:border-gray-700"
        >
          <span class="text-color-difference">{{ dateLabel }}</span>
          <DeleteButton
            class="text-color-difference"
            width="w-6"
            height="h-6"
            icon-width="w-3.5"
            icon-height="h-3.5"
            @click="$emit('close')"
          />
        </div>

        <div class="max-h-[260px] overflow-y-auto px-3.5 py-2.5">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="mb-1.5 rounded-lg bg-slate-50 p-1 last:mb-0 dark:bg-gray-700/60"
          >
            <ProjectLink :project-id="task.projectId" :task-title="task.title">
              {{ task.title }}
            </ProjectLink>
            <div class="text-slate-500 dark:text-gray-300">
              {{ getTaskTimeRange(task) || '—' }}
            </div>
          </div>
          <div v-if="tasks.length === 0" class="py-6 text-center text-slate-400">—</div>
        </div>

        <div
          v-if="tasks.length > 1"
          class="flex items-center justify-center border-t border-slate-200 px-3.5 py-2.5 dark:border-gray-700"
        >
          <TextButton
            variant="secondary"
            size="sm"
            class=""
            :disabled="tasks.length === 0"
            @click="$emit('open-day-view')"
          >
            {{ t('button.view_full_day') }}
          </TextButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';

import TextButton from '@/components/core/button/TextButton.vue';
import ProjectLink from '@/components/core/link/ProjectLink.vue';
import DeleteButton from '@/components/ui/DeleteButton.vue';

defineProps<{
  visible: boolean;
  position: { top: string; left: string } | null;
  tasks: TaskResponse[];
  dateLabel: string;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'open-day-view'): void;
}>();

const { t } = useI18n();

const getTaskTimeRange = (task: TaskResponse): string => {
  const formatTime = (date: Date) =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  const start = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
  const end = task.endDateTime ? new Date(task.endDateTime) : null;

  if (start && end) {
    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  if (end) {
    return formatTime(end);
  }

  if (start) {
    return formatTime(start);
  }

  return '';
};
</script>
