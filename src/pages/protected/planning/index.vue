<template>
  <ProjectLayout
    :subject="t('title.planning_implementation')"
    :subtitle="t('subtitle.planning_implementation')"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import ProjectLayout from '@/components/app-layout/ProjectLayout.vue';

const { t } = useI18n();
</script>

<style scoped></style>
