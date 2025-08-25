<template>
  <img
    :src="getIconUrl('Hamburger')"
    :alt="`Hamburger-Icon`"
    class="icon-hover w-5 cursor-pointer invert dark:invert-0 md:hidden"
    @click="toggleHamburger"
  />

  <!-- 背景遮罩 -->
  <div
    v-show="isHamburgerOpen"
    class="fixed inset-0 z-40 bg-black-100 opacity-80 transition-opacity duration-300"
    @click="toggleHamburger"
  />

  <!-- 上滑式導航彈窗 -->
  <transition name="slide-down">
    <div
      v-if="isHamburgerOpen"
      class="fixed left-0 top-[60px] z-50 w-full rounded-b-lg bg-white shadow-lg dark:bg-black-900"
    >
      <!-- Header -->
      <div class="flex items-center justify-end border-b p-3 dark:border-gray-700">
        <img
          :src="getIconUrl('Close')"
          alt="Close menu"
          class="icon-hover w-5 cursor-pointer md:hidden"
          @click="toggleHamburger"
        />
      </div>

      <!-- Navigation Content -->
      <nav class="max-h-[calc(100vh-120px)] overflow-y-auto bg-black-200 dark:bg-black-900">
        <div v-for="node in menuList" :key="node.group" class="py-3">
          <div class="mt-1 px-4 text-xs font-medium uppercase text-black-400">
            {{ node.group }}
          </div>
          <div class="grid grid-cols-1 gap-2 px-3">
            <router-link
              v-for="item in node.items"
              :key="item.key"
              :to="item.route"
              class="flex items-center rounded-lg p-1 transition-colors hover:bg-black-200 hover:bg-gray-100 dark:hover:bg-black-500"
              @click="toggleHamburger"
            >
              <img
                :src="getIconUrl(item.icon)"
                :alt="`${item.name}-icon`"
                class="w-5 invert dark:invert-0"
              />
              <span class="ml-2 text-center text-sm dark:text-white">{{ item.label }}</span>
              <!-- Submenu indicator -->
              <!-- <div v-if="item.children" class="ml-2 flex items-center text-xs text-black-400">
                <span>{{ item.children.length }} subitems</span>
                <img
                  src="@/assets/icons/Vector.svg"
                  class="ml-1 h-3 w-3 rotate-90 transform opacity-50 dark:invert"
                  alt="expand"
                />
              </div> -->
            </router-link>
          </div>
        </div>
      </nav>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Menu } from '@/types/layout';

import { menu } from '@/constants/menu';
import { getIconUrl } from '@/utils/assetUrl';

const { t } = useI18n();
const isHamburgerOpen = ref<boolean>(false);

// 轉換選單語系
const menuList = computed<Menu[]>(() =>
  menu.map((node) => ({
    ...node,
    group: t(`nav.group.${node.group}`),
    items:
      node.items?.map((item) => ({
        ...item,
        label: t(`nav.menu.${item.name}`),
      })) || [],
  }))
);

const toggleHamburger = (): void => {
  isHamburgerOpen.value = !isHamburgerOpen.value;
};

// 畫面尺寸監聽
const checkScreenSize = (): void => {
  if (window.innerWidth >= 768) {
    isHamburgerOpen.value = false;
  }
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<style lang="scss" scoped>
.router-link-active {
  @apply bg-black-100 dark:bg-black-500;
}

/* 上滑動畫 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* 避免滾動穿透 */
:deep(body.mobile-nav-open) {
  overflow: hidden;
}
</style>
