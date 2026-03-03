<template>
  <div class="chart-panel-container w-full border border-white/10">
    <Label :label="title" class-name="text-lg text-center block" />

    <div class="flex flex-col" :class="chartHeightClass">
      <slot v-if="hasData" name="chart" />
      <div v-else class="flex h-full w-full items-center justify-center">
        <EmptyStatePlaceholder :message="emptyMessage" />
      </div>
    </div>

    <div v-if="$slots.default">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import EmptyStatePlaceholder from '@/components/core/EmptyStatePlaceholder.vue';
import Label from '@/components/core/title/Label.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    hasData: boolean;
    emptyMessage?: string;
    chartHeightClass?: string;
  }>(),
  {
    chartHeightClass: 'h-[260px]',
  }
);

const { t } = useI18n();

const emptyMessage = computed(() => props.emptyMessage ?? t('message.material.empty'));
const chartHeightClass = computed(() => props.chartHeightClass);
</script>

<style scoped>
.chart-panel-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
