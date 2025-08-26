<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <div class="mt-6 flex flex-col gap-6">
    <ProgressSpinner v-if="isLoading" />
    <template v-if="isReady">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <DBGaugeChart v-for="gauge in gaugeProps" :key="gauge.ID" :gauge-props="gauge" />
      </div>

      <div class="space-y-6">
        <CalibrationTable :latest-cali="latestCali" />
        <StatisticsTable :statistics="statistics" />
        <MeasureHistory :initial-measure-data="measureHistory" />
        <CalibrationHistory :initial-measure-data="calibrationHistory" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAsyncState } from '@vueuse/core';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import type { CaliData } from '@/types/calibration';
import type { StatisticsData } from '@/types/datainsight';
import type { Measure } from '@/types/measure';
import type { Device } from '@/types/device';
import type { GaugeProps } from '@/types/record';

import DBGaugeChart from '@/components/core/chart/gauge/DBGaugeChart.vue';
import ProgressSpinner from '@/components/core/ProgressSpinner.vue';
import CalibrationHistory from '@/components/core/table/CalibrationHistory.vue';
import CalibrationTable from '@/components/core/table/CalibrationTable.vue';
import MeasureHistory from '@/components/core/table/MeasureHistory.vue';
import StatisticsTable from '@/components/core/table/StatisticsTable.vue';
import { useDataInsights } from '@/composables/useDataInsights';
import { useEntityDetails } from '@/composables/useEntityDetails';

const route = useRoute();
const { category, entity } = route.query as { category: string; entity: string };

const { getEntityDetails } = useEntityDetails();
const {
  fetchLatestMeasure,
  fetchLatestCalibration,
  fetchStatistics,
  fetchMeasureHistory,
  fetchCalibrationHistory,
  generateGaugeProps,
} = useDataInsights();

const initialState = {
  devicesDetails: [] as Device[],
  latestCali: [] as CaliData[],
  gaugeProps: [] as GaugeProps[],
  statistics: [] as StatisticsData[],
  measureHistory: [] as Measure[],
  idsInEntity: [] as string[] | null,
  calibrationHistory: [] as CaliData[],
};

const fetchPageData = async () => {
  try {
    // 1. 獲取設備詳情
    const devices: Device[] = await getEntityDetails(category, entity);
    const idsInEntity: string[] = devices?.map((device: Device) => device.ID);
    const ids: string = idsInEntity.join(',');

    if (!ids) {
      return { ...initialState, devicesDetails: [], idsInEntity: [] };
    }

    // 2. 並行獲取所有數據 (使用 Promise.allSettled 提高穩定性)
    const results = await Promise.allSettled([
      fetchLatestMeasure(ids),
      fetchLatestCalibration(ids),
      fetchStatistics(ids),
      fetchMeasureHistory(ids, devices[0]?.['main_unit'] || ''),
      fetchCalibrationHistory(ids, 'health'),
    ]);

    // 處理 Promise.allSettled 的結果
    const latestMeasureResponse = results[0].status === 'fulfilled' ? results[0].value : null;
    const latestCali = results[1].status === 'fulfilled' ? results[1].value : null;
    const statistics = results[2].status === 'fulfilled' ? results[2].value : null;
    const measureHistory = results[3].status === 'fulfilled' ? results[3].value : [];
    const calibrationHistory = results[4].status === 'fulfilled' ? results[4].value : [];

    // 記錄任何失敗的請求
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`API call ${index} failed:`, result.reason);
      }
    });

    // 3. 處理數據並生成圖表屬性
    const gaugeProps = generateGaugeProps(devices, latestMeasureResponse);

    return {
      devicesDetails: devices,
      latestCali,
      gaugeProps,
      statistics,
      measureHistory,
      idsInEntity,
      calibrationHistory,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

const { state, isReady, isLoading } = useAsyncState(fetchPageData(), initialState, {
  immediate: true,
});

// 計算屬性，從 state 中獲取數據
const latestCali = computed(() => state.value.latestCali);
const gaugeProps = computed(() => state.value.gaugeProps);
const devicesDetails = computed(() => state.value.devicesDetails);
const idsInEntity = computed(() => state.value.idsInEntity);
const statistics = computed(() => state.value.statistics);
const measureHistory = computed(() => state.value.measureHistory);
const calibrationHistory = computed(() => state.value.calibrationHistory);
</script>

<style scoped></style> -->
