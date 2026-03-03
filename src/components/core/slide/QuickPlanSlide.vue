<template>
  <SlideBase :visible="isQuickPlanSlideVisible" @close="hideQuickPlanSlide">
    <div class="flex h-full flex-col gap-4">
      <Loading v-if="isLoadingProjects" />
      <PlansOverview
        v-else
        :projects="fetchedProjects"
        :tasks="fetchedAllTasks"
        :single-column="true"
        :show-empty-state="true"
      />
    </div>
  </SlideBase>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import Loading from '@/components/core/loading/Loading.vue';
import SlideBase from '@/components/core/slide/SlideBase.vue';
import PlansOverview from '@/components/plan/PlansOverview.vue';
import { useProjects } from '@/composables/query/useProjects';
import { useTasks } from '@/composables/query/useTasks';
import { useSlideStore } from '@/stores/useSlideStore';

const slideStore = useSlideStore();
const { isQuickPlanSlideVisible } = storeToRefs(slideStore);
const { hideQuickPlanSlide } = slideStore;

const { fetchedAllTasks } = useTasks();
const { fetchedProjects, isLoadingProjects } = useProjects();
</script>
