import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import AppLayout from '@/layouts/AppLayout.vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { isAccessTokenValid } from '@/utils/auth';
import { syncDocumentMeta } from '@/utils/seoMeta';

const globalUiMeta = {
  showFab: true,
  showQuickDraft: true,
  showQuickPlan: true,
  showNotification: true,
} as const;

const hiddenUiMeta = {
  showFab: false,
  showQuickDraft: false,
  showQuickPlan: false,
  showNotification: false,
} as const;

const routes: Array<RouteRecordRaw> = [
  {
    path: '/en',
    name: 'english-landing',
    component: () => import('../pages/public/english-landing.vue'),
    meta: {
      public: true,
      ...hiddenUiMeta,
      seo: {
        titleKey: 'meta.routes.englishLanding.title',
        descriptionKey: 'meta.routes.englishLanding.description',
      },
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../pages/404.vue'),
    meta: hiddenUiMeta,
  },
  {
    path: '/shared/project/:id',
    name: 'shared-project',
    component: () => import('../pages/public/shared-project.vue'),
    meta: { public: true, ...hiddenUiMeta },
  },
  {
    path: '/invitation/accept',
    name: 'invitation-accept',
    component: () => import('../views/invitation-accept.vue'),
    meta: { public: true, ...hiddenUiMeta },
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('../layouts/AuthLayout.vue'),
    meta: hiddenUiMeta,
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
        path: 'registration-success',
        name: 'registration-success',
        component: () => import('../pages/auth/RegistrationSuccess.vue'),
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
      {
        path: 'sso/callback',
        name: 'sso-callback',
        component: () => import('../pages/auth/SsoCallback.vue'),
      },
    ],
  },
  {
    path: '/',
    component: AppLayout,
    meta: globalUiMeta,
    redirect: { name: 'planning-upload' },
    children: [
      {
        name: 'overview',
        path: 'overview',
        component: () => import('../pages/protected/overview/index.vue'),
        meta: {
          ...globalUiMeta,
          seo: {
            titleKey: 'meta.routes.overview.title',
            descriptionKey: 'meta.routes.overview.description',
          },
        },
      },
      {
        name: 'schedule',
        path: 'schedule',
        component: () => import('../pages/protected/schedule/index.vue'),
        meta: {
          ...globalUiMeta,
          seo: {
            titleKey: 'meta.routes.schedule.title',
            descriptionKey: 'meta.routes.schedule.description',
          },
        },
      },
    ],
  },
  {
    path: '/user',
    component: AppLayout,
    meta: globalUiMeta,
    children: [
      {
        name: 'user',
        path: '',
        component: () => import('../pages/protected/user/index.vue'),
        redirect: { name: 'profile' },
        children: [
          {
            name: 'profile',
            path: 'profile',
            component: () => import('../pages/protected/user/profile.vue'),
          },
          {
            name: 'change-password',
            path: 'change-password',
            component: () => import('../pages/protected/user/ChangePassword.vue'),
          },
          {
            name: 'pricing-menu',
            path: 'pricing-menu',
            component: () => import('../pages/protected/user/pricing-menu.vue'),
          },
          {
            name: 'subscription',
            path: 'subscription',
            component: () => import('../pages/protected/user/subscription.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/planning',
    component: AppLayout,
    meta: globalUiMeta,
    children: [
      {
        path: '',
        component: () => import('../pages/protected/planning/index.vue'),
        redirect: { name: 'planning-upload' },
        children: [
          {
            name: 'planning-upload',
            path: 'upload',
            component: () => import('../pages/protected/planning/upload.vue'),
          },
        ],
      },
    ],
  },
  {
    path: '/todo',
    component: AppLayout,
    meta: globalUiMeta,
    children: [
      {
        path: '',
        component: () => import('../pages/protected/todo/index.vue'),
        children: [
          {
            path: '',
            redirect: { name: 'todo-projects' },
          },
          {
            name: 'todo-projects',
            path: 'projects',
            component: () => import('../pages/protected/todo/projects.vue'),
          },
          {
            name: 'todo-floor-plan',
            path: 'plan/:id',
            component: () => import('../pages/protected/todo/floor-plan.vue'),
          },
          {
            name: 'todo-project',
            path: 'project/:id',
            component: () => import('../pages/protected/todo/project.vue'),
          },
        ],
      },
      {
        name: 'quick_draft',
        path: 'quick_draft',
        component: () => import('../pages/protected/draft/index.vue'),
        meta: { showQuickDraft: false },
      },
    ],
  },
  {
    path: '/setting',
    component: AppLayout,
    meta: globalUiMeta,
    children: [
      {
        name: 'common',
        path: 'common',
        component: () => import('../pages/protected/setting/index.vue'),
        redirect: { name: 'all' },
        children: [
          {
            name: 'all',
            path: 'all',
            component: () => import('../pages/protected/setting/common.vue'),
          },
        ],
      },
      {
        name: 'member',
        path: 'member',
        component: () => import('../pages/protected/setting/member.vue'),
      },
    ],
  },
  {
    path: '/other',
    component: AppLayout,
    meta: globalUiMeta,
    children: [
      {
        name: 'help_center',
        path: 'help_center',
        component: () => import('../pages/protected/other/help-center.vue'),
      },
      {
        name: 'teaching',
        path: 'teaching',
        component: () => import('../pages/protected/other/teaching.vue'),
      },
    ],
  },
  // {
  //   path: '/notifications',
  //   component: AppLayout,
  //   children: [
  //     {
  //       name: 'notifications',
  //       path: '',
  //       component: () => import('../views/notification-view.vue'),
  //     },
  //   ],
  // },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  const publicPages = [
    '/en',
    '/auth/login',
    '/auth/register',
    '/auth/account-activation',
    '/auth/registration-success',
    '/auth/resend-activation',
    '/auth/sso/callback',
    '/auth/reset-password',
    '/auth/forgot-password',
  ];
  const isPublicPage = publicPages.includes(to.path);

  // Allow Supabase recovery callback to pass through and redirect to reset-password
  // Supabase appends tokens in the URL hash like: #access_token=...&type=recovery
  const isSupabaseRecovery = typeof to.hash === 'string' && to.hash.includes('type=recovery');
  if (isSupabaseRecovery && to.name !== 'reset-password') {
    return next({ name: 'reset-password', hash: to.hash });
  }

  // 檢查是否為受保護的頁面
  if (!isPublicPage) {
    // 驗證 token 是否有效
    if (!authStore.isAuthenticated || !isAccessTokenValid()) {
      // Token 無效或過期，清理狀態並重定向到登入頁
      authStore.logout();
      return next({
        name: 'login',
        query: { redirect: to.fullPath },
      });
    }
  }

  // 已登入用戶訪問公開頁面，重定向到首頁
  if (authStore.isAuthenticated && isPublicPage && to.name !== 'reset-password') {
    return next({ name: 'planning-upload' });
  }

  next();
});

router.afterEach((to) => {
  syncDocumentMeta(to);
});

export default router;
