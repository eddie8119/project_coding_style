<template>
  <Loading v-if="isLoadingProjects || isLoadingAllTasks" />
  <div v-else class="flex flex-col gap-8 md:gap-10 lg:gap-16">
    <ProjectsBulletinBoard
      :tasks="fetchedAllTasks"
      :projects="projectsMapBoard"
      :collaborators="collaborators"
      :is-loading="isLoadingProjects && isLoadingAllCollaborators"
      :last-updated="projectsUpdatedAt"
      :planning-totals-by-project-id="planningTotalsByProjectId"
      :usage-totals-by-project-id="usageTotalsByProjectId"
    />
    <PlansOverview :projects="projectsMapBoard" :tasks="fetchedAllTasks" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { ProjectResponse, TaskResponse } from '@/types/response';

import Loading from '@/components/core/loading/Loading.vue';
import ProjectsBulletinBoard from '@/components/core/situationRoom/ProjectsBulletinBoard.vue';
import PlansOverview from '@/components/plan/PlansOverview.vue';
import { useMaterialCost } from '@/composables/material/useMaterialCost';
import { usePlanningTotalsByProjectId } from '@/composables/material/usePlanningMaterialCost';
import { useAllProjectCollaborators } from '@/composables/query/useCollaborators';
import { useProjects } from '@/composables/query/useProjects';
import { useTasks } from '@/composables/query/useTasks';
import { mapTasksToProjects } from '@/utils/projects/mapTasksToProjects';

const { fetchedAllTasks, isLoadingAllTasks } = useTasks();
const { fetchedProjects, isLoadingProjects, projectsUpdatedAt } = useProjects();
const { collaborators, isLoadingAllCollaborators } = useAllProjectCollaborators();
const { planningTotalsByProjectId } = usePlanningTotalsByProjectId();

// 依 projectId 將任務併入對應的 project，讓看板能顯示 task 進度
const projectsMapBoard = computed<(ProjectResponse & { tasks: TaskResponse[] })[]>(() =>
  mapTasksToProjects(fetchedProjects?.value || [], fetchedAllTasks?.value || [])
);

// 用量總計（依 projectId 聚合，改用所有材料資料以包含未綁任務的材料）
const { usageTotalsByProjectId } = useMaterialCost();
</script>

<style lang="scss" scoped></style>
