<template>
  <div class="panel-container">
    <div class="relative flex items-center">
      <ShowUpdateTime :last-update-time="lastUpdateTime" />
    </div>
    <div class="mt-14">
      <GaugeChart :gauge-props="gaugeData" :main-unit="measureUnit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type { ObservationType } from '@/types/device';
import type { LatestMeasure } from '@/types/measure';
import type { WsData } from '@/types/websocket';

import GaugeChart from '@/components/core/chart/gauge/GaugeChart.vue';
import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { getMainMeasureUnit, getUnitBound } from '@/utils/labelConvert';

const props = defineProps<{
  deviceMeasurementData: WsData | undefined;
  deviceLatestMeasureData: LatestMeasure | undefined;
  observationType: ObservationType;
}>();

const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

const unitBound = computed(() => getUnitBound(props.observationType));
const measureUnit = computed(() => getMainMeasureUnit(props.observationType));

const gaugeData = ref({
  low_bound: unitBound.value.low,
  high_bound: unitBound.value.high,
});

watch(
  () => props.deviceLatestMeasureData,
  (newVal) => {
    if (!newVal) return;
    gaugeData.value = {
      ...newVal,
      low_bound: unitBound.value.low,
      high_bound: unitBound.value.high,
    };
    updateLastUpdateTime();
  }
);

watch(
  () => props.deviceMeasurementData,
  (newVal) => {
    if (!newVal) return;
    gaugeData.value = {
      ...newVal,
      low_bound: unitBound.value.low,
      high_bound: unitBound.value.high,
    };
    updateLastUpdateTime();
  }
);
</script>

<style scoped></style>
