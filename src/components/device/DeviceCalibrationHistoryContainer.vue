<template>
  <div>
    <H3Title title="Calibration History" />
    <ProgressSpinner v-if="isLoading" />
    <div v-else>
      <!-- For now, just display the raw data -->
      <pre>{{ calibrationHistoryData }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

import type { CaliData } from '@/types/calibration';
import type { Device } from '@/types/device';

import ProgressSpinner from '@/components/core/ProgressSpinner.vue';
import H3Title from '@/components/core/title/H3Title.vue';
import { useDataInsights } from '@/composables/useDataInsights';

const props = defineProps<{
  id: string;
  fetchedDevice: Device | null;
}>();

const { fetchCalibrationHistory } = useDataInsights();
const isLoading = ref(false);
const calibrationHistoryData = ref<CaliData[]>([]);

const initFetchData = async (deviceId: string) => {
  if (!deviceId) return;
  isLoading.value = true;
  try {
    const history = await fetchCalibrationHistory(deviceId, 'health');
    calibrationHistoryData.value = history;
  } catch (error) {
    console.error('Failed to fetch calibration history:', error);
    calibrationHistoryData.value = [];
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.fetchedDevice,
  (newDevice) => {
    if (newDevice) {
      initFetchData(props.id);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 0.5rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
