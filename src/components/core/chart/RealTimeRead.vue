<template>
  <div class="panel-container">
    <div class="mb-2 flex items-center justify-between">
      <H3Title :title="t('title.subTitle.real_time_read')" />
    </div>
    <!-- <NoData v-if="localData.length === 0" /> -->
    <div ref="chartContainer" class="chart-container" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteUpdate } from 'vue-router';

import type { WsData } from '@/types/websocket';
import type { ECharts, EChartsOption } from 'echarts';

import H3Title from '@/components/core/title/H3Title.vue';
import { ObservationType } from '@/types/device';
import { getMainMeasureUnit, getUnitBound } from '@/utils/labelConvert';

const { t } = useI18n();

const props = defineProps<{
  deviceMeasurementData: WsData | undefined;
  observationType: ObservationType;
}>();

const chartContainer = ref<HTMLElement | null>(null);
const chartInstance = ref<ECharts | null>(null);
const localData = ref<WsData[]>([]);

watch(
  () => props.deviceMeasurementData,
  (newVal) => {
    if (!newVal) return;
    if (newVal) {
      localData.value.push(newVal);

      // 限制數據點數量，保持性能
      if (localData.value.length > MAX_DATA_POINTS) {
        localData.value.shift();
      }

      // 更新圖表
      setChartOption();
    }
  },
  { deep: true }
);

const resetChart = () => {
  localData.value = [];
  if (chartInstance.value) {
    // 使用新的空數據更新圖表，立即清空畫面
    setChartOption();
  }
};

// 當路由參數變化時 (例如 /device/1 -> /device/2)，在導航前清除舊圖表
onBeforeRouteUpdate(() => {
  resetChart();
});

// 當元件被快取且不再活動時 (例如離開 device 頁面)，清除圖表
onUnmounted(() => {
  resetChart();
});

// 限制數據點數量，避免性能問題
const MAX_DATA_POINTS = 60;

const timeData = computed(() =>
  localData.value.map((item: WsData) => {
    const date = new Date(Number(item.version));
    return `${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  })
);
const unitBound = computed(() => getUnitBound(props.observationType));
const measureUnit = computed(() => getMainMeasureUnit(props.observationType));
const wsMeasureData = computed(() =>
  localData.value.map((item: WsData) => item[measureUnit.value.toLowerCase() as keyof WsData])
);

const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
};

const setChartOption = () => {
  if (!chartInstance.value) return;
  const unitDisplayName = measureUnit.value;

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      formatter: function (params: any) {
        let result = `時間: ${params[0].axisValue}<br/>`;
        params.forEach((param: any) => {
          result += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
        });
        return result;
      },
    },
    legend: {
      data: [unitDisplayName],
      left: 10,
      textStyle: {
        fontSize: 12,
      },
    },
    grid: {
      left: 60,
      right: 60,
      bottom: 80,
      top: 60,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: { onZero: false },
        data: timeData.value,
        axisLabel: {
          rotate: 45,
          fontSize: 10,
          interval: 1, // Display every 10 seconds
        },
      },
    ],
    yAxis: [
      {
        name: unitDisplayName,
        type: 'value',
        position: 'left',
        ...unitBound.value,
        axisLabel: {
          formatter: '{value}',
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            opacity: 0.3,
          },
        },
      },
    ],
    series: [
      {
        name: unitDisplayName,
        type: 'line',
        symbolSize: 6,
        data: wsMeasureData.value,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#0050be',
        },
        itemStyle: {
          color: '#0050be',
        },
        areaStyle: {
          opacity: 0.1,
          color: '#0050be',
        },
        markPoint: {
          data:
            wsMeasureData.value.length > 0
              ? [
                  { type: 'max', name: '最高點' },
                  { type: 'min', name: '最低點', symbolRotate: 180 },
                ]
              : [],
        },
      },
    ],
  };

  chartInstance.value.setOption(option);
};

onMounted(async () => {
  if (chartContainer.value) {
    const echarts = await import('echarts');
    localData.value = [];
    chartInstance.value = echarts.init(chartContainer.value);
    setChartOption();

    // 監聽窗口大小變化
    window.addEventListener('resize', handleResize);
  }
});

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 350px;
  min-height: 350px;
  max-width: 100%;
}
</style>
