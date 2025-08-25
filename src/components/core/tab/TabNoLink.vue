<template>
  <div class="scrollbar-hide overflow-x-auto">
    <div class="flex min-w-max border-b">
      <div
        v-for="(tab, index) in tabsList"
        :key="tab.name"
        class="whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors md:px-4"
        :class="[
          index === props.modelValue
            ? 'router-link-active rounded-t-lg border-brand-primary font-medium'
            : 'hover:border-brand-primary/30 border-transparent text-black-400 hover:text-brand-primary',
        ]"
        @click="emit('update:modelValue', index)"
      >
        {{ tab.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Tab } from '@/types/layout';

const { t } = useI18n();

const props = defineProps<{
  tabsList: Tab[];
  modelValue: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const tabsList = computed(() => {
  return props.tabsList.map((tab) => ({
    ...tab,
    label: t(`tab.${tab.name}`),
  }));
});
</script>

<style scoped></style>
