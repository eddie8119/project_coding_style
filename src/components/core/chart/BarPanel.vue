<template>
  <ChartPanelLayout
    class="h-full"
    :title="seriesLabel"
    :has-data="barChartData.names.length > 0"
    :empty-message="t('message.material.empty')"
    :chart-height-class="'flex-1 h-full min-h-[320px]'"
    :fill-parent="true"
  >
    <template #chart>
      <div ref="barChartRef" class="h-full" />
    </template>
  </ChartPanelLayout>
</template>

<script setup lang="ts">
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { computed, inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MaterialGroup } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';
import type { EChartsOption } from 'echarts';
import type { BarSeriesOption } from 'echarts/charts';
import type { Ref } from 'vue';

const props = defineProps<{
  barChartData: { names: string[]; values: number[] };
  seriesLabel: string;
  constructionContainer: ConstructionSelection[] | null;
  groupedMaterials: MaterialGroup[];
}>();

import ChartPanelLayout from '@/components/app-layout/ChartPanelLayout.vue';
import { useEChart } from '@/composables/chart/useEChart';
import { createBaseHorizontalBarChartOptions } from '@/config/chart/barChartOptions';
import { invalidateClassColorCache } from '@/utils/style/getClassColor';

echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

const { t } = useI18n();
const barChartRef = ref<HTMLElement | null>(null);
const isDarkMode = inject('isDarkMode', null);

const barChartOptions = computed<EChartsOption>(() => {
  void (isDarkMode as Ref<boolean> | null)?.value;
  const baseOptions = createBaseHorizontalBarChartOptions();
  const baseSeries = (
    Array.isArray(baseOptions.series) ? baseOptions.series[0] : baseOptions.series
  ) as BarSeriesOption | undefined;

  // Reorder data to follow constructionContainer order and fill missing with 0
  const originalNames = props.barChartData.names ?? [];
  const originalValues = props.barChartData.values ?? [];
  const valueByName = new Map<string, number>();
  for (let i = 0; i < originalNames.length; i++) {
    valueByName.set(originalNames[i], Number(originalValues[i] ?? 0));
  }
  const planningTotalByName = new Map<string, number>();
  for (const group of props.groupedMaterials ?? []) {
    planningTotalByName.set(group.name, Number(group.planningTotalPrice ?? 0));
  }

  const orderedNames: string[] = [];
  const orderedValues: number[] = [];
  const orderedPlanningValues: number[] = [];
  if (props.constructionContainer && props.constructionContainer.length > 0) {
    for (const c of props.constructionContainer) {
      orderedNames.push(c.name);
      orderedValues.push(Number(valueByName.get(c.name) ?? 0));
      orderedPlanningValues.push(Number(planningTotalByName.get(c.name) ?? 0));
    }
  } else {
    orderedNames.push(...originalNames);
    orderedValues.push(...originalValues.map((v) => Number(v ?? 0)));
    orderedPlanningValues.push(
      ...originalNames.map((name) => Number(planningTotalByName.get(name) ?? 0))
    );
  }

  const customSeries: BarSeriesOption = {
    ...(baseSeries ?? {}),
    name: props.seriesLabel,
    type: 'bar',
    data: orderedValues,
    barWidth: 28,
    barGap: '20%',
    label: {
      ...(baseSeries?.label ?? {}),
      show: true,
      position: 'top',
      formatter: ({ value }) => {
        const numericValue = typeof value === 'number' ? value : Number(value ?? Number.NaN);
        return Number.isFinite(numericValue) ? `$${numericValue.toLocaleString()}` : '';
      },
    },
  };

  const planningSeries: BarSeriesOption = {
    ...(baseSeries ?? {}),
    name: t('label.material.planning_total_price'),
    type: 'bar',
    data: orderedPlanningValues,
    barWidth: 28,
    barGap: '20%',
    itemStyle: {
      ...(baseSeries?.itemStyle ?? {}),
      color: '#99C24D',
    },
    label: {
      ...(baseSeries?.label ?? {}),
      show: true,
      position: 'top',
      formatter: ({ value }) => {
        const numericValue = typeof value === 'number' ? value : Number(value ?? Number.NaN);
        return Number.isFinite(numericValue) ? `$${numericValue.toLocaleString()}` : '';
      },
    },
  };

  return {
    ...baseOptions,
    grid: {
      ...(baseOptions.grid as object),
      left: '4%',
      right: '4%',
      bottom: '12%',
      containLabel: true,
    },
    xAxis: {
      ...(baseOptions.xAxis as object),
      type: 'category',
      data: orderedNames,
      axisLabel: {
        ...((baseOptions.xAxis as { axisLabel?: object })?.axisLabel ?? {}),
        interval: 0,
        rotate: 45,
      },
    },
    yAxis: {
      ...(baseOptions.xAxis as object),
      type: 'value',
    },
    legend: {
      ...(baseOptions.legend as object),
      show: true,
      top: 0,
    },
    series: [customSeries, planningSeries],
  } as EChartsOption;
});

useEChart({
  chartRef: barChartRef,
  getOptions: () => barChartOptions.value,
  watchSources: [barChartOptions, () => (isDarkMode as Ref<boolean> | null)?.value],
});

watch(
  () => (isDarkMode as Ref<boolean> | null)?.value,
  () => {
    invalidateClassColorCache();
  }
);
</script>
