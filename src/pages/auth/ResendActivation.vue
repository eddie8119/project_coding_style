<template>
  <AuthCard
    :error-message="errorMessage"
    :message="showMessage"
    :loading="isSubmitting"
    :is-invalid="!isValid || resendCooldown > 0"
    @submit="onSubmit"
  >
    <template #title>
      {{ t('title.resend_activation') }}
    </template>
    <template #button-text>
      {{ t('button.resend') }}
    </template>

    <el-form>
      <el-form-item :error="errors.email">
        <el-input
          v-model="email"
          type="email"
          :placeholder="t('placeholder.auth.email')"
          @blur="handleBlurEmail"
        />
      </el-form-item>
    </el-form>
  </AuthCard>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed, onActivated, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import type { ResendActivationData } from '@/types/user';
import type { AxiosError } from 'axios';

import { usersApi } from '@/api/users';
import AuthCard from '@/components/auth/AuthCard.vue';
import { useFormError } from '@/composables/useFormError';
import { useFormValidation } from '@/composables/useFormValidation';
import { resendActivationSchema } from '@/utils/schemas/resendActivationSchema';

const { t } = useI18n();
const route = useRoute();

const showMessage = ref<string>('');
const resendCooldown = ref<number>(0);

const { handleSubmit, errors, isSubmitting } = useFormValidation<ResendActivationData>(
  resendActivationSchema,
  {
    email: '',
  }
);

const { value: email, handleBlur: handleBlurEmail } = useField<string>('email');

const getEmail = (): void => {
  if (route.query.email) {
    email.value = route.query.email as string;
  }
};

onActivated(() => {
  getEmail();
});

const startCooldown = () => {
  resendCooldown.value = 60;
  const timer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

const isValid = computed(() => {
  return email.value && Object.keys(errors.value).length === 0;
});

const { errorMessage, handleError, setErrorMessage } = useFormError({
  statusCodes: [400],
  defaultErrorKey: t('error.resend_activation_failed'),
});

const onSubmit = handleSubmit(async (values) => {
  if (resendCooldown.value > 0) {
    setErrorMessage(
      t('message.error.please_wait_before_resend', { seconds: resendCooldown.value })
    );
    return;
  }

  try {
    const response = await usersApi.resendActivation(values as unknown as ResendActivationData);
    if (response.status === 200) {
      showMessage.value = t('message.dialog.check_the_email');
      startCooldown();
    }
  } catch (error) {
    handleError(error as AxiosError);
  }
});
</script>
