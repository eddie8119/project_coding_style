<template>
  <button
    type="button"
    :aria-disabled="disabled"
    :class="[
      'text200-color-difference flex w-full items-center justify-center rounded-md border border-dashed p-2 transition',
      stateClasses,
      customClass,
    ]"
    @click="handleClick"
  >
    <component :is="iconComponent" class="pointer-events-none mr-1.5" />
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { Component } from 'vue';

import AddIcon from '@/components/ui/AddIcon.vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: Component;
    disabled?: boolean;
    customClass?: string;
  }>(),
  {
    label: '',
    customClass: '',
  }
);

const emit = defineEmits<{ (e: 'click'): void }>();

const iconComponent = computed<Component>(() => props.icon ?? AddIcon);

const stateClasses = computed(() =>
  props.disabled
    ? 'cursor-not-allowed opacity-60'
    : 'cursor-pointer border-brand-primary bg-brand-primary text-gray-900 hover:bg-transparent hover:text-gray-400'
);

const handleClick = (e: MouseEvent) => {
  if (props.disabled) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  emit('click');
};
</script>
