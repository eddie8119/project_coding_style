/// <reference types="vite/client" />
import axios, { type AxiosRequestConfig, isAxiosError } from 'axios';

import router from '@/router';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  getAccessToken,
  getRefreshToken,
  isAccessTokenValid,
  isRefreshTokenValid,
  setAccessToken,
} from '@/utils/auth';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// 登出並清理（與 auth store 同步）
const logout = async () => {
  const authStore = useAuthStore();
  authStore.logout(); // 這會調用 resetAuthState() 清理 tokens 和狀態

  const currentRoute = router.currentRoute.value;

  // 如果目前路由 path 以 /auth 開頭則不執行 router.replace
  if (currentRoute.path.startsWith('/auth')) {
    return;
  }

  await router.replace({ name: 'login' });
};

// ========== Axios Instances ==========
const baseURL = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttprequest',
  },
});

// 創建一個專門用來刷新 token 的 axios 實例 post (不帶攔截器)
const refreshAxiosInstance = axios.create({
  baseURL,
});

// ========== Token Refresh Queue ==========
let isRefreshing = false; // 標記是否正在刷新 token
let refreshSubscribers: ((token: string) => void)[] = [];

// 機制確保了只會有第一個人去拿鑰匙（刷新 token），其他人則原地等待
// 不會自己也跑去櫃檯，而是在門口排隊，並把自己的聯絡方式（一個回呼函式）留給門口的服務生
const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

// 把新鑰匙逐一發給正在排隊的請求
const onTokenRefreshed = (token: string) => {
  // cb 就是那個等待中的函式 (newToken) => { ... }
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// ========== Request Interceptor ==========
instance.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 預先檢查並刷新過期的 token（在請求發送前）
instance.interceptors.request.use(
  async (config) => {
    // 如果 access token 已過期但 refresh token 有效，預先刷新
    if (!isAccessTokenValid() && isRefreshTokenValid()) {
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken && !isRefreshing) {
          isRefreshing = true;

          const { data } = await refreshAxiosInstance.post('/auth/token/refresh/', {
            refresh_token: refreshToken,
          });

          const { access_token } = data;
          setAccessToken(access_token);
          onTokenRefreshed(access_token);

          // 更新當前請求的 token
          config.headers.Authorization = `Bearer ${access_token}`;

          isRefreshing = false;
        }
      } catch (error) {
        isRefreshing = false;
        // 刷新失敗，讓響應攔截器處理 401
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const shouldBypassRefresh = (url?: string) => {
  if (!url) return false;
  const tryNormalizePath = (rawUrl: string) => {
    try {
      const parsed = new URL(rawUrl, baseURL);
      return parsed.pathname;
    } catch {
      return rawUrl;
    }
  };

  const path = tryNormalizePath(url);
  const bypassList = ['/auth/login', '/auth/logout', '/auth/sso', '/auth/token/refresh'];
  return bypassList.some((endpoint) => path.includes(endpoint));
};

instance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const isAuthEndpoint = shouldBypassRefresh(originalRequest?.url);

    // 如果是 401 錯誤且不是刷新 token 的請求
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            await logout();
            throw new Error('No refresh token');
          }

          // 使用不帶攔截器的 refreshAxiosInstance 來刷新 token
          const { data } = await refreshAxiosInstance.post('/auth/token/refresh/', {
            refresh_token: refreshToken,
          });

          const { access_token } = data;
          setAccessToken(access_token);

          // 當第一個請求（請求 A）成功拿到新的 access token 後
          onTokenRefreshed(access_token);
          // 用新鑰匙開門的動作
          return instance(originalRequest);
        } catch (refreshError: unknown) {
          // 當 refresh token 也過期時，後端會回傳 401
          if (isAxiosError(refreshError) && refreshError.response?.status === 401) {
            console.error('Refresh token expired, logging out:', refreshError);
            await logout();
          } else {
            console.error('Unable to refresh token for other reasons:', refreshError);
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // 這樣可以確保所有請求都使用同一個 token，避免多個請求使用不同 token 的問題
      return new Promise((resolve) => {
        // 如果正在刷新 token，將請求暫存起來
        // 這就是「留下聯絡方式」。它把一個函式（一個箭頭函式）放進 refreshSubscribers 這個「排隊列表」中。這個函式知道兩件事：
        subscribeTokenRefresh((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          resolve(instance(originalRequest));
        });
      });
    }

    // 將後端錯誤格式直接回傳給呼叫端（統一為 ApiResponse 風格）
    if (error.response?.data) {
      return error.response.data;
    }
    return Promise.reject(error);
  }
);

export default instance;

// 攔截器流程說明:
// 第一個請求攔截器：為每個請求從 localStorage 讀取最新的 token 並放入 header
// 第二個請求攔截器：預先檢查 token 有效性，如果 access token 過期但 refresh token 有效，主動刷新
// 響應攔截器：處理 API 回應，特別是 401 錯誤，並觸發 token 刷新流程（作為備用機制）
