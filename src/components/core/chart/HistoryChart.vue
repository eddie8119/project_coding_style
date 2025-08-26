<template>
  <div ref="chartContainer" class="chart-container" />
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import { ref, onMounted, onActivated, onDeactivated, watch, computed, nextTick } from 'vue';

import type { MeasureHistory } from '@/types/measure';

const chartContainer = ref<HTMLElement | null>(null);
const chartInstance = ref<echarts.ECharts | null>(null);
const lastUpdateTime = ref<string>('');
const isChartReady = ref<boolean>(false);

const props = defineProps<{
  measureHistoryData: MeasureHistory[];
  unit: string;
  mainLabel: string;
}>();

const resizeChart = () => {
  if (chartInstance.value && isChartReady.value) {
    try {
      chartInstance.value.resize();
    } catch (error) {
      console.warn('Chart resize failed:', error);
    }
  }
};

let resizeObserver: ResizeObserver | null = null;

async function initChart() {
  try {
    if (chartContainer.value && !chartInstance.value) {
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
}

function cleanupChart() {
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
}

const windowWidth = computed(() => {
  return window.innerWidth;
});

watch(windowWidth, () => {
  if (isChartReady.value) {
    resizeChart();
  }
});

onMounted(() => {
  initChart();
});

onActivated(() => {
  if (!chartInstance.value) {
    initChart();
  }
});

onDeactivated(() => {
  cleanupChart();
});

function setChartOption() {
  if (!chartInstance.value) return;

  // props.measureHistoryData 不是一個陣列（可能是 undefined 或 null），所以不能用 ...props.measureHistor
  // 防呆：確保 measureHistoryData 是陣列
  const data = Array.isArray(props.measureHistoryData) ? props.measureHistoryData : [];

  // Create a sorted copy to avoid mutating the prop and ensure the line chart is drawn correctly.
  const sortedData = [...data].sort((a, b) => parseInt(a.version) - parseInt(b.version));

  const timeData = sortedData.map((item: MeasureHistory) => {
    const date = new Date(parseInt(item.version));
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  });

  const unitData = sortedData.map((item: MeasureHistory) =>
    parseFloat(item[props.unit as keyof MeasureHistory] as string)
  );

  const yMin = computed(() => {
    if (!unitData.length) return 0;
    return Math.floor(Math.min(...unitData) * 0.98); // 下緣留2%
  });
  const yMax = computed(() => {
    if (!unitData.length) return 10;
    return Math.ceil(Math.max(...unitData) * 1.02); // 上緣留2%
  });

  const baseOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { animation: false },
    },
    toolbox: {
      feature: {
        dataZoom: { show: false },
        restore: {},
        saveAsImage: {},
      },
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
    },
  };

  const option = {
    ...baseOption,
    legend: {
      data: [props.unit],
      left: 10,
    },
    dataZoom: [
      { show: true, realtime: true, start: 0, end: 100, xAxisIndex: 0 },
      { type: 'inside', realtime: true, start: 0, end: 100, xAxisIndex: 0 },
    ],
    grid: {
      left: 60,
      right: 50,
      bottom: 80,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: { onZero: true },
        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 12,
          formatter: function (value: string, index: number) {
            const total = timeData.length;
            // 只顯示 15 個標籤
            const showEvery = Math.ceil(total / 15);
            if (index % showEvery === 0) {
              return value; // 或 value.split(' ')[1] 只顯示時間
            }
            return '';
          },
        },
        data: timeData,
      },
    ],
    yAxis: [
      {
        name: props.unit,
        type: 'value',
        max: yMax.value,
        min: yMin.value,
      },
    ],
    series: [
      {
        name: props.unit,
        type: 'line',
        // smooth: true,
        symbol: 'none',
        // sampling: 'lttb',
        data: unitData,
        lineStyle: {
          width: 1,
          color: '#0050be',
        },
        itemStyle: {
          color: '#0050be',
        },
        markPoint: {
          data: [
            { type: 'max', name: '最高點', itemStyle: { color: '#0050be' } },
            {
              type: 'min',
              name: '最低點',
              itemStyle: { color: '#0050be' },
              symbolRotate: 180,
            },
          ],
        },
        markLine: {
          data: [
            { type: 'max', name: '最高點', itemStyle: { color: '5dd65c' } },
            {
              type: 'min',
              name: '最低點',
              itemStyle: { color: '#0050be' },
              symbolRotate: 180,
            },
          ],
        },
      },
    ],
  };

  chartInstance.value.setOption(option, true);
  lastUpdateTime.value = new Date().toLocaleString();
}

// Watch for data changes and update the chart
watch(
  () => props.measureHistoryData,
  () => {
    setChartOption();
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
