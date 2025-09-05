<template>
  <div ref="gauge" class="aspect-[6/4] w-full" />
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  gaugeProps: {
    type: Object,
    required: true,
  },
  mainUnit: {
    type: String,
    required: true,
  },
});

const gauge = ref(); // for div ref
const chart = ref(); // to save GaugeChart instance
const option = ref({});
const width = useWindowSize().width;

const updateChart = () => {
  option.value = {
    series: [
      {
        type: 'gauge',
        max: props.gaugeProps.high_bound,
        min: props.gaugeProps.low_bound,
        radius: '90%',
        splitNumber: props.gaugeProps.high_bound,
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '60%'],
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [props.gaugeProps.low_alarm || 3 / props.gaugeProps.high_bound, '#0050be'],
              [props.gaugeProps.high_alarm || 10 / props.gaugeProps.high_bound, '#0050be'],
              [1, '#0050be'],
            ],
          },
        },
        pointer: {
          show: true,
          length: '90%',
          width: 3,
          itemStyle: {
            color: '#303133',
            borderColor: '#303133',
            borderWidth: 1,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 8,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          },
          z: 0,
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 18,
          itemStyle: {
            color: '#303133',
            borderColor: '#303133',
            borderWidth: 2,
            shadowColor: 'rgba(0,0,0,0.3)',
            shadowBlur: 8,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          color: '#0050be',
          fontSize: '1.2rem',
          distance: -70,
          formatter: function (value: number) {
            const arr = [
              props.gaugeProps.low_bound,
              props.gaugeProps.low_alarm,
              props.gaugeProps.high_alarm,
              props.gaugeProps.high_bound,
            ];
            if (arr.includes(value)) return value;
          },
        },
        detail: {
          valueAnimation: false,
          offsetCenter: [0, '25%'],
          formatter: `${props.mainUnit} {value}`,
          color: 'inherit',
          fontSize: '1.2rem',
          z: 100,
        },
        data: [
          {
            value: props.gaugeProps[props.mainUnit.toLowerCase()],
          },
        ],
      },
    ],
  };

  if (chart.value) {
    chart.value.setOption(option.value);
  }
};

onMounted(async () => {
  if (gauge.value) {
    const echarts = await import('echarts');
    chart.value = echarts.init(gauge.value);
    updateChart();
  }
});

watch(
  () => props.gaugeProps,
  () => {
    updateChart();
  },
  { deep: true }
);

watch(
  () => props.gaugeProps,
  () => {
    if (chart.value) {
      updateChart();
    }
  },
  { deep: true }
);

watch(width, () => {
  if (chart.value) {
    chart.value.resize();
  }
});
</script>
