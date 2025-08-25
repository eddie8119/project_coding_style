/// <reference types="vite/client" />
import axios, { type AxiosRequestConfig } from 'axios';

import router from '@/router';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

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

// 請求攔截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器
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

// 登出並清理
const logout = async () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  router.replace({ name: 'login' });
};

instance.interceptors.response.use(
  (response) => {
    return response;
    // 這裡沒有用 response.data 因為後端傳來的結構有的並沒有包在data下;
  },
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // 如果是 401 錯誤且不是刷新 token 的請求
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (!refreshToken) {
            logout();
            throw new Error('No refresh token');
          }

          // 使用不帶攔截器的 refreshAxiosInstance 來刷新 token
          const response = await refreshAxiosInstance.post('/auth/token/refresh/', {
            refresh: refreshToken,
          });
          const { access } = response.data;

          localStorage.setItem('access_token', access);

          // 當第一個請求（請求 A）成功拿到新的 access token 後
          onTokenRefreshed(access);
          // 用新鑰匙開門的動作
          return instance(originalRequest);
        } catch (refreshError) {
          console.error('Unable to refresh token:', refreshError);
          await logout();
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

    return Promise.reject(error);
  }
);

export default instance;

// 讓攔截器職責單一:
// 請求攔截器：它的唯一職責應該是「為每個即將發出的請求，從 localStorage 讀取最新的 token 並放入 header」。
// 響應攔截器：它的職責是「處理 API 回應，特別是 401 錯誤，並觸發 token 刷新流程」。
