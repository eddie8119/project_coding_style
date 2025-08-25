<template>
  <div
    class="flex h-screen w-screen items-center justify-center bg-white dark:bg-black-900 dark:!text-[#ffffff]"
  >
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts"></script>
