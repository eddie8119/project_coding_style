<template>
  <p class="text-sm text-black-400">{{ formattedTime }}</p>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { formatDateTimeWithSeconds } from '@/utils/dateTime';
const formattedTime = ref<string>('');

let timer: ReturnType<typeof setInterval>;

const updateTime = (): void => {
  const now = new Date();
  formattedTime.value = formatDateTimeWithSeconds(now);
};

// 注意這組件 是放在<keep-alive>之外的
onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped></style>
