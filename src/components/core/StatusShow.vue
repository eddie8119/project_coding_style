<template>
  <div class="flex h-6 items-center gap-2">
    <img :src="showIconUrl" :alt="`${props.status}_icon`" class="w-6" />
    <p>{{ t(`device.status.${props.status}`) }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{ status: DeviceStatus }>();

import CautionIcon from '@/assets/icons/Caution.png';
import PowerIcon from '@/assets/icons/Power.png';
import StopIcon from '@/assets/icons/Stop.png';
import WarningIcon from '@/assets/icons/Warning.png';
import { DeviceStatus } from '@/types/device';

const showIconUrl = computed(() => {
  switch (props.status) {
    case DeviceStatus.RUNNING:
      return PowerIcon;
    case DeviceStatus.CAUTION:
      return CautionIcon;
    case DeviceStatus.STOPPED:
      return StopIcon;
    case DeviceStatus.WARNING:
      return WarningIcon;
    default:
      return StopIcon;
  }
});
</script>

<style scoped></style>
