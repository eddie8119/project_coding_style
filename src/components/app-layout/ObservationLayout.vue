<template>
  <div class="flex h-full flex-col">
    <!-- Header Section -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <H1Title :title="props.title ?? props.subject" />
        </div>
      </div>
      <TabObservation :subject="props.subject" :tabs-list="tabsList" />
    </div>

    <!-- Content Section -->
    <div class="flex-1 overflow-y-auto p-4">
      <router-view :key="$route.fullPath" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import TabObservation from '@/components/core/tab/TabObservation.vue';
import H1Title from '@/components/core/title/H1Title.vue';
import { devicesRemoteTabList, devicesTabList } from '@/constants/tab';

const props = defineProps<{
  subject: string;
  title?: string;
}>();

const route = useRoute();

const tabsList = computed(() => {
  const baseTabs =
    props.subject === 'sqm' || props.subject === 'mac'
      ? [...devicesRemoteTabList]
      : [...devicesTabList];

  if (route.params.id && props.subject !== 'sqm' && props.subject !== 'mac') {
    const devicesTabIndex = baseTabs.findIndex((tab) => tab.name === 'devices');
    if (devicesTabIndex !== -1) {
      baseTabs.splice(devicesTabIndex + 1, 0, {
        label: 'Device',
        name: 'device',
      });
    }
  }

  return baseTabs;
});
</script>

<style scoped></style>
