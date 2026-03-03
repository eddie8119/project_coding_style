<template>
  <div :class="[handleClass, 'drag-handle cursor-grab rounded-full p-1 hover:bg-gray-200']">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :class="iconClass"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 6h16M4 12h16m-7 6h7"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    size?: number;
    handleClass?: string;
  }>(),
  {
    size: 5,
    handleClass: '',
  }
);

const iconClass = computed(() => `h-${props.size} w-${props.size} text-gray-400`);
</script>
