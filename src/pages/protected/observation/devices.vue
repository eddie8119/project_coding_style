<template>
  <DevicesBulletinBoard :key="props.observationType" :observation-type="props.observationType" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

import type { ObservationType } from '@/types/device';

const DevicesBulletinBoard = defineAsyncComponent(
  () => import('@/components/core/situationRoom/DevicesBulletinBoard.vue')
);

const props = defineProps<{
  observationType: ObservationType;
}>();
</script>

<style scoped></style>
