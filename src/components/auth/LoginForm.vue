<template>
  <ElForm>
    <FormInput
      :model-value="props.email"
      name="email"
      type="email"
      :placeholder="t('placeholder.auth.email')"
      :error="props.errors?.email"
      icon="Message"
      @update:model-value="emit('update:email', $event)"
      @blur="emit('blur:email')"
    />

    <FormInput
      :model-value="props.password"
      name="password"
      type="password"
      :placeholder="t('placeholder.auth.password')"
      :error="props.errors?.password"
      icon="Lock"
      @update:model-value="emit('update:password', $event)"
      @blur="emit('blur:password')"
    />
    <router-link to="/auth/register">
      <p class="mb-2 text-sm">{{ t('link.register') }}</p>
    </router-link>
    <router-link to="/auth/forgot-password">
      <p class="mb-2 text-sm">{{ t('link.forgot_password') }}</p>
    </router-link>
    <div class="description-text demo-banner">
      <p>{{ t('description.auth.demo_hint') }}</p>
      <a
        class="demo-banner__link"
        href="https://interior-construction-helper.web.app/#/"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ t('button.go_to_demo') }}
      </a>
    </div>

    <SsoSection @sso-login="emit('sso-login', $event)" />
  </ElForm>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { SsoProvider } from '@/constants/provider';

import SsoSection from '@/components/auth/SsoSection.vue';
import FormInput from '@/components/core/input/FormInput.vue';

const props = defineProps<{
  email: string;
  password: string;
  errors?: Record<string, string>;
}>();
const emit = defineEmits<{
  (e: 'update:email', value: string): void;
  (e: 'update:password', value: string): void;
  (e: 'blur:email'): void;
  (e: 'blur:password'): void;
  (e: 'sso-login', provider: SsoProvider): void;
}>();
const { t } = useI18n();
</script>

<style scoped lang="scss">
.demo-banner {
  @apply mt-4 flex flex-col items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 p-4 text-center text-xs text-slate-700 backdrop-blur;
  @apply dark:border-white/10 dark:bg-white/5 dark:text-slate-200;
}

.demo-banner__link {
  @apply inline-flex items-center gap-1.5 rounded-md bg-slate-600/80 px-3 py-1.5 text-white transition hover:bg-slate-800;
  @apply dark:bg-white/15 dark:hover:bg-white/25;
}
</style>
