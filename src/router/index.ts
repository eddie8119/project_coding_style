import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import AppLayout from '@/layouts/AppLayout.vue';
import { useAuthStore } from '@/stores/auth';
import { cleanupAllAnimations } from '@/utils/three/AnimationController';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/404.vue'),
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('../pages/auth/Login.vue'),
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('../pages/auth/Register.vue'),
      },
      {
        path: 'account-activation',
        name: 'account-activation',
        component: () => import('../pages/auth/AccountActivation.vue'),
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('../pages/auth/ForgotPassword.vue'),
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('../pages/auth/ResetPassword.vue'),
      },
      {
        path: 'resend-activation',
        name: 'resend-activation',
        component: () => import('../pages/auth/ResendActivation.vue'),
      },
    ],
  },
  {
    path: '/',
    component: AppLayout,
    redirect: { name: 'overview' },
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../pages/protected/dashboard/index.vue'),
      },
      {
        name: 'entitySearch',
        path: 'entity-search',
        component: () => import('../pages/protected/entity-search/index.vue'),
        // 動態路由參數使用下劃線，是最佳實踐，需要和 params 保持一致
        // 一般路徑：使用連字符（-） 是最佳實踐
        children: [
          {
            name: 'overviewEntity',
            path: 'overview',
            component: () => import('../pages/protected/overview-entity/index.vue'),
          },
        ],
      },
      {
        name: 'devices',
        path: 'devices',
        component: () => import('../pages/protected/devices/index.vue'),
      },
      {
        name: 'overview',
        path: 'overview',
        component: () => import('../pages/protected/overview/index.vue'),
      },
    ],
  },
  {
    path: '/user',
    component: AppLayout,
    children: [
      {
        name: 'user-edit',
        path: 'edit',
        component: () => import('../pages/protected/user/index.vue'),
        redirect: { name: 'user-profile' },
        children: [
          {
            name: 'user-profile',
            path: 'profile',
            component: () => import('../pages/protected/user/profile.vue'),
          },
          {
            name: 'user-edit-profile',
            path: 'edit-profile',
            component: () => import('../pages/protected/user/edit-profile.vue'),
          },
          {
            name: 'user-change-password',
            path: 'change-password',
            component: () => import('../pages/protected/user/change-password.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/scout',
    component: AppLayout,
    children: [
      {
        name: 'scout-real-time',
        path: 'real-time',
        component: () => import('../pages/protected/scout/real-time.vue'),
      },
      {
        name: 'scout-record',
        path: 'record',
        component: () => import('../pages/protected/scout/record.vue'),
      },
    ],
  },
  {
    path: '/management',
    component: AppLayout,
    children: [
      {
        name: 'set-member',
        path: 'set-member',
        component: () => import('../pages/protected/management/SetMember.vue'),
      },
    ],
  },
  {
    path: '/observation',
    component: AppLayout,
    children: [
      {
        path: ':observationType',
        component: () => import('../pages/protected/observation/index.vue'),
        props: true,
        redirect: (to) => {
          return {
            name: 'observation-devices',
            params: { observationType: to.params.observationType },
          };
        },
        children: [
          {
            name: 'observation-devices',
            path: 'devices',
            component: () => import('../pages/protected/observation/devices.vue'),
            props: true,
          },
          {
            name: 'observation-alarm-setting',
            path: 'alarm-setting',
            component: () => import('../pages/protected/observation/alarm-setting.vue'),
            props: true,
          },
          {
            name: 'observation-alarm-history',
            path: 'alarm-history',
            component: () => import('../pages/protected/observation/alarm-history.vue'),
            props: true,
          },
          {
            name: 'observation-reagent',
            path: 'reagent',
            component: () => import('../pages/protected/observation/reagent.vue'),
            props: true,
          },
          {
            name: 'observation-device',
            path: 'device/:id',
            component: () => import('../pages/protected/observation/device.vue'),
            props: true,
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  // 清理所有動畫控制器，防止背景資源洩漏
  cleanupAllAnimations();

  const authStore = useAuthStore();

  const publicPages = ['/auth/login', '/auth/register', '/auth/forgot-password'];
  const isPublicPage = publicPages.includes(to.path);

  if (!isPublicPage && !authStore.isAuthenticated) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
  }

  if (authStore.isAuthenticated && isPublicPage) {
    return next({ name: 'overview' });
  }

  // isAdmin 是 Vue 的 ComputedRef 物件，而不是一個單純的布林值。
  // 在 JavaScript 中，任何物件（包括 ComputedRef 物件）在布林判斷中都會被視為 true

  next();
});

export default router;
