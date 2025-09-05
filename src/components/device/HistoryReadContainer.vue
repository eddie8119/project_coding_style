<template>
  <div class="panel-container md:min-h-[404px] lg:min-h-[404px]">
    <div class="mb-2 flex items-center justify-between">
      <H3Title :title="t('title.subTitle.history_read')" />
      <span v-if="lastUpdateTime" class="text-xs text-gray-500">{{ lastUpdateTime }}</span>
    </div>
    <div class="flex w-full flex-col gap-4">
      <div class="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-row items-center lg:w-[85%]">
          <el-radio-group v-model="queryMode" class="mr-2" :disabled="isLoading">
            <el-radio-button label="days"> {{ t('label.quick_date_selector') }} </el-radio-button>
            <el-radio-button label="custom"> {{ t('label.custom_time_range') }} </el-radio-button>
          </el-radio-group>

          <!-- 天數快速查詢 -->
          <el-select
            v-if="queryMode === 'days'"
            v-model="selectedDays"
            :disabled="isLoading"
            :loading="isLoading"
            class="max-w-[120px]"
          >
            <el-option
              v-for="item in dayIntervalList"
              :key="item"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <!-- 自訂時間查詢 -->
          <div v-if="queryMode === 'custom'" class="flex items-center gap-2">
            <el-date-picker
              v-model="startDateTime"
              type="datetime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="x"
              :placeholder="t('label.start_time')"
              class="w-full md:max-w-[140px] lg:max-w-[200px]"
              :disabled="isLoading"
            />
            <span>-</span>
            <el-date-picker
              v-model="endDateTime"
              type="datetime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="x"
              :placeholder="t('label.end_time')"
              class="w-full md:max-w-[140px] lg:max-w-[200px]"
              :disabled="isLoading"
            />
            <el-button
              type="primary"
              :loading="isLoading"
              :disabled="!startDateTime || !endDateTime"
              @click="fetchCustomTimeData"
            >
              {{ t('button.query') }}
            </el-button>
          </div>
        </div>
        <div
          class="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center md:w-auto md:justify-end"
        >
          <p>{{ t('common.download') }}:</p>
          <div class="flex w-full gap-2 sm:w-auto">
            <TextButton variant="primary" size="sm" class="flex-1 sm:flex-none" @click="">
              {{ t('button.pdf') }}
            </TextButton>
            <TextButton variant="primary" size="sm" class="flex-1 sm:flex-none" @click="">
              {{ t('button.csv') }}
            </TextButton>
          </div>
        </div>
      </div>

      <!-- <NoData v-if="hasFetched && localData.measureHistory.length === 0" /> -->
      <!-- v-if 是為了確認 props.fetchedDevice 有值時才渲染, 不然會undefined -->
      <HistoryChart
        v-if="props.fetchedDevice"
        :measure-history-data="localData.measureHistory"
        :unit="props.fetchedDevice['main_unit']"
        :main-label="props.fetchedDevice['label']"
      />
      <!-- <Loading v-if="!hasFetched" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Device } from '@/types/device';
import type { MeasureHistory } from '@/types/measure';

import TextButton from '@/components/core/button/TextButton.vue';
import HistoryChart from '@/components/core/chart/HistoryChart.vue';
// import Loading from '@/components/core/loading/Loading.vue';
// import NoData from '@/components/core/NoData.vue';
import H3Title from '@/components/core/title/H3Title.vue';
import { useDataInsights } from '@/composables/useDataInsights';
import { useFetchLoading } from '@/composables/useFetchLoading';
import { useUpdateTime } from '@/composables/useUpdateTime';

const { t } = useI18n();
const { fetchMeasureHistory } = useDataInsights();
const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();
const { isLoading, updateLoading, updateHasFetched } = useFetchLoading();

const props = defineProps<{
  id: string;
  fetchedDevice: Device | undefined;
}>();

const localData = ref({
  measureHistory: [] as MeasureHistory[],
});
const queryMode = ref<'days' | 'custom'>('days');
const selectedDays = ref<number>(1);
// 使用 string | number 型別，因為 el-date-picker 的 value-format="X" 會返回時間戳記（數字）
const startDateTime = ref<string | number>('');
const endDateTime = ref<string | number>('');

const dayIntervalList = [1, 3, 5, 7].map((day) => ({ label: `${day} 天`, value: day }));

// 抽出共用的查詢邏輯
const fetchHistory = async ({
  id,
  mainUnit,
  start,
  end,
}: {
  id: string;
  mainUnit: string;
  start: string | number;
  end: string | number;
}) => {
  if (!id || !mainUnit || !start || !end) return false;
  updateLoading(true);
  updateHasFetched(false);

  try {
    const measureHistory = await fetchMeasureHistory(id, mainUnit, start, end);
    localData.value.measureHistory = measureHistory.data;
    updateHasFetched(true);
    updateLastUpdateTime();
    return true;
  } catch (error) {
    console.error(error);
    updateHasFetched(true);
    return false;
  } finally {
    updateLoading(false);
  }
};

// 根據天數查詢
const initFetchData = async (device: Device, days: number) => {
  if (!props.id || !device) return false;
  const now = Math.floor(Date.now() / 1000);
  const daysAgo = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);

  return fetchHistory({
    id: props.id,
    mainUnit: device['main_unit'],
    start: daysAgo.toString(),
    end: now.toString(),
  });
};

// 根據自訂時間查詢
const fetchCustomTimeData = async () => {
  if (!props.id || !props.fetchedDevice || !startDateTime.value || !endDateTime.value) return false;
  return fetchHistory({
    id: props.id,
    mainUnit: props.fetchedDevice['main_unit'],
    start: startDateTime.value,
    end: endDateTime.value,
  });
};

watch(
  [() => props.fetchedDevice, selectedDays, queryMode],
  async ([newDevice, days, mode]: [Device | undefined, number, 'days' | 'custom']) => {
    if (!newDevice) return;

    // 只有在天數查詢模式下才自動觸發查詢
    if (mode === 'days') {
      try {
        await initFetchData(newDevice, days);
      } catch (err) {
        console.error(err);
      }
    }
  },
  { immediate: true }
);

// 用 watch 同時監聽多個不同的 ref 或響應式物件 時，應該傳遞一個包含這些來源的陣列，而不是一個回傳陣列的 getter 函式
// https://vuejs.org/api/reactivity-core.html#watch
// 將多個來源以「陣列」的形式傳遞

// 問題出在第一個參數 () => [...]。當您使用一個回傳陣列的函式作為 watch 的來源時，TypeScript 會試圖為陣列中的所有元素找到一個「共同的、最寬鬆的類型」。在這個例子中，它可能會推斷出像 (Device | number | string | undefined)[] 這樣的聯合類型。
// 然而，您的回呼函式 ([newDevice, days, mode]) 卻有非常精確的類型定義 [Device | undefined, number, 'days' | 'custom']。
// 寬鬆的來源類型 和 精確的回呼函式參數類型 對不上
</script>

<style scoped></style>
