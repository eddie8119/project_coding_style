<template>
  <AuthBackground>
    <AuthCard :show-logo="false" :show-submit-button="false">
      <template #title>{{ currentTitle }}</template>

      <div class="space-y-8 text-center">
        <p class="text-base text-gray-500">
          {{ currentMessage }}
        </p>

        <div class="flex flex-col items-center gap-8">
          <div
            class="relative flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-gray-200 bg-white"
          >
            <div
              class="flex h-20 w-20 items-center justify-center rounded-full"
              :class="statusClasses"
            >
              <svg
                v-if="isLoading"
                class="h-8 w-8 animate-spin text-brand-primary"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <img v-else-if="success" :src="check" alt="check" class="h-12 w-12 object-contain" />
              <img v-else :src="close" alt="close" class="h-12 w-12 object-contain" />
            </div>
            <div
              v-if="isLoading"
              class="bg-brand-primary/10 absolute inset-0 animate-pulse rounded-full"
            />
          </div>

          <div class="w-full space-y-4">
            <p v-if="error" class="rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-600">
              {{ error }}
            </p>
            <p v-else-if="success" class="rounded-2xl bg-green-50 px-5 py-3 text-sm text-green-700">
              {{ t('message.sso_success') }}
            </p>
            <p v-else class="rounded-2xl bg-gray-50 px-5 py-3 text-sm text-gray-600">
              {{ t('message.sso_processing') }}
            </p>
          </div>

          <TextButton
            v-if="error"
            class="font-medium"
            size="md"
            variant="primary"
            full-width
            @click="redirectToLogin"
          >
            {{ t('button.back_to_login') }}
          </TextButton>
        </div>
      </div>
    </AuthCard>
  </AuthBackground>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { authApi } from '@/api/auth';
import check from '@/assets/images/check.png';
import close from '@/assets/images/close.png';
import AuthBackground from '@/components/auth/AuthBackground.vue';
import AuthCard from '@/components/auth/AuthCard.vue';
import TextButton from '@/components/core/button/TextButton.vue';
import { SSO_PROVIDERS, type SsoProvider } from '@/constants/provider';
import { useAuthStore } from '@/stores/useAuthStore';
import { setAccessToken, setRefreshToken } from '@/utils/auth';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const error = ref<string | null>(null);
const success = ref(false);

const redirectToLogin = () => {
  router.replace('/auth/login');
};

const statusClasses = computed(() => {
  if (success.value) {
    return 'bg-green-50 text-green-600';
  }
  if (error.value) {
    return 'bg-red-50 text-red-500';
  }
  return 'bg-brand-primary/10 text-brand-primary';
});

const currentTitle = computed(() => {
  if (success.value) {
    return t('title.sso_success');
  }
  if (error.value) {
    return t('title.sso_error');
  }
  return t('title.sso_processing');
});

const currentMessage = computed(() => {
  if (success.value) {
    return t('message.sso_success');
  }
  if (error.value) {
    return error.value;
  }
  return t('message.sso_processing');
});

const formatErrorDescription = (description: string) => {
  try {
    return decodeURIComponent(description.replace(/\+/g, ' '));
  } catch {
    return description;
  }
};

const handleSsoCallback = async () => {
  try {
    const { provider, error: oauthError, error_description: oauthErrorDescription } = route.query;

    if (oauthError) {
      const description =
        typeof oauthErrorDescription === 'string'
          ? formatErrorDescription(oauthErrorDescription)
          : null;

      error.value = description || t('message.sso.oauth_error', { error: String(oauthError) });
      return;
    }

    if (!provider) {
      throw new Error(t('message.sso.missing_params'));
    }

    if (typeof provider !== 'string') {
      throw new Error(t('message.sso.invalid_format'));
    }

    if (!SSO_PROVIDERS.includes(provider as SsoProvider)) {
      throw new Error(t('message.sso.unsupported_provider'));
    }

    // 從 URL hash 解析 Supabase 回傳的 access_token / refresh_token
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (!accessToken) {
      throw new Error(t('message.sso.missing_params'));
    }

    const response = await authApi.ssoCallback(provider as SsoProvider, {
      accessToken,
      refreshToken,
    });

    if (response.success && response.data) {
      const { access_token, refresh_token } = response.data;

      setRefreshToken(refresh_token);
      setAccessToken(access_token);
      authStore.setAuth(true);

      success.value = true;

      // 延遲跳轉以顯示成功訊息
      setTimeout(() => {
        const redirectParam = route.query.state;
        const redirectTo =
          typeof redirectParam === 'string' && redirectParam.length > 0
            ? redirectParam
            : '/planning/upload';
        router.replace(redirectTo);
      }, 2000);
    } else {
      throw new Error(response.message || t('message.sso.login_failed'));
    }
  } catch (err) {
    console.error('SSO callback error:', err);
    error.value = err instanceof Error ? err.message : t('message.sso.generic_error');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  handleSsoCallback();
});
</script>
