<template>
  <div
    v-if="isLoadingProject || isLoadingTasks"
    class="flex h-full w-full items-center justify-center"
  >
    <Loading />
  </div>
  <div v-else class="relative h-full w-full min-w-0 overflow-x-hidden">
    <ProjectHeader
      :local-project="projectRef"
      :project-id="projectId"
      :last-update-time="formattedUpdateTime"
      @update:project-title="updateProjectTitle"
      @update:project-type="updateProjectType"
    />

    <KanbanBoard
      :project-id="projectId"
      :construction-container="projectRef?.constructionContainer || null"
      :tasks="fetchedTasks"
      @update:construction-container="updateConstructionContainer"
    />

    <MaterialBoard
      :construction-container="projectRef?.constructionContainer || null"
      :project-id="projectId"
      :tasks="fetchedTasks"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue';

import type { ProjectResponse } from '@/types/response';

import Loading from '@/components/core/loading/Loading.vue';
import ProjectHeader from '@/components/project/ProjectHeader.vue';
import { useProject } from '@/composables/query/useProject';
import { useTasks } from '@/composables/query/useTasks';
import { useProjectUpdates } from '@/composables/todo/useProjectUpdates';
import { useProjectId } from '@/composables/useProjectId';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { adjustTimeZone, formatDateTimeToMinutes } from '@/utils/date';
const KanbanBoard = defineAsyncComponent(() => import('@/components/project/KanbanBoard.vue'));
const MaterialBoard = defineAsyncComponent(() => import('@/components/material/MaterialBoard.vue'));

const { projectId } = useProjectId();

// 獲取專案與任務資料
const { isLoadingProject, fetchedProject, updateProject } = useProject(projectId);
const projectRef = ref<ProjectResponse | null>(null);

watch(
  fetchedProject,
  (value) => {
    projectRef.value = value ?? null;
  },
  { immediate: true }
);
const { isLoadingTasks, fetchedTasks } = useTasks(projectId);

// 本地更新時間（用於顯示最後操作時間）
const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

// 專案更新操作（標題、類型、工程容器）
const { updateProjectTitle, updateProjectType, updateConstructionContainer } = useProjectUpdates(
  projectRef,
  updateProject,
  updateLastUpdateTime
);

// 格式化顯示的最後更新時間
const formattedUpdateTime = computed(() => {
  // 優先顯示本地操作時間
  if (lastUpdateTime.value) {
    return lastUpdateTime.value;
  }
  // 否則顯示伺服器回傳的更新時間
  if (projectRef.value?.updatedAt) {
    // ProjectResponse.updatedAt 是 Date 類型，需轉為 string
    const updatedAtStr =
      projectRef.value.updatedAt instanceof Date
        ? projectRef.value.updatedAt.toISOString()
        : String(projectRef.value.updatedAt);
    return formatDateTimeToMinutes(adjustTimeZone(updatedAtStr));
  }
  return '';
});
</script>

<style scoped></style>
