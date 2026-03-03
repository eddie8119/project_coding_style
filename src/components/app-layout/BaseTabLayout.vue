<template>
  <div class="flex h-full min-w-0 flex-col">
    <!-- Header Section -->
    <div class="flex flex-col gap-2">
      <div class="flex flex-col">
        <H1Title :title="props.subject" />
        <p v-if="props.subtitle" class="text-color-difference">{{ props.subtitle }}</p>
      </div>
      <component :is="props.tabComponent" :subject="props.subject" :tabs-list="props.tabsList" />
    </div>

    <!-- Content Section -->
    <section class="min-w-0 flex-1 overflow-y-auto">
      <slot />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Tab } from '@/types/layout';

import H1Title from '@/components/core/title/H1Title.vue';

const props = defineProps<{
  subject: string;
  title?: string;
  subtitle?: string;
  tabsList: Tab[];
  tabComponent: unknown;
}>();
</script>

<style scoped></style>
