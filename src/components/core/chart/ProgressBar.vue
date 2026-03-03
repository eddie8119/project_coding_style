<template>
  <div class="relative flex items-center">
    <div
      class="h-4 w-24 overflow-hidden rounded-full border border-black-300 bg-black-200 dark:border-black-400 dark:bg-black-500"
    >
      <div
        class="h-full rounded-full bg-secondary-blue-a"
        :style="{ width: `${progressWidth}%` }"
      />
    </div>
    <span
      class="text-color-difference absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs"
    >
      {{ displayText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value: number;
  showPercentage?: boolean;
  total: number;
}>();

const progressWidth = computed(() => {
  return props.total === 0 ? 0 : (props.value / props.total) * 100;
});

const displayText = computed(() => {
  if (props.showPercentage) {
    const percentage = props.total === 0 ? 0 : (props.value / props.total) * 100;
    return `${percentage.toFixed(1)}%`;
  }
  return props.value;
});
</script>

<style scoped></style>
