<template>
  <p class="text-sm text-black-400">{{ formattedTime }}</p>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

const formattedTime = ref<string>('');

// 製作時間格式函式
function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

let timer: ReturnType<typeof setInterval>;

const updateTime = (): void => {
  const now = new Date();
  formattedTime.value = formatDate(now);
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
