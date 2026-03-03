import * as echarts from 'echarts/core';
import { nextTick, onBeforeUnmount, onMounted, type Ref, watch, type WatchSource } from 'vue';

import type { EChartsOption } from 'echarts';

export interface UseEChartParams {
  chartRef: Ref<HTMLElement | null>;
  getOptions: () => EChartsOption;
  watchSources?: WatchSource | WatchSource[];
}

export interface UseEChartReturn {
  ensureChartInstance: () => echarts.ECharts | null;
  renderChart: () => void;
  resizeChart: () => void;
  disposeChart: () => void;
}

const hasRenderableSize = (el: HTMLElement | null) => {
  if (!el) return false;
  const { width, height } = el.getBoundingClientRect();
  return width > 0 && height > 0;
};

export function useEChart({
  chartRef,
  getOptions,
  watchSources,
}: UseEChartParams): UseEChartReturn {
  let chartInstance: echarts.ECharts | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const ensureChartInstance = () => {
    if (chartInstance || !chartRef.value || !hasRenderableSize(chartRef.value))
      return chartInstance;
    chartInstance = echarts.init(chartRef.value);
    return chartInstance;
  };

  const renderChart = () => {
    const instance = ensureChartInstance();
    instance?.setOption(getOptions(), true);
  };

  const resizeChart = () => {
    chartInstance?.resize();
  };

  const disposeChart = () => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    chartInstance?.dispose();
    chartInstance = null;
  };

  onMounted(() => {
    nextTick().then(() => {
      renderChart();
      resizeChart();
    });

    window.addEventListener('resize', resizeChart);

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        renderChart();
        resizeChart();
      });
      if (chartRef.value) resizeObserver.observe(chartRef.value);
    }
  });

  const sources = Array.isArray(watchSources) ? watchSources : watchSources ? [watchSources] : [];
  if (sources.length) {
    watch(
      sources,
      () => {
        nextTick().then(() => renderChart());
      },
      { immediate: true, deep: true }
    );
  }

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart);
    disposeChart();
  });

  return { ensureChartInstance, renderChart, resizeChart, disposeChart };
}
