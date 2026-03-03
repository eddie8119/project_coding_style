<template>
  <PanelTabsLayout
    v-model="selectedProjectId"
    :title="t('label.planning.planning_material')"
    :tabs="projectTabs"
    section-id="planning-material-section"
  >
    <PlanningMaterialBoard
      v-if="selectedProjectId && constructionContainer"
      :key="selectedProjectId"
      :construction-container="constructionContainer"
      :project-id="selectedProjectId"
    />
  </PanelTabsLayout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ProjectResponse, TaskResponse } from '@/types/response';

import PanelTabsLayout from '@/components/app-layout/PanelTabsLayout.vue';
import PlanningMaterialBoard from '@/components/planning-material/PlanningMaterialBoard.vue';

const props = defineProps<{
  projects: (ProjectResponse & { tasks: TaskResponse[] })[] | null;
  latestUploadedProjectId?: string | null;
}>();
const { t } = useI18n();
const selectedProjectId = ref<string | null>(null);

const projectTabs = computed(() => {
  return (props.projects ?? []).map((project) => ({
    value: project.id,
    label: project.title,
  }));
});

const constructionContainer = computed(() => {
  if (!selectedProjectId.value || !props.projects) return null;
  const project = props.projects.find((p) => p.id === selectedProjectId.value);
  return project?.constructionContainer ?? null;
});

watch(
  () => ({
    projects: props.projects,
    latestId: props.latestUploadedProjectId,
  }),
  ({ projects, latestId }) => {
    const availableProjects = projects ?? [];

    if (availableProjects.length === 0) {
      selectedProjectId.value = null;
      return;
    }

    if (latestId && availableProjects.some((project) => project.id === latestId)) {
      selectedProjectId.value = latestId;
      return;
    }

    if (
      !selectedProjectId.value ||
      !availableProjects.some((p) => p.id === selectedProjectId.value)
    ) {
      selectedProjectId.value = availableProjects[0].id;
    }
  },
  { immediate: true }
);
</script>
