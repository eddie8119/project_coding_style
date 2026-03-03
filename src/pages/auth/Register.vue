<template>
  <AuthBackground>
    <AuthCardBanner
      :error-message="errorMessage"
      :message="showMessage"
      :loading="isSubmitting"
      :is-invalid="!isValid"
      @submit="onSubmit"
    >
      <template #title> {{ t('title.register') }} KaiJi! </template>
      <template #button-text> {{ t('button.register') }} </template>
      <RegisterForm
        :name="name"
        :email="email"
        :password="password"
        :confirm-password="confirmPassword"
        :errors="errors"
        @update:name="name = $event"
        @update:email="email = $event"
        @update:password="password = $event"
        @update:confirm-password="confirmPassword = $event"
        @blur:name="handleBlurName"
        @blur:email="handleBlurEmail"
        @blur:password="handleBlurPassword"
        @blur:confirm-password="handleBlurConfirmPassword"
        @sso-login="handleSsoLogin"
      />
    </AuthCardBanner>

    <!-- 白名單提示彈窗 -->
    <ElDialog
      v-model="showWhitelistDialog"
      width="420px"
      :close-on-click-modal="false"
      align-center
    >
      <template #title>
        {{ t('title.register') }}
      </template>

      <p class="text-center text-base leading-relaxed">
        {{ t('message.dialog.whitelist_notice') }}
      </p>
    </ElDialog>
  </AuthBackground>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { SsoProvider } from '@/constants/provider';
import type { RegisterData } from '@/types/user';
import type { AxiosError } from 'axios';

import AuthBackground from '@/components/auth/AuthBackground.vue';
import AuthCardBanner from '@/components/auth/AuthCardBanner.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
import { useAuth } from '@/composables/query/useAuth';
import { useUser } from '@/composables/query/useUser';
import { useFormError } from '@/composables/useFormError';
import { useFormValidation } from '@/composables/useFormValidation';
import router from '@/router';
import { useAuthStore } from '@/stores/useAuthStore';
import { createRegisterSchema } from '@/utils/schemas/registerSchema';

const { t } = useI18n();
const authStore = useAuthStore();

const showMessage = ref<string | undefined>(undefined);
const showWhitelistDialog = ref(false);

const { handleSubmit, errors, isSubmitting } = useFormValidation<RegisterData>(
  createRegisterSchema(t),
  {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  }
);

const { value: name, handleBlur: handleBlurName } = useField<string>('name');
const { value: email, handleBlur: handleBlurEmail } = useField<string>('email');
const { value: password, handleBlur: handleBlurPassword } = useField<string>('password');
const { value: confirmPassword, handleBlur: handleBlurConfirmPassword } =
  useField<string>('confirmPassword');

const isValid = computed(() => {
  return (
    name.value &&
    email.value &&
    password.value &&
    confirmPassword.value &&
    Object.keys(errors.value).length === 0
  );
});

const { errorMessage, handleError } = useFormError({
  statusCodes: [400, 409],
  defaultErrorKey: t('error.register_failed'),
});

const { register } = useUser();
const { ssoLogin } = useAuth();

const onSubmit = handleSubmit(async (values: RegisterData) => {
  if (password.value !== confirmPassword.value) return;

  try {
    const { success, message } = await register(values);
    if (!success) {
      // 若為白名單限制錯誤，顯示體驗名單提示彈窗
      if (message === 'Access denied. This email is not whitelisted.') {
        showWhitelistDialog.value = true;
        showMessage.value = undefined;
      } else {
        showMessage.value = message;
      }
      return;
    }
    if (success) {
      showMessage.value = t('message.dialog.check_the_email');
      authStore.setPendingActivationEmail(email.value);

      // 註冊成功，導向註冊成功頁面
      setTimeout(() => {
        router.push({
          name: 'registration-success',
          query: {
            email: email.value,
          },
        });
      }, 500);
    }
  } catch (error) {
    handleError(error as AxiosError);
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
