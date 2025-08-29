<template>
  <div
    class="device-card grid h-[240px] w-full min-w-0 grid-cols-3 items-center justify-center gap-4 text-center lg:h-[296px]"
  >
    <div v-for="item in displayItems" :key="item.label" class="min-w-0">
      <H3Title :title="item.label" />
      <p class="text-4xl font-bold tracking-tight text-brand-primary">{{ item.value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type {
  FlourideLatestCalibration,
  LatestCalibration,
  NH3NLatestCalibration,
  PhLatestCalibration,
} from '@/types/calibration';
import type {
  FlourideLatestMeasure,
  LatestMeasure,
  NH3NLatestMeasure,
  ORPLatestMeasure,
  PhLatestMeasure,
} from '@/types/measure';
import type { FlourideWsData, Nh3nWsData, OrpWsData, PhWsData, WsData } from '@/types/websocket';

import H3Title from '@/components/core/title/H3Title.vue';
import { ObservationType } from '@/types/device';
import { Measurement } from '@/types/measure';
import { getMeasureList } from '@/utils/labelConvert';

const props = withDefaults(
  defineProps<{
    deviceRealMeasurementData?: WsData;
    deviceLatestCalibrationData?: LatestCalibration;
    deviceLatestMeasureData?: LatestMeasure;
    observationType: ObservationType;
  }>(),
  {
    deviceRealMeasurementData: undefined,
    deviceLatestCalibrationData: undefined,
    deviceLatestMeasureData: undefined,
  }
);

const { t } = useI18n();

// 測量列表
const measureLists = computed(() => {
  return getMeasureList(props.observationType as ObservationType);
});

// 值提取器映射 - 將複雜的邏輯分離到獨立函數
const valueExtractors = {
  [Measurement.PH]: () => {
    if (props.observationType !== ObservationType.PH) return 'N/A';
    return (
      (props.deviceRealMeasurementData as PhWsData)?.ph ??
      (props.deviceLatestMeasureData as PhLatestMeasure)?.ph ??
      'N/A'
    );
  },

  [Measurement.ELEC]: () => {
    const isValidType = [ObservationType.PH, ObservationType.ORP].includes(props.observationType);
    if (!isValidType) return 'N/A';

    return (
      (props.deviceRealMeasurementData as PhWsData | OrpWsData)?.mv ??
      (props.deviceLatestMeasureData as PhLatestMeasure | ORPLatestMeasure)?.mv ??
      'N/A'
    );
  },

  [Measurement.TEMP]: () => {
    if (props.observationType !== ObservationType.PH) return 'N/A';

    const realTemp = (props.deviceRealMeasurementData as PhWsData)?.temperature;
    const latestTemp = (props.deviceLatestMeasureData as PhLatestMeasure)?.temperature;

    const temp = realTemp ?? latestTemp;
    return typeof temp === 'number' ? `${temp}°C` : 'N/A';
  },

  [Measurement.PPM]: () => {
    const isValidType = [ObservationType.NH3N, ObservationType.FLOURIDE].includes(
      props.observationType
    );
    if (!isValidType) return 'N/A';

    return (
      (props.deviceRealMeasurementData as Nh3nWsData | FlourideWsData)?.ppm ??
      (props.deviceLatestMeasureData as NH3NLatestMeasure | FlourideLatestMeasure)?.ppm ??
      'N/A'
    );
  },

  [Measurement.ZERO]: () => {
    if (props.observationType !== ObservationType.PH) return 'N/A';
    return (props.deviceLatestCalibrationData as PhLatestCalibration)?.zero ?? 'N/A';
  },

  [Measurement.SLOPE]: () => {
    if (props.observationType !== ObservationType.PH) return 'N/A';
    return (props.deviceLatestCalibrationData as PhLatestCalibration)?.slope ?? 'N/A';
  },

  [Measurement.SENSITIVITY]: () => {
    const isValidType = [ObservationType.NH3N, ObservationType.FLOURIDE].includes(
      props.observationType
    );
    if (!isValidType) return 'N/A';
    return (
      (props.deviceLatestCalibrationData as NH3NLatestCalibration | FlourideLatestCalibration)
        ?.sensitivity ?? 'N/A'
    );
  },
} as const;

// 獲取測量值的通用函數
const getMeasurementValue = (measurementType: string): string | number => {
  const extractor = valueExtractors[measurementType as keyof typeof valueExtractors];
  return extractor ? extractor() : 'N/A';
};

const displayItems = computed(() => {
  return measureLists.value.map((item) => ({
    label: t(`device.measurement.${item.label}`),
    value: getMeasurementValue(item.label),
  }));
});

// 原本寫成watch 但應該要 computed
// watch 是命令式的。您需要手動去「監視」一個數據源 watch is best used for "side effects," like making an API call when a value changes.
</script>

<style scoped>
.device-card {
  @apply rounded-xl bg-primary-purple p-4 dark:bg-black-500;
}
</style>
