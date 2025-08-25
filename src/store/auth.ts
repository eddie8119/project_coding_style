import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    role: null as 'admin' | 'user' | null,
    pendingActivationEmail: null as string | null,
  }),

  actions: {
    setAuth(status: boolean) {
      this.isAuthenticated = status;
    },

    setUser(role: 'admin' | 'user' | null) {
      this.role = role;
    },

    setPendingActivationEmail(email: string | null) {
      this.pendingActivationEmail = email;
    },

    resetAuthState() {
      this.setAuth(false);
      this.setUser(null);
      this.setPendingActivationEmail(null);
      localStorage.removeItem('access_token');
    },

    initializeAuthState() {
      const accessToken = localStorage.getItem('access_token');
      this.isAuthenticated = !!accessToken;
    },

    // 登入成功時呼叫
    login(role: 'admin' | 'user') {
      this.setAuth(true);
      this.setUser(role);
    },

    // 登出時呼叫
    logout() {
      this.resetAuthState();
    },
  },
});

// token 存在 store 中
// 安全 JWT Token 本身是設計來放在前端

// 用 jwtDecode 解析而不在 store 存 token 是比較好的做法
// 安全性：
// token 只存在 localStorage，減少暴露在記憶體中的時間
// 需要時才解析，不會持續存在記憶體中
// 狀態管理：
// 單一數據來源：token 只存在 localStorage 一個地方
// 避免同步問題：不用擔心 store 和 localStorage 的 token 不一致
// 效能：
// 減少記憶體使用：不需要在 store 中保存重複的數據
// 按需解析：只在需要時才解析 token
// 維護性：
// 程式碼更清晰：token 的存取都通過特定方法
