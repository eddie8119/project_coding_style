<template>
  <div class="flex items-center gap-2 md:gap-3">
    <ShowNowTime />
    <div v-for="nav in navItems" :key="nav.id" class="flex items-center">
      <!-- 下拉選項 -->
      <el-dropdown
        v-if="nav.dropdownItems"
        :trigger="'click'"
        @command="(command) => nav.action(command)"
      >
        <button class="flex items-center">
          <img
            :src="getIconUrl(nav.icon)"
            :alt="`${nav.name}-Icon`"
            class="icon-hover icon-basic"
          />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in nav.dropdownItems"
              :key="item.value"
              :command="item.value"
            >
              {{ t(`dropdown.${item.label}`) }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <!-- 沒有下拉選項 -->
      <div v-else>
        <img :src="getIconUrl(nav.icon)" :alt="`${nav.name}-Icon`" class="icon-hover icon-basic" />
      </div>
    </div>
    <!-- 顯示身分 -->
    <p class="text-sm text-black-400">
      {{ isAdmin ? t('common.role.admin') : t('common.role.user') }}
    </p>
    <MobileNav />
  </div>
</template>

<script setup lang="ts">
import { ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import MobileNav from './MobileNav.vue';
import ShowNowTime from './ShowNowTime.vue';

import type { NavItem } from '@/types/layout';

import { useAuth } from '@/composables/useAuth';
import { useAuthentication } from '@/composables/useAuthentication';
import { useLocale } from '@/composables/useLocale';
import { useAuthStore } from '@/stores/auth';
import { Language } from '@/types/language';
import { getIconUrl } from '@/utils/assetUrl';

const { t } = useI18n();
const authStore = useAuthStore();
const { languages, handleLanguageChange } = useLocale();
const { authentications, handleAuthenticationChange } = useAuthentication();
const { isAdmin } = useAuth();

// 為了解決 型別切換
const handleLanguageSelect = (code: string): void => {
  handleLanguageChange(code as Language);
};

const navItems = computed<NavItem[]>(() => {
  const baseItems: NavItem[] = [
    {
      id: 1,
      name: 'Global',
      icon: 'Global',
      label: t('common.language'),
      action: handleLanguageSelect,
      dropdownItems: languages.map((lang) => ({
        label: lang.label,
        value: lang.code,
      })),
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
        action: handleAuthenticationChange,
        dropdownItems: authentications.map((auth) => ({
          label: auth.label,
          value: auth.code,
        })),
      }
    );
  }

  return baseItems;
});
</script>

<style lang="scss" scoped></style>
