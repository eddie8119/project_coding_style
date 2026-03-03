import { useMutation } from '@tanstack/vue-query';
import { type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { SsoProvider } from '@/constants/provider';
import type { ApiResponse } from '@/types/request';
import type { AuthResponse } from '@/types/response';
import type { LoginData } from '@/types/user';

import { authApi } from '@/api/auth';

interface UseAuthReturn {
  // 登入
  login: (data: LoginData) => Promise<ApiResponse<AuthResponse>>;
  isLoggingIn: Ref<boolean>;
  loginError: Ref<Error | null>;
  // SSO 登入
  ssoLogin: (provider: SsoProvider) => Promise<void>;
  isSsoLoggingIn: Ref<boolean>;
  ssoError: Ref<Error | null>;
}

export function useAuth(): UseAuthReturn {
  const { t } = useI18n();

  // ==================== 登入 ====================
  const {
    mutateAsync: mutateLogin,
    isPending: isLoggingIn,
    error: loginError,
  } = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await authApi.login(data);
      return response;
    },
    retry: false, // 不自動重試
  });

  const login = async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    try {
      const result = (await mutateLogin(data)) as ApiResponse<AuthResponse>;
      if (!result.success) {
        return {
          success: false,
          data: result.data,
          message: result.code ?? result.message,
        };
      }
      return result;
    } catch (err: unknown) {
      console.error('登入失敗:', err);
      return { success: false, message: t('message.error.login') };
    }
  };

  // ==================== SSO 登入 ====================
  const {
    mutateAsync: mutateSsoLogin,
    isPending: isSsoLoggingIn,
    error: ssoError,
  } = useMutation({
    mutationFn: async (provider: SsoProvider) => {
      const response = await authApi.ssoLogin(provider);
      return response;
    },
    retry: false,
  });

  const ssoLogin = async (provider: SsoProvider): Promise<void> => {
    try {
      const response = (await mutateSsoLogin(provider)) as ApiResponse<{ url: string }>;
      if (response.success && response.data?.url) {
        // 重定向到 SSO 提供商的授權頁面
        window.location.href = response.data.url;
        return;
      }

      const errorMessage = response.message || t('message.error.login');
      throw new Error(errorMessage);
    } catch (err: unknown) {
      console.error('SSO 登入失敗:', err);
      throw err;
    }
  };

  return {
    // 登入
    login,
    isLoggingIn,
    loginError,
    // SSO 登入
    ssoLogin,
    isSsoLoggingIn,
    ssoError,
  };
}
