<template>
  <div class="grid grid-cols-1 gap-8">
    <DownloadTemplateExcel class="mt-4" />

    <!-- 上傳 + 概覽 -->
    <UploadOverviewSection
      v-model:upload-error="uploadError"
      :has-projects="hasProjects"
      :is-processing="isProcessing"
      :projects="filteredProjectsMapBoard"
      :is-loading-projects="isLoadingProjects"
      :projects-updated-at="projectsUpdatedAt"
      :ensure-can-create-project="ensureCanCreateProject"
      @file-ready="handleFileReady"
    />

    <!-- 上傳甘特圖成果 -->
    <UploadPreviewSection
      :dummy-gantt-project="dummyGanttProject"
      :dummy-onsite-tasks="dummyOnsiteTasks"
    />

    <!-- 專案甘特圖（概覽開啟時） -->
    <ProjectsGanttSection
      v-if="hasProjects"
      :projects="filteredProjectsMapBoard"
      :planning-tasks="fetchedAllPlanningTasks"
      :is-loading="isLoadingAllPlanningTasks"
      :initial-project-id="latestUploadedProjectId"
    />

    <!-- Demo 區塊（無 overview 且尚未載入示範檔時顯示） -->
    <section v-if="!hasProjects && !dummyGanttProject" class="flex flex-col items-center p-12">
      <Label class-name="block w-full text-center" :label="t('label.planning.demo')" />
      <TextButton
        variant="primary"
        size="md"
        class="h-[30px] w-full px-6 md:w-auto"
        @click="loadProcessDummy"
      >
        {{ t('button.download_demo') }}
      </TextButton>
    </section>

    <PlanningMaterialSection
      v-if="hasProjects"
      :projects="filteredProjectsMapBoard"
      :latest-uploaded-project-id="latestUploadedProjectId"
    />
  </div>
  <LoadingOverlay
    :show="isProcessing"
    :message="t('upload.parsing_excel')"
    :subtext="t('upload.description_cover')"
  />
  <!-- 對話框 -->
  <CreateProjectTypeDialog
    v-model="showCreateProjectTypeDialog"
    @update:project-type="handleCreateProjectWithExcel"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { GanttProject } from '@/types/gantt';
import type { ProjectResponse, TaskResponse } from '@/types/response';

import TextButton from '@/components/core/button/TextButton.vue';
import CreateProjectTypeDialog from '@/components/core/dialog/CreateProjectTypeDialog.vue';
import LoadingOverlay from '@/components/core/loading/LoadingOverlay.vue';
import Label from '@/components/core/title/Label.vue';
import DownloadTemplateExcel from '@/components/planning/DownloadTemplateExcel.vue';
import ProjectsGanttSection from '@/components/planning/ProjectsGanttSection.vue';
import UploadOverviewSection from '@/components/planning/UploadOverviewSection.vue';
import UploadPreviewSection from '@/components/planning/UploadPreviewSection.vue';
import PlanningMaterialSection from '@/components/planning-material/PlanningMaterialSection.vue';
import { useProjectCreationGuard } from '@/composables/guard/useProjectCreationGuard';
import { useProgressExcelImport } from '@/composables/planning/useProgressExcelImport';
import { usePlanningTasks } from '@/composables/query/usePlanningTasks';
import { useProjects } from '@/composables/query/useProjects';
import { useTasks } from '@/composables/query/useTasks';
import { mapTasksToProjects } from '@/utils/projects/mapTasksToProjects';

const { t } = useI18n();
const { fetchedProjects, isLoadingProjects, projectsUpdatedAt, refetchProjects } = useProjects();
const { dummyGanttProject, isProcessing, uploadError, loadProcessDummy, processParsedExcelData } =
  useProgressExcelImport(fetchedProjects);
const { fetchedAllPlanningTasks, isLoadingAllPlanningTasks } = usePlanningTasks();
const { fetchedAllTasks } = useTasks();

// 專案 + 任務合併，供佈告欄/甘特使用
const projectsMapBoard = computed<(ProjectResponse & { tasks: TaskResponse[] })[]>(() =>
  mapTasksToProjects(fetchedProjects?.value || [], fetchedAllTasks?.value || [])
);

const filteredProjectsMapBoard = computed(() =>
  (projectsMapBoard.value ?? []).filter((project) => project.planningStartDate !== null)
);

const hasProjects = computed(() => filteredProjectsMapBoard.value.length > 0);
type GanttProjectWithOnsite = GanttProject & { onsiteTask?: TaskResponse[] };
const dummyOnsiteTasks = computed(() => {
  return (dummyGanttProject.value as GanttProjectWithOnsite | null)?.onsiteTask;
});
const showCreateProjectTypeDialog = ref(false);
const latestUploadedProjectId = ref<string | null>(null);
let pendingFile: File | null = null;
let pendingFileName: string = '';
const { ensureCanCreateProject } = useProjectCreationGuard();

const handleFileReady = (file: File) => {
  pendingFile = file;
  pendingFileName = file.name;
  showCreateProjectTypeDialog.value = true;
};

const handleCreateProjectWithExcel = async (selectedType: string) => {
  if (!pendingFile) return;

  try {
    isProcessing.value = true;
    const { parseExcelFile } = await import('@/utils/excel/progressParser');

    const parsedData = await parseExcelFile(pendingFile);

    const projectId = await processParsedExcelData(parsedData, pendingFileName, selectedType);

    if (projectId) {
      latestUploadedProjectId.value = projectId;
    }

    await refetchProjects();
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : '檔案解析失敗，請檢查檔案格式';
  } finally {
    isProcessing.value = false;
    pendingFile = null;
    pendingFileName = '';
  }
};
</script>

<style scoped></style>
