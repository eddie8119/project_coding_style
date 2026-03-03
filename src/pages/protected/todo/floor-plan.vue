<template>
  <div
    v-if="isLoadingProject || isLoadingTasks"
    class="flex h-full w-full items-center justify-center"
  >
    <Loading />
  </div>
  <FloorPlanContainer
    v-else
    :floor-plan-urls="fetchedProject?.floorPlanUrls || []"
    :project-id="projectId"
    :update-project="updateProject"
    :tasks="filteredTasks"
    :construction-container="fetchedProject?.constructionContainer || null"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import Loading from '@/components/core/loading/Loading.vue';
import FloorPlanContainer from '@/components/plan/FloorPlanContainer.vue';
import { useProject } from '@/composables/query/useProject';
import { useTasks } from '@/composables/query/useTasks';
import { useProjectId } from '@/composables/useProjectId';

const { projectId } = useProjectId();
const { isLoadingProject, fetchedProject, updateProject } = useProject(projectId);
const { isLoadingTasks, fetchedTasks } = useTasks(projectId);

const filteredTasks = computed(() =>
  (fetchedTasks.value || []).filter((task) => task.status !== 'done')
);
</script>

<style scoped></style>
