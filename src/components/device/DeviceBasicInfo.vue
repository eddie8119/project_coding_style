<template>
  <div class="grid grid-cols-3 gap-4">
    <!-- 設備自定義名稱 -->
    <div class="device-card transition-shadow">
      <div class="flex h-full flex-col justify-center space-y-4">
        <div>
          <H3Title :title="t('device.site_name')" />
          <div class="flex justify-between">
            <p class="uppercase">{{ props.deviceData?.tag }}</p>
            <TextButton
              v-if="props.isAdmin"
              variant="primary"
              size="md"
              class="h-[30px] w-full max-w-[60px] lg:w-auto"
              @click="showTagEditDialog = true"
            >
              {{ t('device.edit') }}
            </TextButton>
          </div>
        </div>
        <div>
          <H3Title :title="t('device.location')" />
          <p class="uppercase">{{ props.deviceData?.location }}</p>
        </div>
      </div>
    </div>

    <!-- 感測器資訊 -->
    <div class="device-card transition-shadow">
      <div class="flex h-full flex-col justify-center space-y-4">
        <div>
          <H3Title :title="t('device.product_name')" />
          <p class="uppercase">{{ props.deviceData?.product_name }}</p>
        </div>
        <div>
          <H3Title :title="t('device.product_serial')" />
          <p>{{ props.deviceData?.product_serial }}</p>
        </div>
      </div>
    </div>

    <!-- 感測器資訊 -->
    <div class="device-card transition-shadow">
      <div class="flex h-full flex-col justify-center space-y-4">
        <div>
          <H3Title :title="t('device.sensor_name')" />
          <p>{{ props.deviceData?.sensor_name }}</p>
        </div>
        <div>
          <H3Title :title="t('device.sensor_serial')" />
          <p>{{ props.deviceData?.sensor_serial }}</p>
        </div>
      </div>
    </div>

    <div class="device-card transition-shadow">
      <div class="flex h-full flex-col justify-center space-y-4">
        <div v-if="props.observationType === 'ph'">
          <H3Title :title="t('device.water_area')" />

          <div class="flex justify-between">
            <p>{{ t('option.waterQuality.' + waterQuality) }}</p>

            <TextButton
              v-if="props.isAdmin"
              variant="primary"
              size="md"
              class="h-[30px] w-full max-w-[60px] lg:w-auto"
              @click="showWaterQualityEditDialog = true"
            >
              {{ t('device.edit') }}
            </TextButton>
          </div>
        </div>
        <div>
          <H3Title :title="t('device.senser_start_date')" />
          <p>2025/6/17</p>
        </div>
      </div>
    </div>

    <!-- 感測器剩餘天數 -->
    <div class="device-card transition-shadow">
      <H3Title :title="t('device.sensor_remainingDays')" />
      <div class="mt-auto">
        <div class="flex items-baseline justify-center">
          <span class="text-4xl font-bold tracking-tight text-brand-primary">{{
            waterRemainingDays
          }}</span>
          <span class="ml-2 text-base font-medium text-gray-600">days</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 編輯對話框 -->
  <TagEditDialog
    v-if="props.deviceData"
    v-model="showTagEditDialog"
    :device-data="props.deviceData"
    @update:device-data="updateDeviceData"
  />
  <WaterQualityEditDialog
    v-model="showWaterQualityEditDialog"
    :water-quality-value="waterQuality"
    :water-options-list="waterOptionsList"
    @update:water-quality="updateWaterQuality"
  />
</template>

<script setup lang="ts">
import { computed, onActivated, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Device } from '@/types/device';
import type { ObservationType } from '@/types/device';

import TextButton from '@/components/core/button/TextButton.vue';
import TagEditDialog from '@/components/core/dialog/TagEditDialog.vue';
import WaterQualityEditDialog from '@/components/core/dialog/WaterQualityEditDialog.vue';
import H3Title from '@/components/core/title/H3Title.vue';

const { t } = useI18n();

const props = defineProps<{
  deviceData: Device;
  isAdmin: boolean;
  observationType: ObservationType;
}>();
const emit = defineEmits<{ 'update:deviceData': [deviceData: Device] }>();

const waterOptionsList = ref([
  { name: t('option.waterQuality.pure_water'), value: 'pure_water' },
  { name: t('option.waterQuality.acid_alkali'), value: 'acid_alkali' },
  { name: t('option.waterQuality.biological_water'), value: 'biological_water' },
  { name: t('option.waterQuality.general_acid_alkali'), value: 'general_acid_alkali' },
  { name: t('option.waterQuality.grinding_water'), value: 'grinding_water' },
  { name: t('option.waterQuality.copper_grinding'), value: 'copper_grinding' },
  { name: t('option.waterQuality.nh3n_water'), value: 'nh3n_water' },
  { name: t('option.waterQuality.hydrofluoric_water'), value: 'hydrofluoric_water' },
]);

const waterQuality = ref<string>('pure_water');

onActivated(() => {
  switch (props.observationType) {
    case 'ph':
      waterQuality.value = 'pure_water';
      break;
    case 'orp':
      waterQuality.value = '180_water';
      break;
    case 'nh3n':
      waterQuality.value = '360_water';
      break;
    case 'flouride':
      waterQuality.value = '360_water';
      break;
    default:
      return 'pure_water';
  }
});

const waterRemainingDays = computed(() => {
  switch (waterQuality.value) {
    case 'pure_water':
      return 913;
    case 'acid_alkali':
      return 330;
    case 'biological_water':
      return 313;
    case 'general_acid_alkali':
      return 307;
    case 'grinding_water':
      return 301;
    case 'copper_grinding':
      return 299;
    case 'nh3n_water':
      return 297;
    case 'hydrofluoric_water':
      return 292;
    case '360_water':
      return 360;
    case '180_water':
      return 180;
    default:
      return 292;
  }
});

// 本地設備數據，用於編輯和顯示
// 本地編輯需求，那就需要 localDeviceData 作為暫存區
const showTagEditDialog = ref<boolean>(false);
const showWaterQualityEditDialog = ref<boolean>(false);

const updateDeviceData = (newDeviceData: Device) => {
  emit('update:deviceData', newDeviceData);
};

const updateWaterQuality = (newWaterQuality: string) => {
  waterQuality.value = newWaterQuality;
};
</script>

<style scoped>
.device-card {
  @apply flex h-[140px] flex-col rounded-xl bg-primary-blue p-4 dark:bg-black-500;
}
</style>
