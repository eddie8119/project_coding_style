<template>
  <div class="scrollbar-hide overflow-x-auto">
    <div class="flex min-w-max border-b">
      <router-link
        v-for="tab in props.tabsList"
        :key="tab.name"
        :to="tab.name"
        class="whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors md:px-4"
        :class="[
          route.path.endsWith(tab.name)
            ? 'rounded-t-lg border-brand-primary font-medium'
            : 'hover:border-brand-primary/30 border-transparent text-black-400 hover:text-brand-primary',
        ]"
      >
        {{ t(`tab.${tab.name}`) }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import type { Tab } from '@/types/layout';

const { t } = useI18n();
const route = useRoute();
const props = defineProps<{
  subject: string;
  tabsList: Tab[];
}>();
</script>

<style scoped></style>
