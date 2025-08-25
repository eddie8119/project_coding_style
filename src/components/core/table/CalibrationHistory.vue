<template></template>

<script setup lang="ts"></script>

<style scoped></style>

<!-- <template>
  <div class="panel-container relative flex flex-col">
    <H2Title :title="'Calibration History'" />
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

      <div class="relative w-full">
        <LabelText title="Y-Axis" />
        <Selector
          v-model="selectedYAxis"
          :options="formattedYAxisOptions"
          placeholder="Select Y-Axis"
          size="large"
          class="w-full"
        />
      </div>
    </div>

    <TextButton variant="primary" :disabled="isTimeValid" size="md" @click="getNewMeasureHistory">
      Search
    </TextButton>

    <div class="mt-4 w-full">
      <Message
        v-if="isTimeValid"
        severity="error"
        class="rounded-md bg-red-100 px-4 py-2 text-red-700"
      >
        <i class="pi pi-times-circle" /> Start time must be earlier than end time
      </Message>
    </div>
    <LineChart :data-source="measureData" :y-axis="selectedYAxis" data-type="_calibration" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';

import { datainsightsApi } from '@/api/datainsights';
import TextButton from '@/components/core/button/TextButton.vue';
import LabelText from '@/components/core/input/LabelText.vue';
import Selector from '@/components/core/input/Selector.vue';
import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import H2Title from '@/components/core/title/H2Title.vue';

const props = defineProps({
  initialMeasureData: { type: Array, required: false }, // Consider more specific type e.g. CalibrationData[]
});

const idsInEntity = inject<string[]>('idsInEntity', ref([]));
const selectedYAxis = inject<string>('caliYAxis', ref('health')); // Default to 'health' or another appropriate value

const measureData = ref(props.initialMeasureData);
const measureHistoryStartDateTime = ref<string>('');
const measureHistoryEndDateTime = ref<string>('');
const lastUpdateTime = ref<Date | null>(null); // Added lastUpdateTime

const yAxisValues = ['health', 'zero', 'slope'];
const formattedYAxisOptions = computed(() =>
  yAxisValues.map((val) => ({ label: val, value: val }))
);

const ids = computed(() => idsInEntity.value.join(','));
const isTimeValid = computed(() => {
  return (
    measureHistoryEndDateTime.value &&
    measureHistoryStartDateTime.value &&
    measureHistoryStartDateTime.value >= measureHistoryEndDateTime.value
  );
});

const updateLastUpdateTime = () => {
  lastUpdateTime.value = new Date();
};

const getNewMeasureHistory = async () => {
  if (!ids.value || ids.value.length === 0 || !selectedYAxis.value) {
    // console.warn('IDs or Y-Axis not selected');
    // toast.add({ severity: 'warn', summary: 'Missing Information', detail: 'Please ensure device IDs and Y-axis are available.', life: 3000 });
    return;
  }
  if (!measureHistoryStartDateTime.value || !measureHistoryEndDateTime.value) {
    // toast.add({ severity: 'warn', summary: 'Missing Information', detail: 'Please select start and end times.', life: 3000 });
    return;
  }

  try {
    const startTime = new Date(measureHistoryStartDateTime.value).valueOf();
    const endTime = new Date(measureHistoryEndDateTime.value).valueOf();

    const measureHistoryResponse = await datainsightsApi.getCalibrationHistory(
      ids.value,
      selectedYAxis.value,
      startTime,
      endTime
    );
    measureData.value = measureHistoryResponse.data.data;
    updateLastUpdateTime();

    if (!measureData.value || measureData.value.length === 0) {
      // console.log('No calibration data available for the selected criteria.');
      // toast.add({ severity: 'info', summary: 'No Data', detail: 'No calibration data found for the selected time range and Y-axis.', life: 3000 });
    }
  } catch (error) {
    console.error('Error fetching calibration history:', error);
    // The toast object here is not defined locally. Ensure it's available globally or via PrimeVue's useToast if PrimeVue is still in use.
    // For example, if using PrimeVue: const toast = useToast(); (would need to be imported and called in setup)
    // toast.add({
    //   severity: 'error',
    //   summary: 'Error Fetching Data',
    //   detail: 'Failed to load calibration history. Please try again.', // More user-friendly message
    //   life: 5000,
    // });
  }
};
</script>

<style scoped></style> -->
