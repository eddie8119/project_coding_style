<template>
  <ChartPanelLayout
    :title="panelTitle"
    :has-data="hasData"
    :empty-message="t('message.material.empty')"
    :chart-height-class="'h-[250px]'"
  >
    <template #chart>
      <div ref="chartRef" class="h-full" />
    </template>

    <div class="text-color-difference flex flex-col justify-center text-center">
      <Label :label="t('label.total')" class-name="text-base font-semibold text-center" />
      <p class="text-brand-color-difference text-2xl font-bold">$ {{ formattedTotalAmount }}</p>
    </div>
  </ChartPanelLayout>
</template>

<script setup lang="ts">
import { PieChart } from 'echarts/charts';
import { LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Ref } from 'vue';

import ChartPanelLayout from '@/components/app-layout/ChartPanelLayout.vue';
import Label from '@/components/core/title/Label.vue';
import { useEChart } from '@/composables/chart/useEChart';
import { useResponsiveWidth } from '@/composables/ui/useResponsiveWidth';
import { createPieChartOptions } from '@/config/chart/pieChartOptions';
import { invalidateClassColorCache } from '@/utils/style/getClassColor';

const props = defineProps<{
  title: string;
  usageData: { name: string; value: number }[];
  totalAmount: number;
}>();

echarts.use([TooltipComponent, LegendComponent, TitleComponent, PieChart, CanvasRenderer]);

const { t } = useI18n();
const chartRef = ref<HTMLElement | null>(null);
const isDarkMode = inject('isDarkMode', null);
const { isMobile, viewportWidth } = useResponsiveWidth();

const formattedTotalAmount = computed(() =>
  props.totalAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
);

const normalizedData = computed(() => props.usageData.filter((item) => item.value > 0));
const hasData = computed(() => normalizedData.value.length > 0);

const panelTitle = computed(() => props.title);

const pieChartOptions = computed(() => {
  void (isDarkMode as Ref<boolean> | null)?.value;
  const shouldStackLegend = isMobile.value || viewportWidth.value < 1024;
  const legendPosition = shouldStackLegend ? 'bottom' : 'left';
  return createPieChartOptions({
    title: panelTitle.value,
    legendData: normalizedData.value.map((item) => item.name),
    seriesData: normalizedData.value,
    legendPosition,
  });
});

useEChart({
  chartRef,
  getOptions: () => pieChartOptions.value,
  watchSources: [pieChartOptions, () => (isDarkMode as Ref<boolean> | null)?.value],
});

watch(
  () => (isDarkMode as Ref<boolean> | null)?.value,
  () => {
    invalidateClassColorCache();
  }
);
</script>
