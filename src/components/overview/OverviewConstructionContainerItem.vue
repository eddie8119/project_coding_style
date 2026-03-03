<template>
  <div class="construction-container rounded-lg p-3" style="overflow: visible">
    <!-- Header -->
    <div class="md:mb-2">
      <Label :label="constructionName" :class-name="'!mb-0 md:mb-2'" />
    </div>
    <!-- Content wrapped by CollapsibleSection for responsive collapse -->
    <CollapsibleSection
      :show-toggle="totalTasks > 0 && isMobile"
      :default-collapsed="isMobile"
      :expand-text="t('button.fold.expand_all')"
      :collapse-text="t('button.fold.collapse_all')"
      :items-count="totalTasks"
    >
      <div class="space-y-4">
        <!-- Task groups -->
        <section
          v-for="(group, index) in groupedByProject"
          :key="group.projectId"
          :class="{ 'border-divider-color-difference border-t pt-3': index !== 0 }"
        >
          <!-- Group header -->
          <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-100">
            -- {{ group.projectTitle }} --
          </h3>

          <CollapsibleSection
            :show-toggle="group.tasks.length > 0"
            :expand-text="t('button.fold.expand') + t('label.task.task')"
            :collapse-text="t('button.fold.collapse') + t('label.task.task')"
            :items-count="group.tasks.length"
          >
            <div class="space-y-4">
              <TaskCardBase
                v-for="task in group.tasks"
                :key="task.id"
                :task="task"
                :read-only="true"
                :show-router="true"
              />
            </div>
          </CollapsibleSection>
        </section>

        <!-- Empty state -->
        <div v-if="displayTasks.length === 0" class="flex justify-center text-gray-300">
          <ElIcon :size="32">
            <DocumentRemove />
          </ElIcon>
        </div>
      </div>
    </CollapsibleSection>
  </div>
</template>

<script setup lang="ts">
import { DocumentRemove } from '@element-plus/icons-vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';

import Label from '@/components/core/title/Label.vue';
import TaskCardBase from '@/components/task/TaskCardBase.vue';
import CollapsibleSection from '@/components/ui/CollapsibleSection.vue';
import { useResponsiveWidth } from '@/composables/ui/useResponsiveWidth';

const props = defineProps<{
  constructionId: string;
  constructionName: string;
  daysRange?: [number, number];
  readOnly?: boolean;
  tasks?: TaskResponse[];
  projectTitleList?: Array<{ id: string; title: string }>;
}>();

const { t } = useI18n();
const { isMobile } = useResponsiveWidth();

const displayTasks = computed<TaskResponse[]>(() => props.tasks ?? []);
const totalTasks = computed<number>(() => displayTasks.value.length);

type ProjectGroup = { projectId: string; projectTitle: string; tasks: TaskResponse[] };

// 分群
const groupedByProject = computed<ProjectGroup[]>(() => {
  const byId = new Map<string, ProjectGroup>();
  const titleMap = new Map((props.projectTitleList ?? []).map((p) => [p.id, p.title]));

  for (const t of displayTasks.value) {
    const pid = t.projectId;
    if (!pid) continue;
    let group = byId.get(pid);
    if (!group) {
      group = { projectId: pid, projectTitle: titleMap.get(pid) ?? pid, tasks: [] };
      byId.set(pid, group);
    }
    group.tasks.push(t);
  }

  return Array.from(byId.values());
});
</script>
