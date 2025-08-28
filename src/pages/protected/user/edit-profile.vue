<template>
  <div class="mx-auto max-w-md">
    <AuthCard
      :error-message="errorMessage"
      :loading="isSubmitting"
      :show-logo="false"
      @submit="onSubmit"
    >
      <template #button-text> {{ t('button.edit_profile') }} </template>
      <EditProfileForm
        :errors="errors"
        :username="username"
        @update:username="username = $event"
        @blur:username="handleBlurUsername"
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
import EditProfileForm from '@/components/auth/EditProfileForm.vue';
import { type EditProfileData } from '@/types/user';
import { editProfileSchema } from '@/utils/schemas/editProfile';

const errorMessage = ref('');

const { t } = useI18n();
const { handleSubmit, errors, isSubmitting, resetForm } = useForm<EditProfileData>({
  validationSchema: toTypedSchema(editProfileSchema),
  initialValues: {
    username: '',
  },
});

const { value: username, handleBlur: handleBlurUsername } = useField<string>('username');

const onSubmit = handleSubmit(async (values: EditProfileData) => {
  try {
    const response = await usersApi.updateUserProfile(values);

    if (response.status === 200) {
      ElMessage.success(t('message.change_password_success'));
      resetForm();
    }
  } catch (error) {}
});
</script>
