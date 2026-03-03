<template>
  <div
    v-if="activeImage && pinsForActiveImage.length > 0"
    class="pin-layer pointer-events-none absolute inset-0"
  >
    <div
      v-for="(pin, index) in pinsForActiveImage"
      :key="`${pin.taskId}-${index}`"
      class="pin absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      :style="{
        left: `${pin.xPercent ?? 0}%`,
        top: `${pin.yPercent ?? 0}%`,
      }"
    >
      <div
        class="text-black mb-1 inline-flex max-w-[70px] items-center justify-center rounded-md border border-blue-200 bg-white px-2 py-0.5 text-center text-[10px] leading-tight shadow-sm"
      >
        {{ pin.taskTitle }}
      </div>
      <div class="h-2 w-2 rounded-full bg-secondary-green shadow-md" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { FloorPlanItem, TaskResponse } from '@/types/response';

const props = defineProps<{
  images: FloorPlanItem[];
  tasks?: TaskResponse[];
  activeIndex: number;
}>();

const activeImage = computed(() => {
  if (!props.images || props.images.length === 0) {
    return null;
  }
  const index = Math.min(Math.max(props.activeIndex, 0), props.images.length - 1);
  return props.images[index];
});

const pinsForActiveImage = computed(() => {
  if (!props.tasks || !activeImage.value) return [];

  const imageKey = activeImage.value.key;

  return props.tasks.flatMap((task) => {
    if (!task.pinLocation) return [];
    return task.pinLocation
      .map((pin) => ({
        ...pin,
        taskId: task.id,
        taskTitle: task.title,
      }))
      .filter((pin) => pin.floorPlanKey === imageKey);
  });
});
</script>
