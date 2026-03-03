<template>
  <AuthBackground>
    <AuthCardBanner
      :error-message="errorMessage"
      :loading="isSubmitting"
      :is-invalid="!isValid"
      @submit="onSubmit"
    >
      <template #title> {{ t('title.welcome') }} </template>
      <template #button-text> {{ t('button.login') }} </template>
      <LoginForm
        :email="email"
        :password="password"
        :errors="errors"
        @update:email="email = $event"
        @update:password="password = $event"
        @blur:email="handleBlurEmail"
        @blur:password="handleBlurPassword"
        @sso-login="handleSsoLogin"
      />
    </AuthCardBanner>
  </AuthBackground>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import type { SsoProvider } from '@/constants/provider';
import type { LoginData } from '@/types/user';
import type { AxiosError } from 'axios';

import AuthBackground from '@/components/auth/AuthBackground.vue';
import AuthCardBanner from '@/components/auth/AuthCardBanner.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import { useAuth } from '@/composables/query/useAuth';
import { useFormError } from '@/composables/useFormError';
import { useFormValidation } from '@/composables/useFormValidation';
import { useAuthStore } from '@/stores/useAuthStore';
import { setAccessToken, setRefreshToken } from '@/utils/auth';
import { createLoginSchema } from '@/utils/schemas/loginSchema';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { login, ssoLogin } = useAuth();

const { handleSubmit, errors, isSubmitting } = useFormValidation<LoginData>(createLoginSchema(t), {
  email: '',
  password: '',
});

const { value: email, handleBlur: handleBlurEmail } = useField<string>('email');
const { value: password, handleBlur: handleBlurPassword } = useField<string>('password');

const isValid = computed(() => {
  return email.value && password.value && Object.keys(errors.value).length === 0;
});

const { errorMessage, handleError, setErrorMessage } = useFormError({
  statusCodes: [401],
  defaultErrorKey: t('error.login_failed'),
});

const resolveLoginErrorMessage = (message?: string) => {
  switch (message) {
    case 'AUTH_INVALID_CREDENTIALS':
      return t('message.auth.invalid_credentials');
    case 'AUTH_TOO_MANY_ATTEMPTS':
      return t('message.auth.too_many_attempts');
    case 'AUTH_EMAIL_UNVERIFIED':
      return t('message.auth.email_unverified');
    case 'AUTH_ACCOUNT_LOCKED':
      return t('message.auth.account_locked');
    default:
      return t('message.common.login_failed');
  }
};

const onSubmit = handleSubmit(async (values: LoginData) => {
  try {
    const { data: apiResponseData, success, message } = await login(values);

    // 登入失敗（例如 401），顯示對應錯誤訊息
    if (!success) {
      setErrorMessage(resolveLoginErrorMessage(message));
      authStore.resetAuthState();
      return;
    }

    if (success && apiResponseData) {
      const { access_token, refresh_token } = apiResponseData;
      setRefreshToken(refresh_token);
      setAccessToken(access_token);

      // 立即標記為已登入，避免導航守衛因未認證而攔截
      authStore.setAuth(true);

      const redirectParam = route.query.redirect;
      const redirectTo =
        typeof redirectParam === 'string' && redirectParam.length > 0
          ? redirectParam
          : '/planning/upload';

      await router.replace(redirectTo);
    }
  } catch (error) {
    handleError(error as AxiosError);
    authStore.resetAuthState();
  }
});

const handleSsoLogin = async (provider: SsoProvider) => {
  try {
    await ssoLogin(provider);
  } catch (error) {
    handleError(error as AxiosError);
  }
};
</script>
