<template>
  <AuthCard
    :error-message="errorMessage"
    :message="showMessage"
    :loading="isSubmitting"
    :is-invalid="!isValid"
    @submit="onSubmit"
  >
    <template #title> {{ t('title.register') }} HSWE IoT! </template>
    <template #button-text> {{ t('button.register') }} </template>
    <RegisterForm
      :email="email"
      :password="password"
      :confirm-password="confirmPassword"
      :errors="errors"
      @update:email="email = $event"
      @update:password="password = $event"
      @update:confirm-password="confirmPassword = $event"
      @blur:email="handleBlurEmail"
      @blur:password="handleBlurPassword"
      @blur:confirm-password="handleBlurConfirmPassword"
    />
  </AuthCard>
</template>

<script setup lang="ts">
import { isAxiosError } from 'axios';
import { useField } from 'vee-validate';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { RegisterData } from '@/types/user';
import type { AxiosError } from 'axios';

import { usersApi } from '@/api/users';
import AuthCard from '@/components/auth/AuthCard.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
import { useFormError } from '@/composables/useFormError';
import { useFormValidation } from '@/composables/useFormValidation';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { registerSchema } from '@/utils/schemas/registerSchema';

const { t } = useI18n();
const authStore = useAuthStore();

const showMessage = ref<string>('');
const verifiedStatus = {
  UNVERIFIED: '0',
  VERIFIED: '1',
};

const { handleSubmit, errors, isSubmitting } = useFormValidation<RegisterData>(registerSchema, {
  email: '',
  password: '',
  confirmPassword: '',
});

const { value: email, handleBlur: handleBlurEmail } = useField<string>('email');
const { value: password, handleBlur: handleBlurPassword } = useField<string>('password');
const { value: confirmPassword, handleBlur: handleBlurConfirmPassword } =
  useField<string>('confirmPassword');

const isValid = computed(() => {
  return (
    email.value && password.value && confirmPassword.value && Object.keys(errors.value).length === 0
  );
});

const { errorMessage, handleError, setErrorMessage } = useFormError({
  statusCodes: [400],
  defaultErrorKey: t('error.register_failed'),
});

const onSubmit = handleSubmit(async (values) => {
  if (password.value !== confirmPassword.value) return;

  try {
    await usersApi.register(values as unknown as RegisterData);

    showMessage.value = t('message.dialog.check_the_email');
    authStore.setPendingActivationEmail(email.value);
  } catch (error) {
    if (isAxiosError(error)) {
      const emailMessage = error?.response?.data?.email;
      const { verified } = emailMessage;

      if (verified === verifiedStatus.UNVERIFIED) {
        setErrorMessage(t('message.dialog.email_not_verified'));

        setTimeout(() => {
          router.push({
            name: 'resend-activation',
            query: {
              email: email.value,
              from: 'register',
            },
          });
        }, 3000);
      } else {
        handleError(error as AxiosError);
      }
    }
  }
});
</script>
