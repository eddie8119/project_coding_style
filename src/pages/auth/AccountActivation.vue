<template>
  <AuthCard :loading="isLoading" :show-submit-button="false">
    <template #title>{{ t('title.account_activation') }}</template>

    <div v-if="activationStatus === 'success'" class="flex flex-col items-center">
      <img :src="check" alt="check" class="mb-4 h-16 w-16" />
      <p class="mb-4 text-lg">
        {{ t('message.dialog.activation_success') }}
      </p>
      <el-button
        type="primary"
        class="auth-brand-button w-full"
        @click="router.push({ name: 'login' })"
      >
        {{ t('button.login') }}
      </el-button>
    </div>

    <div v-else-if="activationStatus === 'error'" class="flex flex-col items-center">
      <img :src="close" alt="close" class="mb-4 h-16 w-16" />
      <p class="text-lg">{{ t('message.dialog.activation_error') }}</p>
      <p class="mb-4 text-sm text-secondary-red">
        {{ errorMessage }}
      </p>
      <el-button type="primary" class="auth-brand-button w-full" @click="reActivateAccount">
        {{ t('button.try_again') }}
      </el-button>
    </div>

    <div v-else class="text-center">
      <el-icon class="mb-4 animate-spin text-4xl text-blue-500">
        <Loading />
      </el-icon>
      <p class="text-lg">
        {{ t('message.dialog.activating') }}
      </p>
    </div>
  </AuthCard>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';
import { isAxiosError } from 'axios';
import { onActivated, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { usersApi } from '@/api/users';
import check from '@/assets/images/check.png';
import close from '@/assets/images/close.png';
import AuthCard from '@/components/auth/AuthCard.vue';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref<boolean>(false);
const errorMessage = ref<string>('');
const activationStatus = ref<'pending' | 'success' | 'error'>('pending');

const activateAccount = async () => {
  const { uid, token } = route.query;
  if (!uid || !token) {
    errorMessage.value = t('error.invalid_activation_link');
    activationStatus.value = 'error';
    return;
  }

  try {
    isLoading.value = true;
    await usersApi.activateAccount({
      uid: uid as string,
      token: token as string,
    });
    activationStatus.value = 'success';
  } catch (error) {
    if (isAxiosError(error)) {
      errorMessage.value = error.response?.data?.detail || t('error.activation_failed');
    } else {
      errorMessage.value = t('error.activation_failed');
    }
    activationStatus.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

const reActivateAccount = async () => {
  activationStatus.value = 'pending';
  const email = authStore.pendingActivationEmail;

  if (email) {
    await usersApi.resendActivation({
      email,
    });
    activationStatus.value = 'success';
  } else {
    activationStatus.value = 'error';
    errorMessage.value = t('error.invalid_activation_link');
  }
};

onActivated(() => {
  activateAccount();
});
</script>

<style lang="scss" scoped></style>
