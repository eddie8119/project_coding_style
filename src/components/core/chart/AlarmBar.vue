<template>
  <div class="relative flex items-center">
    <div class="relative h-4 w-24 overflow-hidden rounded-full bg-black-200">
      <!-- lowerThreshold 線 -->
      <div
        v-if="lowerThreshold !== null"
        class="absolute top-0 h-4 w-0.5 bg-secondary-red"
        :style="{ left: calcPercent(lowerThreshold) + '%' }"
      />
      <!-- upperThreshold 線 -->
      <div
        v-if="upperThreshold !== null"
        class="absolute top-0 h-4 w-0.5 bg-secondary-red"
        :style="{ left: calcPercent(upperThreshold) + '%' }"
      />
    </div>
    <span class="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2">
      {{ lowerThreshold }}
    </span>
    <span class="absolute left-1 top-1/2 -translate-y-1/2 translate-x-24">
      {{ upperThreshold }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  lowBound: number;
  highBound: number;
  lowerThreshold: number | null;
  upperThreshold: number | null;
  showPercentage?: boolean;
}>();

const calcPercent = (value: number) => {
  // 將 value 映射到 0~100% 之間
  if (props.highBound === props.lowBound) return 0;
  const percent = ((value - props.lowBound) / (props.highBound - props.lowBound)) * 100;
  // 確保百分比在 0-100 範圍內
  return Math.max(0, Math.min(100, percent));
};
</script>

<style scoped></style>
