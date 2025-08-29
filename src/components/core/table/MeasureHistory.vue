<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <div class="panel-container relative flex flex-col p-4">
    <H2Title :title="t('title.subTitle.measure_history')" />
    <ShowUpdateTime v-if="lastUpdateTime" :last-update-time="lastUpdateTime" />

    <div class="mb-4 mt-8 grid grid-cols-1 items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <div class="relative w-full">
        <LabelText title="Start Time" />
        <el-date-picker
          v-model="measureHistoryStartDateTime"
          type="datetime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="Select start time"
          class="w-full"
        />
      </div>

      <div class="relative w-full">
        <LabelText title="End Time" />
        <el-date-picker
          v-model="measureHistoryEndDateTime"
          type="datetime"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="Select end time"
          class="w-full"
        />
      </div>

      <div class="relative">
        <LabelText title="Y-Axis" />
        <Selector
          v-model="selectedYAxis"
          :options="yAxisOptions"
          placeholder="Y-Axis"
          disabled
          size="large"
          class="w-full"
        />
      </div>
    </div>

    <TextButton
      variant="primary"
      :disabled="isTimeValid || loading"
      :loading="loading"
      size="md"
      @click="getNewMeasureHistory"
    >
      Search
    </TextButton>

    <div v-if="measureData && measureData.length > 0" class="mt-6">
      <LineChart :data-source="measureData" :y-axis="yAxis" data-type="_measurement" />
    </div>
    <div v-else-if="noDataMessage" class="mt-6 p-4 text-center text-gray-500">
      {{ noDataMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElDatePicker } from 'element-plus';
import { computed, inject, onActivated, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Measure } from '@/types/measure';

import { datainsightsApi } from '@/api/datainsights';
import TextButton from '@/components/core/button/TextButton.vue';
import LineChart from '@/components/core/chart/LineChart.vue';
import LabelText from '@/components/core/input/LabelText.vue';
import Selector from '@/components/core/input/Selector.vue';
import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import H2Title from '@/components/core/title/H2Title.vue';
import { useUpdateTime } from '@/composables/useUpdateTime';

const props = defineProps({
  initialMeasureData: { type: Array as () => Measure[], required: false, default: () => [] },
});

const { t } = useI18n();
const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

const idsInEntity = inject('idsInEntity', ref([]));
const yAxis = inject('measureYAxis', ref(''));

const selectedYAxis = ref(yAxis.value);
const yAxisOptions = computed(() => [{ label: yAxis.value, value: yAxis.value }]);

const measureData = ref<Measure[]>(props.initialMeasureData || []);
const measureHistoryStartDateTime = ref<Date | string>('');
const measureHistoryEndDateTime = ref<Date | string>('');
const loading = ref<boolean>(false);
const noDataMessage = ref<string>('');

onActivated(() => {
  // Set default date range if not provided
  if (!measureHistoryStartDateTime.value) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Default to 7 days ago
    measureHistoryStartDateTime.value = startDate;
  }

  if (!measureHistoryEndDateTime.value) {
    measureHistoryEndDateTime.value = new Date(); // Default to current date
  }

  // Load initial data if IDs are available
  if (ids.value && yAxis.value && !measureData.value?.length) {
    getNewMeasureHistory();
  }
});

const ids = computed(() => idsInEntity.value.join(','));
const isTimeValid = computed(() => {
  // 檢查開始時間是否晚於結束時間 (這是錯誤情況)
  if (!measureHistoryStartDateTime.value || !measureHistoryEndDateTime.value) {
    return false; // 若任一時間未設定，不應該禁用按鈕
  }

  const startTime = new Date(measureHistoryStartDateTime.value).getTime();
  const endTime = new Date(measureHistoryEndDateTime.value).getTime();

  return startTime >= endTime; // 若開始時間晚於或等於結束時間，返回 true (表示時間無效)
});

const getNewMeasureHistory = async () => {
  if (!ids.value || !yAxis.value) {
    return;
  }

  loading.value = true;
  noDataMessage.value = '';

  try {
    // 簡化日期轉換邏輯
    const startTime = new Date(measureHistoryStartDateTime.value).valueOf();
    const endTime = new Date(measureHistoryEndDateTime.value).valueOf();

    const measureHistoryResponse = await datainsightsApi.getMeasureHistory(
      ids.value,
      yAxis.value,
      startTime,
      endTime
    );

    measureData.value = measureHistoryResponse.data.data;
    updateLastUpdateTime();

    if (!measureData.value || measureData.value.length === 0) {
      noDataMessage.value = 'No measurement data available for the selected time range';
    }
  } catch (error: unknown) {
    console.error('Failed to load measurement history:', error);
    noDataMessage.value = 'Failed to load measurement data';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped></style> -->
