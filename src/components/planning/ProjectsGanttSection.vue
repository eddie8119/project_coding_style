<template>
  <PanelTabsLayout
    v-model="selectedProjectId"
    :tabs="projectTabs"
    :title="t('label.planning.projects_display')"
  >
    <div v-if="props.isLoading" class="flex w-full items-center justify-center">
      <Loading />
    </div>
    <div v-else class="flex flex-col gap-4">
      <div class="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div class="flex flex-col gap-2">
          <p class="description-text">{{ t('upload.edit_planning_gantt_bar') }}</p>
          <LegendIndicators :items="legendItems" />
        </div>
        <div class="flex w-full justify-end sm:w-auto sm:justify-start">
          <DownloadGanttArea
            v-if="ganttProject"
            :gantt-project="ganttProject"
            gantt-element-id="gantt-chart-container"
          />
        </div>
      </div>

      <!-- 根據選中的專案組裝甘特圖資料 -->
      <div class="-mx-2 overflow-x-auto pb-2 sm:mx-0 sm:overflow-visible">
        <div id="gantt-chart-container" class="min-w-[540px] sm:min-w-0">
          <GanttChart
            v-if="ganttProject"
            :project="ganttProject"
            :onsite-task="onsiteTasks"
            @update-schedule="handleScheduleUpdate"
            @open-edit="openEditDialog"
            @create-task="openCreateDialog"
            @request-create-category="openCreateCategoryDialog"
            @delete="promptDeleteTask"
            @update-note="handleUpdateNote"
          />
        </div>
      </div>
    </div>
  </PanelTabsLayout>
  <!-- 編輯進度條對話框 -->
  <GanttTaskEditDialog
    v-model="isEditDialogVisible"
    v-model:content="editContent"
    v-model:date-range="editDateRange"
    :mode="editDialogMode"
    @submit="submitEditDialog"
  />
  <DeleteDialog
    v-model="isDeleteDialogVisible"
    :subject="t('label.planning.item')"
    :target="deletingTaskName"
    @confirm="confirmDeleteTask"
  />
  <GanttConstructionCreateDialog
    v-model="isCreateCategoryDialogVisible"
    @submit="handleCreateCategory"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import type { GanttNoteType, GanttProject } from '@/types/gantt';
import type { ProjectTitle } from '@/types/project';
import type { PlanningTaskResponse, ProjectResponse, TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

import PanelTabsLayout from '@/components/app-layout/PanelTabsLayout.vue';
import GanttConstructionCreateDialog from '@/components/core/dialog/ConstructionCreateDialog.vue';
import DeleteDialog from '@/components/core/dialog/DeleteDialog.vue';
import GanttTaskEditDialog from '@/components/core/dialog/GanttTaskEditDialog.vue';
import Loading from '@/components/core/loading/Loading.vue';
import GanttChart from '@/components/gant/GanttChart.vue';
import DownloadGanttArea from '@/components/planning/DownloadGanttArea.vue';
import LegendIndicators from '@/components/ui/LegendIndicators.vue';
import { usePlanningTaskDialog } from '@/composables/planning/usePlanningTaskDialog';
import { useCommon } from '@/composables/query/useCommon';
import { usePlanningTasks } from '@/composables/query/usePlanningTasks';
import { useProjectMutations } from '@/composables/query/useProject';
import { useProjects } from '@/composables/query/useProjects';
import { provideProjectTitleList } from '@/context/useProjectTitleListContext';
import { buildGanttProjectFromPlanning } from '@/utils/gantt/planningToGantt';

const props = defineProps<{
  planningTasks: PlanningTaskResponse[] | undefined;
  projects: ProjectResponse[] | undefined;
  isLoading: boolean;
  initialProjectId?: string | null;
}>();

const { t } = useI18n();
const { updatePlanningTask, deletePlanningTask, createPlanningTask } = usePlanningTasks();
const { updateProjectById } = useProjectMutations();
const { updateCommon, fetchedCommon } = useCommon();
const { refetchProjects } = useProjects();

const selectedProjectId = ref<string | null>(null);
const projectOverrides = ref<Map<string, Partial<ProjectResponse>>>(new Map());

const currentProject = computed<ProjectResponse | undefined>(() => {
  const project = props.projects?.find((item) => item.id === selectedProjectId.value);
  if (!project) return undefined;
  const override = projectOverrides.value.get(project.id);
  if (!override) return project;
  return { ...project, ...override };
});

const currentPlanningTasks = computed<PlanningTaskResponse[]>(() => {
  if (!selectedProjectId.value) return [];
  return (props.planningTasks ?? []).filter((task) => task.projectId === selectedProjectId.value);
});

const legendItems = computed(() => [
  { label: t('label.legend.design_phase'), color: 'var(--color-brand-tertiary)' },
  { label: t('label.legend.onsite_phase'), color: 'var(--color-brand-primary)' },
]);

const isCreateCategoryDialogVisible = ref(false);

const {
  isEditDialogVisible,
  editDialogMode,
  editContent,
  editDateRange,
  isDeleteDialogVisible,
  deletingTaskName,
  handleScheduleUpdate,
  openEditDialog,
  openCreateDialog,
  submitEditDialog,
  promptDeleteTask,
  confirmDeleteTask,
} = usePlanningTaskDialog({
  selectedProjectId,
  currentPlanningTasks,
  updatePlanningTask,
  createPlanningTask,
  deletePlanningTask,
});

const openCreateCategoryDialog = () => {
  isCreateCategoryDialogVisible.value = true;
};

const handleCreateCategory = async (payload: { name: string }) => {
  if (!selectedProjectId.value || !currentProject.value) return;

  const newCategory = {
    id: crypto.randomUUID(),
    name: payload.name,
  };

  // 更新專案自己的 constructionContainer
  const updatedContainer = [...(currentProject.value.constructionContainer ?? []), newCategory];
  await updateProjectById(selectedProjectId.value, {
    constructionContainer: updatedContainer,
  });

  // 更新通用 construction
  if (fetchedCommon.value) {
    const commonConstructions = fetchedCommon.value.construction ?? [];
    const isExisting = commonConstructions.some((item) => item.name === payload.name);

    if (!isExisting) {
      const updatedCommonConstructions = [...commonConstructions, newCategory];
      await updateCommon({
        id: fetchedCommon.value.id,
        data: { construction: updatedCommonConstructions },
      });
    }
  }

  await refetchProjects();
};

const handleUpdateNote = async (payload: { type: GanttNoteType; date: Date; value: string }) => {
  if (!selectedProjectId.value || !currentProject.value) return;

  const project = currentProject.value;

  const fieldKeyMap: Record<typeof payload.type, keyof ProjectResponse> = {
    special: 'planningSpecialHolidays',
    payment: 'planningPaymentRemittances',
    preparation: 'planningPreConstructionNotes',
  };

  const fieldKey = fieldKeyMap[payload.type];

  const originalList = (project[fieldKey] ?? []) as unknown as {
    value: string;
    startDate: string | Date;
    endDate: string | Date;
  }[];

  const targetDateKey = payload.date.toISOString().slice(0, 10);

  const normalizeDate = (value: string | Date): Date =>
    value instanceof Date ? value : new Date(value);

  const updatedList = [...originalList];

  const existingIndex = updatedList.findIndex((cell) => {
    const start = normalizeDate(cell.startDate);
    return start.toISOString().slice(0, 10) === targetDateKey;
  });

  const trimmedValue = payload.value.trim();

  if (!trimmedValue) {
    if (existingIndex >= 0) {
      updatedList.splice(existingIndex, 1);
    }
  } else {
    const newCell = {
      value: trimmedValue,
      startDate: payload.date.toISOString(),
      endDate: payload.date.toISOString(),
    };

    if (existingIndex >= 0) {
      updatedList[existingIndex] = newCell;
    } else {
      updatedList.push(newCell);
    }
  }

  const patch: Partial<ProjectResponse> = {
    [fieldKey]: updatedList as ProjectResponse[typeof fieldKey],
  } as Partial<ProjectResponse>;

  const projectId = selectedProjectId.value;
  const prevOverrides = projectOverrides.value;
  const nextOverrides = new Map(projectOverrides.value);
  nextOverrides.set(projectId, {
    ...(nextOverrides.get(projectId) ?? {}),
    ...patch,
  });
  projectOverrides.value = nextOverrides;

  try {
    await updateProjectById(projectId, patch as unknown as Partial<CreateProjectSchema>);
  } catch (error) {
    console.error('更新備註失敗：', error);
    projectOverrides.value = prevOverrides;
  }
};

const projectTabs = computed(() => {
  return (props.projects ?? []).map((project) => ({
    value: project.id,
    label: project.title,
  }));
});

watch(
  () => props.projects,
  (projects) => {
    const availableIds = new Set((projects ?? []).map((project) => project.id));
    const next = new Map(projectOverrides.value);
    let changed = false;
    for (const key of next.keys()) {
      if (!availableIds.has(key)) {
        next.delete(key);
        changed = true;
      }
    }
    if (changed) {
      projectOverrides.value = next;
    }
  }
);

// 提供 DayTimelineView 所需的 projectTitleList context
const projectTitleList = computed<ProjectTitle[]>(() =>
  (props.projects ?? []).map((project) => ({ id: project.id, title: project.title }))
);

provideProjectTitleList(projectTitleList);

watchEffect(() => {
  if (props.initialProjectId) {
    selectedProjectId.value = props.initialProjectId;
  } else if (!selectedProjectId.value && projectTabs.value.length > 0) {
    selectedProjectId.value = projectTabs.value[0]?.value ?? null;
  }
});

const onsiteTasks = computed<TaskResponse[]>(() => {
  return currentProject.value?.tasks ?? [];
});

// 僅使用當前專案的 constructionContainer 作為類別來源
const currentConstructionContainer = computed<ConstructionSelection[]>(() => {
  return currentProject.value?.constructionContainer ?? [];
});

const ganttProject = computed<GanttProject | null>(() => {
  const project = currentProject.value;
  if (!project) return null;
  // 沒有有效日期時不渲染甘特圖
  return buildGanttProjectFromPlanning({
    project,
    tasks: currentPlanningTasks.value,
    constructionNameById: new Map(
      currentConstructionContainer.value.map((item) => [item.id, item.name])
    ),
    unclassifiedLabel: t('common.unclassified'),
  });
});
</script>

<style scoped></style>
