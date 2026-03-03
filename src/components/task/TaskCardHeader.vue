<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center">
      <DragHandle v-if="!readOnly" :size="4" handle-class="task-drag-handle" />

      <ProjectLink
        v-if="showRouter"
        class="toggle-button"
        :project-id="task.projectId"
        :task-title="task.title"
      >
        <H3Title :title="task.title" class="toggle-link ml-2" />
      </ProjectLink>
      <H3Title v-else :title="task.title" class="ml-2" />
    </div>
    <div class="mr-1 mt-1 flex flex-col gap-1">
      <TaskStatusDropdown
        :read-only="readOnly"
        :status="task.status"
        @update:status="$emit('update:status', $event)"
      />
      <div class="flex items-center justify-end gap-2">
        <button
          v-if="!readOnly"
          class="invisible rounded-full bg-blue-100 p-1 hover:bg-blue-200 group-hover:visible"
          @click="$emit('edit')"
        >
          <EditIcon :size="'h-4 w-4'" />
        </button>
        <TrashButton
          v-if="!readOnly"
          class="invisible group-hover:visible"
          @click="showDeleteTaskDialog = true"
        />
      </div>
    </div>
  </div>
  <!-- 刪除確認對話框 -->
  <DeleteDialog
    v-model="showDeleteTaskDialog"
    :subject="t('project.construction')"
    :target="task.title"
    @confirm="$emit('delete', task.id)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';
import type { TaskStatus } from '@/types/task';

import DeleteDialog from '@/components/core/dialog/DeleteDialog.vue';
import ProjectLink from '@/components/core/link/ProjectLink.vue';
import H3Title from '@/components/core/title/H3Title.vue';
import DragHandle from '@/components/ui/DragHandle.vue';
import EditIcon from '@/components/ui/EditIcon.vue';
import TaskStatusDropdown from '@/components/ui/TaskStatusDropdown.vue';
import TrashButton from '@/components/ui/TrashButton.vue';

defineProps<{
  task: TaskResponse;
  readOnly?: boolean;
  showRouter?: boolean;
}>();

defineEmits<{
  (e: 'edit'): void;
  (e: 'delete', taskId: string): void;
  (e: 'update:status', status: TaskStatus): void;
}>();

const { t } = useI18n();
const showDeleteTaskDialog = ref(false);
</script>
