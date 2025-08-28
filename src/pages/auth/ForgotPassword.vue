<template>
  <AuthCard
    :error-message="errorMessage"
    :message="showMessage"
    :loading="isSubmitting"
    :is-invalid="!isValid"
    @submit="onSubmit"
  >
    <template #title> {{ t('title.forgot_password') }} </template>
    <template #button-text> {{ t('button.send_reset_email') }} </template>
    <ForgotPasswordForm
      :email="email"
      :errors="errors"
      @update:email="email = $event"
      @blur:email="handleBlurEmail"
    />
  </AuthCard>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ForgotPasswordData } from '@/types/user';
import type { AxiosError } from 'axios';

import { usersApi } from '@/api/users';
import AuthCard from '@/components/auth/AuthCard.vue';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue';
import { useFormError } from '@/composables/useFormError';
import { useFormValidation } from '@/composables/useFormValidation';
import { forgotPasswordSchema } from '@/utils/schemas/forgotPasswordSchema';

const { t } = useI18n();
const showMessage = ref<string>('');

const { handleSubmit, errors, isSubmitting } = useFormValidation<ForgotPasswordData>(
  forgotPasswordSchema,
  {
    email: '',
  }
);

const { value: email, handleBlur: handleBlurEmail } = useField<string>('email');

const isValid = computed(() => {
  return email.value && Object.keys(errors.value).length === 0;
});

const { errorMessage, handleError } = useFormError({
  statusCodes: [400],
  defaultErrorKey: t('error.reset_password_failed'),
});

const onSubmit = handleSubmit(async (values) => {
  try {
    await usersApi.forgotPassword(values as unknown as ForgotPasswordData);
    showMessage.value = t('message.dialog.check_the_email');
  } catch (error) {
    handleError(error as AxiosError);
  }
});
</script>
