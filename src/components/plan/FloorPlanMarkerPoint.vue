<template>
  <div
    :style="markerStyle"
    class="absolute z-20 -translate-x-1/2 -translate-y-1/2 transform cursor-pointer"
    @click.stop="$emit('select')"
  >
    <div
      class="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white shadow-lg transition-all duration-200 hover:scale-110"
      :class="{
        'scale-110 bg-red-500': isSelected,
        'bg-blue-500': !isSelected,
      }"
    >
      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <!-- 標記點資訊氣泡 -->
    <FloorPlanMarkerPopup
      v-if="isSelected"
      :marker="marker"
      @edit="$emit('edit')"
      @delete="$emit('delete')"
    />
  </div>
</template>

<script setup lang="ts">
import FloorPlanMarkerPopup from './FloorPlanMarkerPopup.vue';

import type { TaskMarker } from '@/utils/floorPlan/floorPlanMarker';

defineProps<{
  marker: TaskMarker;
  markerStyle: Record<string, string>;
  isSelected: boolean;
}>();

defineEmits<{
  select: [];
  edit: [];
  delete: [];
}>();
</script>
