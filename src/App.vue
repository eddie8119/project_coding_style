<template>
  <RouterView />
</template>

<script setup lang="ts">
import { provide, ref } from 'vue';

import { useAuthStore } from '@/stores/auth';
import { initTheme, setTheme } from '@/utils/theme';

const authStore = useAuthStore();
authStore.initializeAuthState();

// 主題顏色
const isDarkMode = ref<boolean>(initTheme());
provide('isDarkMode', isDarkMode);

provide('toggleTheme', () => {
  isDarkMode.value = !isDarkMode.value;
  setTheme(isDarkMode.value);
});
</script>
