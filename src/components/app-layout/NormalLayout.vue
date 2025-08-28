<template>
  <div class="flex h-full flex-col">
    <!-- Header Section -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <H1Title :title="props.title ?? props.subject" />
        </div>
      </div>
      <Tab :subject="props.subject" :tabs-list="tabsList" />
    </div>

    <!-- Content Section -->
    <div class="flex-1 overflow-y-auto p-4">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Tab as TabType } from '@/types/layout';

import Tab from '@/components/core/tab/Tab.vue';
import H1Title from '@/components/core/title/H1Title.vue';
import { scoutTabList, userTabList } from '@/constants/tab';

const props = defineProps<{
  subject: string;
  title?: string;
}>();

// switch 語句在未來擴展時會變得很臃腫，可以改用一個物件映射來處理。
const tabListMap: Record<string, TabType[]> = {
  user: userTabList,
  scout: scoutTabList,
};

const tabsList = computed(() => tabListMap[props.subject] ?? []);
</script>

<style scoped></style>
