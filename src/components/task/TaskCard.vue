<template>
  <TaskCardBase
    :task="task"
    :read-only="readOnly"
    @update:task="handleUpdateTask"
    @delete="handleDeleteTask"
  />
</template>

<script setup lang="ts">
import type { TaskResponse } from '@/types/response';

import TaskCardBase from '@/components/task/TaskCardBase.vue';
import { useTasks } from '@/composables/query/useTasks';
import { useTaskContext } from '@/context/useTaskContext';

const props = defineProps<{
  task: TaskResponse;
  readOnly?: boolean;
}>();

const { deleteTask: deleteTaskFromContext, updateTask: updateTaskInContext } = useTaskContext();
const { deleteTask: deleteTaskFromApi, updateTask: updateTaskFromApi } = useTasks(
  props.task.projectId
);

const handleUpdateTask = async (taskId: string, patch: Partial<TaskResponse>) => {
  const { success, data } = await updateTaskFromApi(taskId, patch);
  if (success && data) {
    updateTaskInContext(taskId, data);
  }
};

const handleDeleteTask = async (taskId: string) => {
  const success = await deleteTaskFromApi(taskId);
  if (success) {
    deleteTaskFromContext(taskId);
  }
};
</script>
