<template>
  <div class="relative flex items-center">
    <div class="h-4 w-24 overflow-hidden rounded-full bg-black-200">
      <div
        class="h-full rounded-full bg-secondary-blue-a"
        :style="{ width: `${(props.value / unitBound.high) * 100}%` }"
      />
    </div>
    <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">
      {{ props.showPercentage ? `${props.value}%` : props.value }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { ObservationType } from '@/types/device';

import { getUnitBound } from '@/utils/labelConvert';

const props = defineProps<{
  value: number;
  showPercentage?: boolean;
  observationType: ObservationType;
}>();

const unitBound = computed(() => getUnitBound(props.observationType));
</script>

<style scoped></style>
