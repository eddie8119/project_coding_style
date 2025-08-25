<template>
  <DevicesBulletinBoard :key="props.observationType" :observation-type="props.observationType" />
</template>

<script setup lang="ts">
import type { ObservationType } from '@/types/device';

import DevicesBulletinBoard from '@/components/core/situationRoom/DevicesBulletinBoard.vue';

const props = defineProps<{
  observationType: ObservationType;
}>();
</script>

<style scoped></style>
