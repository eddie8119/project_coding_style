<template>
  <div class="auth-container">
    <div v-if="props.showLogo" class="flex justify-center">
      <img src="@/assets/icons/CompanyLogo.png" alt="logo Icon" class="icon-logo w-[125px]" />
    </div>

    <!-- 標題 -->
    <h2 class="my-5 text-center text-[24px] font-semibold">
      <slot name="title" />
    </h2>

    <!-- 這裡放表單內容 -->
    <slot />

    <!-- 消息 -->
    <div v-if="props.errorMessage" class="mb-2 text-center">
      <p class="text-secondary-red">{{ props.errorMessage }}</p>
    </div>

    <div v-if="props.message" class="mb-2 text-center">
      <p class="text-secondary-green">{{ props.message }}</p>
    </div>

    <el-button
      v-if="props.showSubmitButton"
      type="primary"
      size="large"
      :loading="props.loading"
      :disabled="props.loading || props.isInvalid"
      block
      class="auth-brand-button w-full"
      @click="emit('submit')"
    >
      <slot name="button-text"> {{ t('button.submit') }}</slot>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    errorMessage?: string;
    message?: string;
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

<style lang="scss" scoped>
// 嘗試移動到element.scss 不好處理
.auth-brand-button {
  background-color: var(--color-brand-primary);
  border-color: var(--color-brand-primary);
  @apply rounded-xl;

  &:hover,
  &:focus {
    background-color: var(--color-brand-secondary);
    border-color: var(--color-brand-secondary);
  }

  &:active {
    opacity: 0.8;
  }
}
</style>
