<template>
  <div class="md:mt-6">
    <HorizontalScrollLayout>
      <div
        v-for="construction in filteredConstructionList"
        :key="construction.id"
        class="flex-shrink-0"
      >
        <OverviewConstructionContainerItem
          :construction-id="construction.id"
          :construction-name="construction.name"
          :read-only="true"
          :tasks="tasksByConstruction(construction.id)"
          :project-title-list="projectTitleList"
        />
      </div>
    </HorizontalScrollLayout>
  </div>
</template>

<script setup lang="ts">
import type { ProjectTitle } from '@/types/project';
import type { TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import HorizontalScrollLayout from '@/components/app-layout/HorizontalScrollLayout.vue';
import OverviewConstructionContainerItem from '@/components/overview/OverviewConstructionContainerItem.vue';
import { usePlanningMaterials } from '@/composables/query/usePlanningMaterials';
import { providePlanningMaterials } from '@/context/usePlanningMaterialsContext';

const { filteredConstructionList, filteredTasks, projectTitleList } = defineProps<{
  filteredConstructionList: ConstructionSelection[];
  filteredTasks: TaskResponse[];
  projectTitleList: ProjectTitle[];
}>();
const { planningMaterials } = usePlanningMaterials();
providePlanningMaterials(planningMaterials);

// 按工程類型過濾任務
const tasksByConstruction = (constructionId: string): TaskResponse[] => {
  return filteredTasks.filter((f: TaskResponse) => f.constructionType === constructionId);
};
</script>

<style scoped></style>
