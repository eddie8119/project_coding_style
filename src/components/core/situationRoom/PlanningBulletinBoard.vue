<template>
  <section class="relative flex flex-col">
    <Table
      :data="projects"
      :columns="PROJECT_PLANNING_COLUMNS"
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
      <template #construction_planning_period="{ row }">
        {{ formatDate(new Date(row.planningStartDate)) }}
        <span class="text200-color-difference">~</span>
        {{ formatDate(new Date(row.planningEndDate)) }}
      </template>
      <template #floorPlanUrls="{ row }">
        <FloorPlanPreviewIcon :floor-plan-urls="row.floorPlanUrls" :project-id="row.id" />
      </template>
      <template #owner="{ row }">
        <p class="text200-color-difference">{{ row.ownerName }}</p>
      </template>
      <template #total_planning_amount="{ row }">
        <p class="text-right tabular-nums">
          $
          {{
            (planningTotalsByProjectId?.[row.id] ?? 0).toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })
          }}
        </p>
      </template>
    </Table>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { UpdateTimeType } from '@/types/common';
import type { ProjectResponse, TaskResponse } from '@/types/response';

import Table from '@/components/core/table/Table.vue';
import FloorPlanPreviewIcon from '@/components/project/FloorPlanPreviewIcon.vue';
import { useResponsiveWidth } from '@/composables/ui/useResponsiveWidth';
import { PROJECT_PLANNING_COLUMNS } from '@/constants/columns/project';
import { formatDate } from '@/utils/date';

defineProps<{
  tasks: TaskResponse[] | undefined;
  projects: ProjectResponse[] | undefined;
  isLoading: boolean;
  lastUpdated: UpdateTimeType | undefined;
  planningTotalsByProjectId?: Record<string, number>;
}>();

const { t } = useI18n();
const { isMobile } = useResponsiveWidth();

const tableHeight = computed(() => {
  if (isMobile.value) return '300px';

  const baseHeight = Math.max(
    0,
    (window.innerHeight || document.documentElement.clientHeight) - 430
  );
  const clampedHeight = Math.min(baseHeight, 300);

  return `${clampedHeight}px`;
});
</script>

<style lang="scss" scoped></style>
