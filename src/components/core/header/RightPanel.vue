<template>
  <div class="flex items-center gap-2 md:gap-3">
    <ShowNowTime />
    <div v-for="nav in navItems" :key="nav.id" class="relative flex items-center">
      <button @click="nav.action">
        <img :src="getIconUrl(nav.icon)" :alt="`${nav.name}-Icon`" class="icon-hover icon-basic" />
      </button>

      <!-- Language Dropdown -->
      <div
        v-if="nav.name === 'Global'"
        v-show="isLanguageDropdownOpen"
        ref="languageDropdownRef"
        class="absolute right-0 top-full z-10 mt-2"
      >
        <NavBarItemAccordion
          :items="languages"
          :selected-item="currentLanguage"
          @select="handleLanguageChange"
        />
      </div>

      <!-- Authentication Dropdown -->
      <div
        v-if="nav.name === 'Authentication'"
        v-show="isAuthenticationDropdownOpen"
        ref="authenticationDropdownRef"
        class="absolute right-0 top-full z-10 mt-2"
      >
        <NavBarItemAccordion :items="authentications" @select="handleAuthenticationChange" />
      </div>
    </div>
    <p class="text-sm text-black-400">
      {{ isAdmin ? t('common.role.admin') : t('common.role.user') }}
    </p>
    <MobileNav />
  </div>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import MobileNav from './MobileNav.vue';
import NavBarItemAccordion from './NavBarItemAccordion.vue';
import ShowNowTime from './ShowNowTime.vue';

import type { NavItem } from '@/types/layout';

import { useAuth } from '@/composables/useAuth';
import { useAuthentication } from '@/composables/useAuthentication';
import { useLocale } from '@/composables/useLocale';
import { useAuthStore } from '@/stores/auth';
import { getIconUrl } from '@/utils/assetUrl';

const { t } = useI18n();
const authStore = useAuthStore();
const { currentLanguage, languages, handleLanguageChange } = useLocale();
const { authentications, handleAuthenticationChange } = useAuthentication();
const { isAdmin } = useAuth();

// const toggleTheme = inject('toggleTheme') as () => void;

const languageDropdownRef = ref<HTMLElement | null>(null);
const authenticationDropdownRef = ref<HTMLElement | null>(null);
const isLanguageDropdownOpen = ref<boolean>(false);
const isAuthenticationDropdownOpen = ref<boolean>(false);

const toggleLanguage = () => {
  isAuthenticationDropdownOpen.value = false;
  isLanguageDropdownOpen.value = !isLanguageDropdownOpen.value;
};

const toggleAuthentication = () => {
  isLanguageDropdownOpen.value = false;
  isAuthenticationDropdownOpen.value = !isAuthenticationDropdownOpen.value;
};

// 點擊外部關閉彈窗
onClickOutside(languageDropdownRef, () => {
  isLanguageDropdownOpen.value = false;
});

onClickOutside(authenticationDropdownRef, () => {
  isAuthenticationDropdownOpen.value = false;
});

const navItems = computed<NavItem[]>(() => {
  const baseItems: NavItem[] = [
    // {
    //   id: 0,
    //   name: 'LightSet',
    //   icon: 'LightSet',
    //   label: t('common.theme'),
    //   action: toggleTheme,
    // },
    {
      id: 1,
      name: 'Global',
      icon: 'Global',
      label: t('common.language'),
      action: toggleLanguage,
    },
  ];

  if (authStore.isAuthenticated) {
    baseItems.push(
      {
        id: 2,
        name: 'Notification',
        icon: 'Bell',
        label: t('common.notification'),
        action: () => {},
      },
      {
        id: 3,
        name: 'Authentication',
        icon: 'UserCircle',
        label: t('common.authentication'),
        action: toggleAuthentication,
      }
    );
  }

  return baseItems;
});
</script>

<style lang="scss" scoped></style>
