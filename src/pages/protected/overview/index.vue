<template>
  <div class="flex flex-col">
    <H1Title :title="t('title.overview_remaining_task')" />
    <OverviewSection />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import H1Title from '@/components/core/title/H1Title.vue';
import OverviewSection from '@/components/overview/OverviewSection.vue';

const { t } = useI18n();
</script>

<style scoped></style>
