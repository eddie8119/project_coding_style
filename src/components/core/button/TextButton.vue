<template>
  <button
    class="rounded-lg capitalize"
    :class="buttonClasses"
    :disabled="props.loading || props.disabled"
  >
    <div v-if="props.loading" class="flex items-center">
      <span class="mr-2 animate-spin">⏳</span>
      <span>processing</span>
    </div>
    <span v-if="props.icon" class="mr-2">
      <slot name="icon">{{ props.icon }}</slot>
    </span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string;
}

const props = defineProps<Props>();

const buttonClasses = computed(() => {
  const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 border';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-brand-primary text-white hover:bg-black-100 hover:text-brand-primary',
    secondary: 'bg-secondary-purple-a text-gray-800 hover:bg-gray-300',
    outline:
      'bg-transparent text-secondary-red hover:bg-secondary-red hover:text-white border-secondary-red',
    ghost: 'bg-transparent text-brand-primary hover:bg-brand-primary/10',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-3 py-1 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  return [
    baseStyles,
    variantStyles[props.variant || 'primary'],
    sizeStyles[props.size || 'md'],
    props.fullWidth ? 'w-full' : '',
    props.loading ? 'opacity-50 cursor-not-allowed' : '',
  ].join(' ');
});
</script>

<style lang="scss" scoped>
button:disabled {
  cursor: not-allowed !important;
  opacity: 0.5;
  background-color: #e5e7eb !important; /* gray-200 */
  color: #a1a1aa !important; /* gray-400 */
  pointer-events: auto; /* 確保游標可變化 */
}

button {
  outline: none;

  // 強制顯示邊框
  &.border {
    border-style: solid !important;
    border-width: 1px !important;
  }
}
</style>
