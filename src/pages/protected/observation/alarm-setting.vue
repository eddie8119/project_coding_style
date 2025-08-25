<template>
  <DevicesAlarmBulletinBoard :observation-type="props.observationType" />
</template>

<script setup lang="ts">
import type { ObservationType } from '@/types/device';

import DevicesAlarmBulletinBoard from '@/components/core/situationRoom/DevicesAlarmBulletinBoard.vue';

const props = defineProps<{
  observationType: ObservationType;
}>();
</script>

<style scoped></style>
