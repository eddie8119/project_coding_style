<template>
  <RouterView />
  <QuickDraftSlide v-if="shouldShowQuickDraft" />
  <QuickPlanSlide v-if="shouldShowQuickPlan" />
  <Fab v-if="shouldShowFab" />
  <NotificationSlide v-if="shouldShowNotification" />
</template>

<script setup lang="ts">
import { defineAsyncComponent, provide } from 'vue';

import { useGlobalUI } from '@/composables/ui/useGlobalUI';
import { useAuthStore } from '@/stores/useAuthStore';

const Fab = defineAsyncComponent(() => import('@/components/core/button/Fab.vue'));
const QuickDraftSlide = defineAsyncComponent(
  () => import('@/components/core/slide/QuickDraftSlide.vue')
);
const QuickPlanSlide = defineAsyncComponent(
  () => import('@/components/core/slide/QuickPlanSlide.vue')
);
const NotificationSlide = defineAsyncComponent(
  () => import('@/components/notification/NotificationSlide.vue')
);

// Initialize global state
const authStore = useAuthStore();
authStore.initializeAuthState();

// Global UI logic
const {
  isDarkMode,
  shouldShowQuickDraft,
  shouldShowQuickPlan,
  shouldShowNotification,
  shouldShowFab,
  setTheme,
} = useGlobalUI();

provide('toggleTheme', () => {
  isDarkMode.value = !isDarkMode.value;
  setTheme(isDarkMode.value);
});

// Provide theme to child components
provide('isDarkMode', isDarkMode);
</script>
