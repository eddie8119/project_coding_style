<template>
  <div
    v-if="projectsWithImages.length"
    class="grid gap-5"
    :class="
      props.singleColumn
        ? 'grid-cols-1'
        : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
    "
  >
    <div
      v-for="project in projectsWithImages"
      :key="project.id"
      class="panel-container flex aspect-[16/15] w-full flex-col border border-gray-200"
    >
      <H3Title :title="project.title" />

      <!-- 使用固定長寬比的容器，確保圖片不被截斷 -->
      <div class="relative aspect-[16/12] w-full">
        <ImageCarousel
          class="h-full w-full"
          :images="project.floorPlanUrls || []"
          :alt-text="'Floor plan'"
          :tasks="projectTasksMap[project.id] || []"
        />
      </div>
    </div>
  </div>

  <ContentEmptyState
    v-else-if="props.showEmptyState"
    :title="t('message.no_plan')"
    :button-label="t('setting.info.go_to_upload_plan')"
    button-to="/todo/projects"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ProjectResponse } from '@/types/response';
import type { TaskResponse } from '@/types/response';

import ImageCarousel from '@/components/core/carousel/ImageCarousel.vue';
import ContentEmptyState from '@/components/core/ContentEmptyState.vue';
import H3Title from '@/components/core/title/H3Title.vue';

const props = defineProps<{
  projects: ProjectResponse[] | undefined;
  tasks: TaskResponse[] | undefined;
  singleColumn?: boolean;
  showEmptyState?: boolean;
}>();

const { t } = useI18n();

const projectsWithImages = computed(() => {
  return (
    props.projects?.filter(
      (project) => project.floorPlanUrls && project.floorPlanUrls.length > 0
    ) || []
  );
});

const projectTasksMap = computed(() => {
  const map: Record<string, TaskResponse[]> = {};
  (props.tasks || []).forEach((task) => {
    const projectId = task.projectId;
    if (!projectId) return;
    if (!map[projectId]) {
      map[projectId] = [];
    }
    map[projectId].push(task);
  });
  return map;
});
</script>

<style scoped>
.panel-container {
  background-color: transparent !important;
}
</style>
