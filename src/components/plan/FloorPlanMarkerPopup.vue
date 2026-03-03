<template>
  <div class="absolute left-full top-0 z-30 ml-2 w-64 rounded-lg border bg-white p-3 shadow-xl">
    <div class="text-sm font-medium text-gray-900">{{ marker.title }}</div>
    <div v-if="marker.description" class="mt-1 text-xs text-gray-600">
      {{ marker.description }}
    </div>
    <div class="mt-2 flex gap-2">
      <button
        class="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
        @click="$emit('edit')"
      >
        編輯
      </button>
      <button
        class="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
        @click="$emit('delete')"
      >
        刪除
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskMarker } from '@/utils/floorPlan/floorPlanMarker';

defineProps<{
  marker: TaskMarker;
}>();

defineEmits<{
  edit: [];
  delete: [];
}>();
</script>
