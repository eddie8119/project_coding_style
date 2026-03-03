<template>
  <div class="auth-container">
    <div v-if="showHeaderActions" class="flex justify-end gap-2">
      <a
        href="https://designer-helper-funsugar.netlify.app/"
        target="_blank"
        rel="noopener"
        aria-label="Designer Helper website"
        class="text-color-difference text-sm"
      >
        {{ t('link.website') }}
      </a>
      <HeaderNavActions :nav-items="navItems" />
    </div>

    <div v-if="props.showLogo" class="flex items-center justify-center gap-4">
      <img src="@/assets/icons/CompanyLogo.png" alt="logo Icon" class="icon-logo w-[35px]" />
      <img src="@/assets/icons/KaiJiLogo.png" alt="logo Icon" class="icon-logo w-[90px]" />
    </div>

    <h2 class="mb-5 mt-2 text-center text-[24px] font-semibold">
      <slot name="title" />
    </h2>

    <slot />

    <ElButton
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
    </ElButton>

    <div v-if="props.errorMessage" class="mt-2 text-center">
      <p class="text-secondary-red">{{ props.errorMessage }}</p>
    </div>

    <div v-if="props.message" class="mt-2 text-center">
      <p class="text-secondary-green">{{ props.message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import type { NavItem } from '@/types/layout';

import HeaderNavActions from '@/components/core/header/HeaderNavActions.vue';
import { useLocale } from '@/composables/useLocale';
import { Language } from '@/types/language';

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

const { t } = useI18n();
const route = useRoute();
const { languages, handleLanguageChange } = useLocale();

const handleLanguageSelect = (code: string): void => {
  handleLanguageChange(code as Language);
};

const showHeaderActions = computed(() =>
  ['login', 'register'].some((segment) => route.path.endsWith(`/${segment}`))
);

const navItems = computed<NavItem[]>(() => [
  {
    id: 1,
    name: 'Global',
    icon: 'Global',
    label: t('common.language'),
    action: handleLanguageSelect,
    dropdownItems: languages.map((lang) => ({
      label: lang.label,
      value: lang.code,
    })),
  },
]);
</script>
