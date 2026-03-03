<template>
  <button
    type="button"
    :class="[
      'text-color-difference text-color-difference-hover inline-flex items-center justify-center',
      height,
      width,
    ]"
    v-bind="$attrs"
  >
    <span class="sr-only">Remove</span>
    <svg :class="[iconHeight, iconWidth]" fill="currentColor" viewBox="0 0 20 20">
      <path
        fill-rule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    width?: string; // Tailwind width class for button, e.g. 'w-4', 'w-6', 'w-8'
    height?: string; // Tailwind height class for button, e.g. 'h-4', 'h-6', 'h-8'
    iconWidth?: string; // Tailwind width class for icon, e.g. 'w-2.5', 'w-3.5', 'w-4'
    iconHeight?: string; // Tailwind height class for icon, e.g. 'h-2.5', 'h-3.5', 'h-4'
  }>(),
  {
    width: 'w-4',
    height: 'h-4',
    iconWidth: 'w-2.5',
    iconHeight: 'h-2.5',
  }
);

const { width, height, iconWidth, iconHeight } = props;
</script>
