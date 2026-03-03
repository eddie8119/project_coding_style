<template>
  <ChartPanelLayout :title="title" :has-data="hasData" :empty-message="emptyMessage">
    <template #chart>
      <div class="flex h-full flex-col">
        <div v-if="hasVariants" class="flex shrink-0 justify-end">
          <PillTab
            :model-value="selectedVariantKey"
            :tabs="variantTabs"
            @update:model-value="selectedVariantKey = $event"
          />
        </div>
        <div ref="chartRef" class="flex-1" />
      </div>
    </template>
  </ChartPanelLayout>
</template>

<script setup lang="ts">
import { PieChart } from 'echarts/charts';
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, inject, nextTick, ref, watch } from 'vue';

import type { Ref } from 'vue';

import ChartPanelLayout from '@/components/app-layout/ChartPanelLayout.vue';
import PillTab from '@/components/core/tab/PillTab.vue';
import { useEChart } from '@/composables/chart/useEChart';
import { createPieChartOptions } from '@/config/chart/pieChartOptions';
import { invalidateClassColorCache } from '@/utils/style/getClassColor';

type PieVariant = {
  key: string;
  label: string;
  data: { name: string; value: number }[];
  total?: number;
};

const props = withDefaults(
  defineProps<{
    title: string;
    data?: { name: string; value: number }[];
    total?: number;
    emptyMessage?: string;
    showLegend?: boolean;
    variants?: PieVariant[];
  }>(),
  {
    data: () => [],
  }
);

echarts.use([TooltipComponent, LegendComponent, TitleComponent, PieChart, CanvasRenderer]);

const chartRef = ref<HTMLElement | null>(null);
const isDarkMode = inject('isDarkMode', null);

const hasVariants = computed(() => Boolean(props.variants?.length));
const selectedVariantKey = ref(props.variants?.[0]?.key ?? 'default');

watch(
  () => props.variants,
  (variants) => {
    if (!variants?.length) {
      selectedVariantKey.value = 'default';
      return;
    }
    if (!variants.some((v) => v.key === selectedVariantKey.value)) {
      selectedVariantKey.value = variants[0].key;
    }
  },
  { immediate: true }
);

const currentVariant = computed(() => {
  if (!hasVariants.value) return null;
  return (
    props.variants?.find((v) => v.key === selectedVariantKey.value) ?? props.variants?.[0] ?? null
  );
});

const variantTabs = computed(
  () => props.variants?.map(({ key, label }) => ({ value: key, label })) ?? []
);

const resolvedData = computed(() => {
  if (hasVariants.value) {
    return currentVariant.value?.data ?? [];
  }
  return props.data;
});

const normalizedData = computed(() => resolvedData.value.filter((item) => item.value > 0));
const hasData = computed(() => normalizedData.value.length > 0);

const pieChartOptions = computed(() => {
  void (isDarkMode as Ref<boolean> | null)?.value;
  return createPieChartOptions({
    title: props.title,
    legendData: normalizedData.value.map((item) => item.name),
    seriesData: normalizedData.value,
    showLegend: props.showLegend ?? false,
  });
});

const { renderChart, disposeChart } = useEChart({
  chartRef,
  getOptions: () => pieChartOptions.value,
  watchSources: [
    pieChartOptions,
    () => (isDarkMode as Ref<boolean> | null)?.value,
    selectedVariantKey,
  ],
});

watch(hasData, (canRender) => {
  if (!canRender) {
    disposeChart();
    return;
  }

  nextTick().then(() => renderChart());
});

watch(
  () => (isDarkMode as Ref<boolean> | null)?.value,
  () => {
    invalidateClassColorCache();
  }
);
</script>

<style scoped></style>
