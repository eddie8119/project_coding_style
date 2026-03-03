<template>
  <div class="flex h-full w-full items-center justify-center">
    <div class="w-full max-w-[900px] md:p-4">
      <div
        class="flex flex-col overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(247,248,252,0.98))] shadow-[0_30px_80px_rgba(12,21,31,0.15)] md:flex-row md:items-stretch"
      >
        <AuthFormShell
          v-bind="props"
          class="w-full md:max-w-[420px] md:flex-[0_0_420px]"
          @submit="emit('submit')"
        >
          <template #title>
            <slot name="title" />
          </template>

          <slot />

          <template #button-text>
            <slot name="button-text" />
          </template>
        </AuthFormShell>

        <div
          class="hidden flex-1 bg-cover bg-center md:block"
          aria-hidden="true"
          :style="{ backgroundImage: `url('/images/Banner.jpg')` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthFormShell from '@/components/auth/AuthFormShell.vue';

const props = withDefaults(
  defineProps<{
    errorMessage?: string | null;
    message?: string | null;
    loading?: boolean;
    showLogo?: boolean;
    isInvalid?: boolean;
    showSubmitButton?: boolean;
  }>(),
  {
    errorMessage: '',
    message: '',
    showLogo: true,
    isInvalid: false,
    showSubmitButton: true,
  }
);

const emit = defineEmits<{
  (e: 'submit'): void;
}>();
</script>

<style lang="scss" scoped></style>
