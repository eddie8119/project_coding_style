<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <div ref="lineDom" class="relative mx-auto h-[30rem] w-full py-3 sm:p-2" />
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import * as echarts from 'echarts';
import { storeToRefs } from 'pinia';
import { inject, onMounted, ref, watch } from 'vue';

import { useTagStore } from '@/stores/tag';

const FONT_SIZE = 16;

let chart = null;

const props = defineProps({
  yAxis: { type: String, required: true, default: '' },
  dataType: { type: String, required: true },
  dataSource: { type: Array, required: false },
});

const tagStore = useTagStore();
const { tags, getTagById } = storeToRefs(tagStore);

const idsInEntity = inject('idsInEntity');
const width = useWindowSize().width;
const lineDom = ref(null);

const transformData = (data) => {
  return data.reduce((acc, datum) => {
    acc.push({
      ID: datum.ID,
      [props.yAxis]: datum[props.yAxis],
      version: parseInt(datum.version),
    });
    return acc;
  }, []);
};

const transforms = idsInEntity.value.reduce((acc, id) => {
  acc.push({
    transform: {
      type: 'filter',
      config: { dimension: 'ID', value: id + props.dataType },
    },
  });
  return acc;
}, []);

const createDataset = (source) => {
  const dataset = [{ source: [...transformData(source)] }];
  if (source.length !== 0) {
    dataset.push(...transforms);
  }
  return dataset;
};

const createSeries = () => {
  return idsInEntity.value.reduce((acc, id, index) => {
    acc.push({
      type: 'line',
      name: getTagById.value(id),
      // name: id,
      encode: { x: 'version', y: props.yAxis },
      datasetIndex: index + 1,
      showSymbol: false,
    });
    return acc;
  }, []);
};

const option = {
  legend: {
    textStyle: {
      fontSize: FONT_SIZE,
    },
  },
  tooltip: { trigger: 'axis' },
  dataset: createDataset(props.dataSource),
  xAxis: {
    name: 'Time',
    nameLocation: 'middle',
    nameTextStyle: {
      lineHeight: 54,
      fontSize: FONT_SIZE,
    },
    axisLabel: {
      fontSize: FONT_SIZE,
    },
    type: 'time',
    min: function (value) {
      return value.min || Date.now() - 1000 * 60 * 60 * 3;
    },
    max: function (value) {
      return value.max || Date.now();
    },
  },
  yAxis: {
    name: props.yAxis,
    nameLocation: 'middle',
    nameTextStyle: {
      lineHeight: 54,
      fontSize: FONT_SIZE,
    },
    axisLine: {
      show: true,
      onZero: false,
    },
    axisLabel: {
      fontSize: FONT_SIZE,
    },
    type: 'value',
    min: function (value) {
      return Math.floor(value.min);
    },
    max: function (value) {
      return Math.ceil(value.max);
    },
  },
  series: createSeries(),
};

watch(width, () => {
  chart.resize();
});

const updateOption = () => {
  option.yAxis.name = props.yAxis;
  option.series = createSeries();
  const transformedData = transformData(props.dataSource);
  option.dataset = createDataset(transformedData);
};

watch(
  () => props.dataSource,
  (data) => {
    if (data.length === 1) {
      // use for websocket data
    } else {
      updateOption();
      chart.setOption(option, { notMerge: true });
    }
  }
);

onMounted(() => {
  if (lineDom.value) {
    chart = echarts.init(lineDom.value, { render: 'svg' });
    chart.setOption(option);
  }
});
</script>

<style scoped></style> -->
