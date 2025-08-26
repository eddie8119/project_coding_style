/**
 * 用於提供身份驗證相關功能，包括登出和個人資料重置。
 * 管理身份驗證下拉選單的狀態和操作。
 *
 * @returns {Object}
 * @returns {Ref<string>} currentAuthentication - 當前選中的身份驗證選項
 * @returns {AuthenticationItem[]} authentications - 可用的身份驗證選項列表
 * @returns {Function} handleAuthenticationChange - 處理身份驗證選項變更
 */

import { ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';

import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/auth';

interface AuthenticationItem {
  code: string;
  label: string;
  action: () => void;
}

interface UseAuthenticationReturn {
  currentAuthentication: Ref<string>;
  authentications: AuthenticationItem[];
  handleAuthenticationChange: (value: string) => void;
}

export const useAuthentication = (): UseAuthenticationReturn => {
  const currentAuthentication = ref<string>('');

  const router = useRouter();

  const resetProfileAction = () => {
    router.push({ name: 'user-profile' });
  };

  const logoutAction = async () => {
    const authStore = useAuthStore();
    const refresh_token = localStorage.getItem('refresh_token');
    try {
      if (refresh_token) {
        await authApi.logout({ refreshToken: refresh_token });
      }
    } catch (error) {
      console.warn('Revoke token failed:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('access_role');
      authStore.logout();
      router.replace({ name: 'login' });
    }
  };

  const authentications: AuthenticationItem[] = [
    { code: 'user', label: 'user', action: resetProfileAction },
    { code: 'logout', label: 'logout', action: logoutAction },
  ];

  const handleAuthenticationChange = (value: string) => {
    currentAuthentication.value = value;
  };

  return {
    currentAuthentication,
    authentications,
    handleAuthenticationChange,
  };
};
