<template>
  <div class="mx-auto max-w-6xl px-6">
    <H1Title :title="t('title.help_center')" />
    <div class="grid grid-cols-1 gap-5">
      <HelpCenterPanels />
      <FeedbackForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import H1Title from '@/components/core/title/H1Title.vue';
import FeedbackForm from '@/components/help-center/FeedbackForm.vue';
import HelpCenterPanels from '@/components/help-center/HelpCenterPanels.vue';

const { t } = useI18n();
</script>

<style scoped></style>
