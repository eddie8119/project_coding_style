<template>
  <AuthCard
    :error-message="errorMessage"
    :loading="isSubmitting"
    :message="showMessage"
    :is-invalid="!isValid"
    @submit="onSubmit"
  >
    <template #title> {{ t('title.reset_password') }} </template>
    <template #button-text> {{ t('button.reset_password') }} </template>
    <ResetPasswordForm
      :new-password="newPassword"
      :new-confirm-password="newConfirmPassword"
      :errors="errors"
      :error-message="errorMessage"
      @update:new-password="newPassword = $event"
      @update:new-confirm-password="newConfirmPassword = $event"
      @blur:new-password="handleBlurNewPassword"
      @blur:new-confirm-password="handleBlurNewConfirmPassword"
    />
  </AuthCard>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed, onActivated, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import type { ResetPasswordData } from '@/types/user';

import { usersApi } from '@/api/users';
import AuthCard from '@/components/auth/AuthCard.vue';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue';
import { useFormValidation } from '@/composables/useFormValidation';
import { resetPasswordSchema } from '@/utils/schemas/resetPasswordSchema';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const errorMessage = ref<string | undefined>(undefined);
const showMessage = ref<string | undefined>(undefined);
const token = ref<string | undefined>(undefined);

onActivated(() => {
  token.value = route.query.token as string;

  if (!token.value) {
    errorMessage.value = t('error.invalid_or_expired_token');
    setTimeout(() => {
      router.push({ name: 'forgot-password' });
    }, 3000);
  }
});

const { handleSubmit, errors, isSubmitting } = useFormValidation<
  Omit<ResetPasswordData, 'token' | 'uid'>
>(resetPasswordSchema, {
  newPassword: '',
  newConfirmPassword: '',
});

const { value: newPassword, handleBlur: handleBlurNewPassword } = useField<string>('newPassword');
const { value: newConfirmPassword, handleBlur: handleBlurNewConfirmPassword } =
  useField<string>('newConfirmPassword');

const isValid = computed(() => {
  return newPassword.value && newConfirmPassword.value && Object.keys(errors.value).length === 0;
});

const onSubmit = handleSubmit(async (values) => {
  const { uid, token } = route.query;

  try {
    errorMessage.value = undefined;
    await usersApi.resetPassword({
      newPassword: values.newPassword,
      newConfirmPassword: values.newConfirmPassword,
      token: token as string,
      uid: uid as string,
    });

    showMessage.value = t('success.password_reset_success');
    setTimeout(() => {
      router.push({ name: 'login' });
    }, 2000);
  } catch (error) {
    const err = error as { response?: { status: number; data: Record<string, string[]> } };
    if (err.response?.status === 400 && err.response?.data) {
      const errors = err.response.data;
      const errorMessages = Object.values(errors).flat().join('\n');
      errorMessage.value = errorMessages;
      if (errorMessages.includes('Token is invalid or expired')) {
        setTimeout(() => {
          router.push({ name: 'forgot-password' });
        }, 3000);
      }
    } else {
      errorMessage.value = t('error.reset_password_failed');
    }
  }
});
</script>
