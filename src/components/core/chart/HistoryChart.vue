<template>
  <div ref="chartContainer" class="chart-container" />
</template>

<script setup lang="ts">
import { computed, nextTick, onActivated, onDeactivated, onMounted, ref, watch } from 'vue';

import type { MeasureHistory } from '@/types/measure';
import type { ECharts } from 'echarts';

import { createHistoryChartOption } from '@/config/chart/historyChartOptions';

const props = defineProps<{
  measureHistoryData: MeasureHistory[];
  unit: string;
  mainLabel: string;
}>();

const chartContainer = ref<HTMLElement | null>(null);
const chartInstance = ref<ECharts | null>(null);
const lastUpdateTime = ref<string>('');
const isChartReady = ref<boolean>(false);

let resizeObserver: ResizeObserver | null = null;

const resizeChart = () => {
  if (chartInstance.value && isChartReady.value) {
    try {
      chartInstance.value.resize();
    } catch (error) {
      console.warn('Chart resize failed:', error);
    }
  }
};

const setChartOption = () => {
  if (!chartInstance.value) return;

  // Sort data and insert nulls for time breaks
  const sortedData = Array.isArray(props.measureHistoryData) ? [...props.measureHistoryData] : [];

  const timeData: (string | null)[] = [];
  const unitData: (number | null)[] = [];
  const markAreaData: [{ name: string; xAxis: string }, { xAxis: string }][] = [];
  const timeThreshold = 5 * 60 * 1000; // 5-minute threshold for a break

  if (sortedData.length > 0) {
    // Always add the first data point
    const firstItem = sortedData[0];
    const firstDate = new Date(parseInt(firstItem.version));
    timeData.push(
      `${firstDate.getMonth() + 1}/${firstDate.getDate()} ${firstDate.getHours().toString().padStart(2, '0')}:${firstDate.getMinutes().toString().padStart(2, '0')}`
    );
    unitData.push(parseFloat(firstItem[props.unit as keyof MeasureHistory] as string));

    // Process the rest of the data to find breaks
    for (let i = 1; i < sortedData.length; i++) {
      const prevItem = sortedData[i - 1];
      const currentItem = sortedData[i];
      const prevTimestamp = parseInt(prevItem.version);
      const currentTimestamp = parseInt(currentItem.version);

      // If the gap is too large, insert a break and create a markArea
      if (currentTimestamp - prevTimestamp > timeThreshold) {
        const prevDate = new Date(prevTimestamp);
        const prevDateString = `${prevDate.getMonth() + 1}/${prevDate.getDate()} ${prevDate.getHours().toString().padStart(2, '0')}:${prevDate.getMinutes().toString().padStart(2, '0')}`;

        const currentDate = new Date(currentTimestamp);
        const currentDateString = `${currentDate.getMonth() + 1}/${currentDate.getDate()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

        markAreaData.push([{ name: 'N/A', xAxis: prevDateString }, { xAxis: currentDateString }]);

        timeData.push(null);
        unitData.push(null);
      }

      // Add the current data point
      const currentDate = new Date(currentTimestamp);
      timeData.push(
        `${currentDate.getMonth() + 1}/${currentDate.getDate()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`
      );
      unitData.push(parseFloat(currentItem[props.unit as keyof MeasureHistory] as string));
    }
  }

  const yMin = computed(() => {
    const validData = unitData.filter((d): d is number => d !== null);
    if (!validData.length) return 0;
    return Math.floor(Math.min(...validData) * 0.98); // 下緣留2%
  });
  const yMax = computed(() => {
    const validData = unitData.filter((d): d is number => d !== null);
    if (!validData.length) return 10;
    return Math.ceil(Math.max(...validData) * 1.02); // 上緣留2%
  });

  const option = createHistoryChartOption(
    {
      timeData,
      unitData,
      yMin: yMin.value,
      yMax: yMax.value,
      markAreaData,
    },
    props.unit
  );

  // 使用 notMerge: true 確保完全重新渲染圖表
  chartInstance.value.setOption(option, true);

  // 在設置選項後，明確重置 dataZoom 狀態
  // 但是沒發揮作用
  nextTick(() => {
    if (chartInstance.value) {
      chartInstance.value.dispatchAction({
        type: 'dataZoom',
        start: 0,
        end: 100,
        // xAxisIndex: 0
      });
    }
  });

  lastUpdateTime.value = new Date().toLocaleString();
};

const initChart = async () => {
  try {
    if (chartContainer.value && !chartInstance.value) {
      const echarts = await import('echarts');
      await nextTick();
      chartInstance.value = echarts.init(chartContainer.value);
      setChartOption();
      resizeObserver = new ResizeObserver(resizeChart);
      resizeObserver.observe(chartContainer.value);
      isChartReady.value = true;
    }
  } catch (error) {
    console.error('Chart initialization failed:', error);
    isChartReady.value = false;
  }
};

const cleanupChart = () => {
  if (resizeObserver && chartContainer.value) {
    resizeObserver.unobserve(chartContainer.value);
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (chartInstance.value) {
    try {
      chartInstance.value.dispose();
    } catch (error) {
      console.warn('Chart dispose failed:', error);
    } finally {
      chartInstance.value = null;
      isChartReady.value = false;
    }
  }
};

const windowWidth = computed(() => {
  return window.innerWidth;
});

watch(windowWidth, () => {
  if (isChartReady.value) {
    resizeChart();
  }
});

onMounted(async () => {
  await initChart();
});

onActivated(async () => {
  if (!chartInstance.value) {
    await initChart();
  }
});

onDeactivated(() => {
  cleanupChart();
});

// Watch for data changes and update the chart
watch(
  () => props.measureHistoryData,
  () => {
    if (isChartReady.value) {
      setChartOption();
    }
  },
  { deep: true }
);

onDeactivated(() => {
  // Clean up observer and event listener
  if (resizeObserver && chartContainer.value) {
    resizeObserver.unobserve(chartContainer.value);
  }
  resizeObserver?.disconnect();

  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
  min-height: 300px;
}
</style>
