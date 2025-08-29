<template>
  <header class="header-container border-bottom justify-between">
    <LogoArea class="--mobile md:hidden" />
    <div class="--desktop hidden md:block">
      <div class="flex">
        <button
          class="mr-4 text-gray-600 transition-transform duration-300 hover:text-gray-800"
          :class="{ 'rotate-90': props.isSidebarCollapsed }"
          @click="$emit('toggle-sidebar')"
        >
          <img src="@/assets/icons/Menu.svg" :alt="`menu Icon`" class="icon-hover icon-basic" />
        </button>
        <PrePage />
        <!-- <Breadcrumb /> -->
      </div>
    </div>
    <RightPanel />
  </header>
</template>

<script setup lang="ts">
import RightPanel from '@/components/core/header/RightPanel.vue';
import PrePage from '@/components/core/PrePage.vue';
import LogoArea from '@/components/core/sidebar/LogoArea.vue';

const props = defineProps<{
  isSidebarCollapsed: boolean;
}>();
</script>

<style lang="scss" scoped></style>
