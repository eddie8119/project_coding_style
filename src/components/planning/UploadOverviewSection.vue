<template>
  <section
    class="flex flex-col gap-4 md:flex-row"
    :class="{ 'md:items-stretch': props.hasProjects }"
  >
    <div
      class="w-full"
      :class="{
        'md:w-full': !props.hasProjects,
        'md:w-1/3': props.hasProjects,
      }"
    >
      <ProcessFileUploader
        :loading="props.isProcessing"
        :error="props.uploadError || undefined"
        @file-uploaded="handleFileUpload"
      />
    </div>

    <div v-if="props.hasProjects" class="w-full md:w-2/3">
      <PlanningBulletinBoard
        :tasks="[]"
        :projects="props.projects ?? []"
        :is-loading="props.isLoadingProjects"
        :last-updated="props.projectsUpdatedAt || undefined"
        :planning-totals-by-project-id="planningTotalsByProjectId"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { ProjectResponse, TaskResponse } from '@/types/response';

import PlanningBulletinBoard from '@/components/core/situationRoom/PlanningBulletinBoard.vue';
import ProcessFileUploader from '@/components/planning/ProcessFileUploader.vue';
import { usePlanningTotalsByProjectId } from '@/composables/material/usePlanningMaterialCost';

const props = defineProps<{
  hasProjects: boolean;
  isProcessing: boolean;
  uploadError: string | null;
  projects: (ProjectResponse & { tasks: TaskResponse[] })[] | null;
  isLoadingProjects: boolean;
  projectsUpdatedAt: number | null;
  ensureCanCreateProject: () => boolean;
}>();

const emit = defineEmits<{
  (e: 'file-ready', file: File): void;
  (e: 'update:uploadError', value: string | null): void;
}>();

const { t } = useI18n();
const { planningTotalsByProjectId } = usePlanningTotalsByProjectId();

const handleFileUpload = (file: File) => {
  if (!file) return;

  if (!props.ensureCanCreateProject()) return;

  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  if (!validTypes.includes(file.type)) {
    emit('update:uploadError', t('upload.invalid_excel_type'));
    return;
  }

  emit('update:uploadError', null);
  emit('file-ready', file);
};
</script>
