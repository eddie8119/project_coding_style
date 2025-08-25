<template>
  <button
    class="ml-1 text-gray-600 transition-transform duration-300 hover:text-gray-800"
    @click="handleBack"
  >
    <img src="@/assets/icons/back.svg" :alt="`back Icon`" class="icon-hover icon-basic w-3" />
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const handleBack = () => {
  router.back();
};
</script>

<style scoped></style>
