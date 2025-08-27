<template>
  <div
    class="device-card grid h-[240px] w-full min-w-0 grid-cols-3 items-center justify-center gap-4 text-center lg:h-[296px]"
  >
    <div v-for="item in items" :key="item.label" class="min-w-0">
      <H3Title :title="item.label" />
      <p class="text-4xl font-bold tracking-tight text-brand-primary">{{ item.value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type {
  LatestCalibration,
  PhLatestCalibration,
  NH3NLatestCalibration,
  FlourideLatestCalibration,
} from '@/types/calibration';
import type {
  LatestMeasure,
  PhLatestMeasure,
  ORPLatestMeasure,
  NH3NLatestMeasure,
  FlourideLatestMeasure,
} from '@/types/measure';
import type { WsData, PhWsData, OrpWsData, Nh3nWsData, FlourideWsData } from '@/types/websocket';

import H3Title from '@/components/core/title/H3Title.vue';
import { useLabelConvert } from '@/composables/useLabelConvert';
import { ObservationType } from '@/types/device';
import { Measurement } from '@/types/measure';

const props = withDefaults(
  defineProps<{
    deviceRealMeasurementData?: WsData | undefined;
    deviceLatestCalibrationData?: LatestCalibration | undefined;
    deviceLatestMeasureData?: LatestMeasure | undefined;
    observationType: ObservationType;
  }>(),
  {
    deviceRealMeasurementData: undefined,
    deviceLatestCalibrationData: undefined,
    deviceLatestMeasureData: undefined,
  }
);

const { t } = useI18n();
const { getMeasureList } = useLabelConvert();

const measureLists = computed(() => {
  return getMeasureList(props.observationType as ObservationType);
});

// const safeValue = (...values: (string | number | undefined | null)[]): string => {
//   for (const value of values) {
//     if (value !== undefined && value !== null) return String(value);
//   }
//   return 'N/A';
// };

// Temperature formatting helper
// const formatTemperature = (temp: number | string | undefined | null): string => {
//   if (temp === undefined || temp === null) return 'N/A';
//   return `${temp}°C`;
// };

// Value extraction strategies for better maintainability
// const valueExtractors = {
//   [Measurement.PH]: () =>
//     safeValue(props.deviceRealMeasurementData?.ph, props.deviceLatestMeasureData?.ph),

//   [Measurement.ELEC]: () =>
//     safeValue(props.deviceRealMeasurementData?.mv, props.deviceLatestMeasureData?.mv),

//   [Measurement.TEMP]: () => {
//     const realTemp = props.deviceRealMeasurementData?.temperature;
//     const latestTemp = props.deviceLatestMeasureData?.temperature;

//     if (typeof realTemp === 'number') {
//       return formatTemperature(realTemp);
//     }
//     return formatTemperature(latestTemp);
//   },

//   [Measurement.ZERO]: () => safeValue(props.deviceLatestCalibrationData?.zero),

//   [Measurement.SLOPE]: () => safeValue(props.deviceLatestCalibrationData?.slope),

//   [Measurement.PPM]: () =>
//     safeValue(props.deviceRealMeasurementData?.ppm, props.deviceLatestMeasureData?.ppm),

//   [Measurement.SENSITIVITY]: () => safeValue(props.deviceLatestCalibrationData?.sensitivity),

//   [Measurement.OFFSET]: () => safeValue(props.deviceLatestCalibrationData?.offset),
// } as const;

// const items = computed(() => {
//   return measureLists.value.map((item) => {
//     const extractor = valueExtractors[item.label as keyof typeof valueExtractors];
//     const value = extractor();

//     return {
//       label: t(`device.measurement.${item.label}`),
//       value,
//     };
//   });
// });

const items = computed(() => {
  const calibrationData = props.deviceLatestCalibrationData;
  const realMeasurementData = props.deviceRealMeasurementData;
  const latestMeasureData = props.deviceLatestMeasureData;

  return measureLists.value.map((item) => {
    let value: string | number = 'N/A';

    switch (item.label) {
      case Measurement.PH:
        if (props.observationType === ObservationType.PH) {
          value =
            (realMeasurementData as PhWsData)?.ph ??
            (latestMeasureData as PhLatestMeasure)?.ph ??
            'N/A';
        }
        break;

      case Measurement.ELEC:
        if (
          props.observationType === ObservationType.PH ||
          props.observationType === ObservationType.ORP
        ) {
          value =
            (realMeasurementData as PhWsData | OrpWsData)?.mv ??
            (latestMeasureData as PhLatestMeasure | ORPLatestMeasure)?.mv ??
            'N/A';
        }
        break;

      case Measurement.TEMP:
        if (props.observationType === ObservationType.PH) {
          value =
            typeof (realMeasurementData as PhWsData)?.temperature === 'number'
              ? `${(realMeasurementData as PhWsData)?.temperature}°C`
              : typeof (latestMeasureData as PhLatestMeasure)?.temperature === 'number'
                ? `${(latestMeasureData as PhLatestMeasure)?.temperature}°C`
                : 'N/A';
        }
        break;

      case Measurement.PPM:
        if (
          props.observationType === ObservationType.NH3N ||
          props.observationType === ObservationType.FLOURIDE
        ) {
          value =
            (realMeasurementData as Nh3nWsData | FlourideWsData)?.ppm ??
            (latestMeasureData as NH3NLatestMeasure | FlourideLatestMeasure)?.ppm ??
            'N/A';
        }
        break;

      case Measurement.ZERO:
        if (props.observationType === ObservationType.PH) {
          value = calibrationData
            ? ((calibrationData as PhLatestCalibration).zero ?? 'N/A')
            : 'N/A';
        }

        break;

      case Measurement.SLOPE:
        if (props.observationType === ObservationType.PH) {
          value = calibrationData
            ? ((calibrationData as PhLatestCalibration).slope ?? 'N/A')
            : 'N/A';
        }

        break;

      case Measurement.SENSITIVITY:
        if (
          props.observationType === ObservationType.NH3N ||
          props.observationType === ObservationType.FLOURIDE
        ) {
          value = calibrationData
            ? ((calibrationData as NH3NLatestCalibration | FlourideLatestCalibration).sensitivity ??
              'N/A')
            : 'N/A';
        }

        break;

      default:
        value = 'N/A';
    }

    return {
      label: t(`device.measurement.${item.label}`),
      value,
    };
  });
});

// 原本寫成watch 但應該要 computed
// watch 是命令式的。您需要手動去「監視」一個數據源 watch is best used for "side effects," like making an API call when a value changes.
</script>

<style scoped>
.device-card {
  @apply rounded-xl bg-primary-purple p-4 dark:bg-black-500;
}
</style>
