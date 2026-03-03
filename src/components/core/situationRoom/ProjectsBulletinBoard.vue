<template>
  <section class="relative flex flex-col">
    <div
      class="z-10 flex"
      :class="
        isMobile
          ? 'order-last mt-2 w-full justify-end px-4'
          : 'absolute bottom-5 right-[16px] mb-3 justify-end'
      "
    >
      <BatchDownloadExcelArea :projects="projects" :tasks="tasks" />
    </div>
    <Table
      :data="projects"
      :columns="PROJECT_TODO_COLUMNS"
      :loading="isLoading"
      :show-id-column="true"
      :show-actions="false"
      :show-search="true"
      :show-pagination="true"
      :last-update-time="lastUpdated"
      :table-height="tableHeight"
      :actions="[]"
      @edit="() => {}"
    >
      <template #type="{ row }">
        <p>{{ t(`option.projectType.${row.type}`) }}</p>
      </template>
      <template #task_done_progress="{ row }">
        <ProgressBar
          :value="row.tasks.filter((t: TaskResponse) => t.status === TaskStatusEnum.DONE).length"
          :show-percentage="true"
          :total="row.tasks.length"
        />
      </template>
      <template #task_todo_left="{ row }">
        <div class="flex justify-center">
          <p>
            {{ row.tasks.filter((t: TaskResponse) => t.status === TaskStatusEnum.TODO).length }}
          </p>
        </div>
      </template>
      <template #total_planning_amount="{ row }">
        <p class="text-right">
          $
          {{
            (planningTotalsByProjectId?.[row.id] ?? 0).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          }}
        </p>
      </template>
      <template #total_usage_amount="{ row }">
        <p class="text-right">
          $
          {{
            (usageTotalsByProjectId?.[row.id] ?? 0).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          }}
        </p>
      </template>
      <template #floor_plan_urls="{ row }">
        <div class="flex justify-center">
          <FloorPlanPreviewIcon :floor-plan-urls="row.floorPlanUrls" :project-id="row.id" />
        </div>
      </template>
      <template #download_excel="{ row }">
        <DownloadExcelArea :project="row" :tasks="tasks" />
      </template>
      <template #owner="{ row }">
        <p class="text200-color-difference">
          {{ row.ownerName }}
        </p>
      </template>
      <template #collaborators="{ row }">
        <AvatarsList :collaborators="projectCollaboratorsMap[row.id] || []" />
      </template>
      <template #empty>
        <ContentEmptyState
          :description="t('setting.info.empty_project_description')"
          :button-label="t('setting.info.go_to_planning_projects')"
          button-to="/planning/upload"
        />
      </template>
    </Table>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UpdateTimeType } from '@/types/common';
import type { ProjectCollaboratorResponse, ProjectResponse, TaskResponse } from '@/types/response';

import AvatarsList from '@/components/core/AvatarsList.vue';
import ProgressBar from '@/components/core/chart/ProgressBar.vue';
import ContentEmptyState from '@/components/core/ContentEmptyState.vue';
import Table from '@/components/core/table/Table.vue';
import FloorPlanPreviewIcon from '@/components/project/FloorPlanPreviewIcon.vue';
import BatchDownloadExcelArea from '@/components/projects/BatchDownloadExcelArea.vue';
import DownloadExcelArea from '@/components/projects/DownloadExcelArea.vue';
import { useResponsiveWidth } from '@/composables/ui/useResponsiveWidth';
import { PROJECT_TODO_COLUMNS } from '@/constants/columns/project';
import { TaskStatusEnum } from '@/types/task';

const props = defineProps<{
  tasks: TaskResponse[] | undefined;
  projects: ProjectResponse[] | undefined;
  collaborators: ProjectCollaboratorResponse[] | undefined;
  isLoading: boolean;
  lastUpdated: UpdateTimeType | undefined;
  planningTotalsByProjectId?: Record<string, number>;
  usageTotalsByProjectId?: Record<string, number>;
}>();

const { t } = useI18n();
const { isMobile } = useResponsiveWidth();

const tableHeight = computed(() =>
  isMobile.value
    ? '300px'
    : `${Math.max(0, (window.innerHeight || document.documentElement.clientHeight) - 460)}px`
);

const projectCollaboratorsMap = computed<Record<string, ProjectCollaboratorResponse[]>>(() => {
  const map: Record<string, ProjectCollaboratorResponse[]> = {};

  (props.collaborators || []).forEach((collaborator) => {
    if (!collaborator.projectId) return;

    if (!map[collaborator.projectId]) {
      map[collaborator.projectId] = [];
    }

    map[collaborator.projectId].push(collaborator);
  });

  return map;
});
</script>

<style lang="scss" scoped></style>
