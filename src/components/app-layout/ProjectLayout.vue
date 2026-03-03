<template>
  <BaseTabLayout
    :subject="props.subject"
    :subtitle="props.subtitle"
    :tabs-list="tabsList"
    :tab-component="TabProject"
  >
    <router-view :key="route.fullPath" />
  </BaseTabLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import type { Tab as TabType } from '@/types/layout';

import BaseTabLayout from '@/components/app-layout/BaseTabLayout.vue';
import TabProject from '@/components/core/tab/TabProject.vue';
import { PLANNING_TAB_LIST, TO_DO_TAB_LIST } from '@/constants/tab';

const props = defineProps<{
  subject: string;
  title?: string;
  subtitle?: string;
}>();

const route = useRoute();

const tabListMap: Record<string, TabType[]> = {
  planning: PLANNING_TAB_LIST,
  todo: TO_DO_TAB_LIST,
};

const tabsList = computed(() => {
  const firstSegment = route.path.split('/')[1];
  const sourceTabs = tabListMap[firstSegment] ?? [];
  const baseTabs = [...sourceTabs];

  if (route.params.id) {
    const devicesTabIndex = baseTabs.findIndex((tab) => tab.name === 'projects');
    if (devicesTabIndex !== -1) {
      baseTabs.splice(
        devicesTabIndex + 1,
        0,
        {
          name: 'project',
          requiresId: true,
        },
        {
          name: 'floor-plan',
          requiresId: true,
        }
      );
    }
  }

  return baseTabs;
});
</script>

<style scoped></style>
