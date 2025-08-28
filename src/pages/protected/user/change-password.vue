<template>
  <div class="mx-auto max-w-md">
    <AuthCard
      :error-message="errorMessage"
      :loading="isSubmitting"
      :show-logo="false"
      @submit="onSubmit"
    >
      <template #button-text> {{ t('button.change_password') }} </template>
      <ChangePasswordForm
        :old-password="oldPassword"
        :new-password="newPassword"
        :new-confirm-password="newConfirmPassword"
        :errors="errors"
        @update:old-password="oldPassword = $event"
        @update:new-password="newPassword = $event"
        @update:new-confirm-password="newConfirmPassword = $event"
        @blur:old-password="handleBlurOldPassword"
        @blur:new-password="handleBlurNewPassword"
        @blur:new-confirm-password="handleBlurNewConfirmPassword"
      />
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { ElMessage } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { usersApi } from '@/api/users';
import AuthCard from '@/components/auth/AuthCard.vue';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm.vue';
import { type ChangePasswordData } from '@/types/user';
import { changePasswordSchema } from '@/utils/schemas/changePasswordSchema';

const errorMessage = ref<string>('');

const { t } = useI18n();
const { handleSubmit, errors, isSubmitting, resetForm } = useForm<ChangePasswordData>({
  validationSchema: toTypedSchema(changePasswordSchema),
  initialValues: {
    oldPassword: '',
    newPassword: '',
    newConfirmPassword: '',
  },
});

const { value: oldPassword, handleBlur: handleBlurOldPassword } = useField<string>('oldPassword');
const { value: newPassword, handleBlur: handleBlurNewPassword } = useField<string>('newPassword');
const { value: newConfirmPassword, handleBlur: handleBlurNewConfirmPassword } =
  useField<string>('newConfirmPassword');

const onSubmit = handleSubmit(async (values: ChangePasswordData) => {
  try {
    await usersApi.changePassword(values);

    ElMessage.success(t('message.change_password_success'));
    resetForm();
  } catch (error) {
    const err = error as { response?: { status: number; data: Record<string, string[]> } };
    if (err.response?.status === 400 && err.response?.data) {
      const errors = err.response.data;
      const errorMessages = Object.values(errors).flat().join('\n');
      errorMessage.value = errorMessages;
    } else {
      errorMessage.value = t('error.change_password_failed');
    }
  }
});
</script>
