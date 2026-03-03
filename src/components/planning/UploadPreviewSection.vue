<template>
  <section v-if="props.dummyGanttProject" class="panel-container w-full gap-4 space-y-2 p-4">
    <div class="relative flex items-center">
      <H2Title :title="t('label.planning.upload_preview')" class-name="block w-full text-center" />

      <HideButton
        class="toggle-button absolute right-0 shrink-0 gap-1"
        :label="showUploadResult ? t('button.upload_result.hide') : t('button.upload_result.show')"
        :is-open="showUploadResult"
        @click="toggleResult"
      />
    </div>
    <GanttChart
      v-if="showUploadResult"
      :project="props.dummyGanttProject"
      :onsite-task="onsiteTasks"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { GanttProject } from '@/types/gantt';
import type { TaskResponse } from '@/types/response';

import HideButton from '@/components/core/button/HideButton.vue';
import H2Title from '@/components/core/title/H2Title.vue';
import GanttChart from '@/components/gant/GanttChart.vue';

const props = defineProps<{
  dummyGanttProject: GanttProject | null;
  dummyOnsiteTasks: TaskResponse[] | null | undefined;
}>();

const { t } = useI18n();
const showUploadResult = ref(true);
const onsiteTasks = computed<TaskResponse[] | undefined>(() => props.dummyOnsiteTasks ?? undefined);

const toggleResult = () => {
  showUploadResult.value = !showUploadResult.value;
};
</script>
