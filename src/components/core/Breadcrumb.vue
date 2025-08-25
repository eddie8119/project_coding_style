<template>
  <nav aria-label="breadcrumb">
    <ol class="flex items-center space-x-2 text-sm">
      <li>
        <router-link
          class="capitalize hover:text-brand-primary"
          :to="`/${pathSegments.category}/${pathSegments.subject}`"
        >
          {{ pathSegments.subject }}
        </router-link>
      </li>
      <li>/</li>
      <li>
        <router-link class="hover:text-brand-primary" :to="currentPath">
          {{ currentPage }}
        </router-link>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const route = useRoute();

const pathSegments = computed(() => {
  const segments = route.path.split('/').filter((segment) => segment);
  return {
    category: segments[0] || '',
    subject: segments[1] || '',
    page: segments[2] || '',
  };
});

const currentPage = computed(() => {
  const path = route.path;
  if (path.includes('devices-maintenance')) return t(`tab.devices-maintenance`);
  if (path.includes('alarm-setting')) return t(`tab.alarm-setting`);
  if (path.includes('devices')) return t(`tab.devices`);
  if (path.includes('material')) return t(`tab.material`);
  return '';
});

const currentPath = computed(() => {
  return route.path;
});
</script>

<style scoped>
.router-link-active,
.router-link-exact-active {
  @apply bg-transparent;
}
</style>
