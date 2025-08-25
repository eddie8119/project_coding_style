<template>
  <nav class="flex flex-col gap-5">
    <div v-for="node in menuList" :key="`menu-group-${node.group}`" class="flex flex-col gap-1">
      <div v-show="isCollapsed" class="px-3 text-xs text-black-400">
        {{ node.group }}
      </div>
      <div v-for="item in node.items" :key="`menu-item-${item.label}`" class="flex flex-col gap-1">
        <router-link
          :to="item.route"
          class="sidebar-nav-link"
          :class="{ 'justify-center': isSidebarCollapsed }"
        >
          <div class="flex items-center gap-2">
            <img
              :src="getIconUrl(item.icon)"
              :alt="`${item.name}-icon`"
              class="h-5 w-5 invert dark:invert-0"
            />
          </div>
          <span v-show="isCollapsed">{{ item.label }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Menu } from '@/types/layout';

import { menu } from '@/constants/menu';
import { getIconUrl } from '@/utils/assetUrl';

const { t } = useI18n();
const props = defineProps<{
  isSidebarCollapsed: boolean;
}>();

const menuList = computed<Menu[]>(() =>
  menu.map((node) => ({
    ...node,
    group: t(node.group),
    items: node.items.map((item) => ({
      ...item,
      label: t(`nav.menu.${item.name}`),
    })),
  }))
);

const isCollapsed = computed(() => !props.isSidebarCollapsed);
</script>

<style></style>
