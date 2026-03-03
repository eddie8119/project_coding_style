<template>
  <header class="header-container border-bottom justify-between">
    <LogoArea
      v-if="isMobile"
      :is-sidebar-collapsed="!isSidebarCollapsed"
      class="--mobile md:hidden"
    />
    <div class="--desktop hidden md:block">
      <div class="flex">
        <button
          class="mr-4 transition-transform duration-300 hover:text-gray-800"
          :class="{ 'rotate-90': isSidebarCollapsed }"
          @click="emit('toggle-sidebar')"
        >
          <span
            class="icon-hover icon-mask"
            :style="{
              WebkitMaskImage: `url(${getIconUrl('Menu')})`,
              maskImage: `url(${getIconUrl('Menu')})`,
              backgroundColor: isDarkMode
                ? 'var(--color-dark-primary-text)'
                : 'var(--color-primary-text)',
            }"
            aria-label="menu Icon"
            role="img"
          />
        </button>
        <PrePage />
        <!-- <Breadcrumb /> -->
      </div>
    </div>
    <RightPanel />
  </header>
</template>

<script setup lang="ts">
import { inject, type Ref } from 'vue';

import RightPanel from '@/components/core/header/RightPanel.vue';
import PrePage from '@/components/core/PrePage.vue';
import LogoArea from '@/components/core/sidebar/LogoArea.vue';
import { useResponsiveWidth } from '@/composables/ui/useResponsiveWidth';
import { getIconUrl } from '@/utils/assetUrl';

defineProps<{
  isSidebarCollapsed: boolean;
}>();

const emit = defineEmits(['toggle-sidebar']);

const isDarkMode = inject('isDarkMode') as Ref<boolean>;
const { isMobile } = useResponsiveWidth();
</script>

<style lang="scss" scoped></style>
