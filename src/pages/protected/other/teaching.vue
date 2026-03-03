<template>
  <div class="mx-auto max-w-6xl px-6">
    <H1Title :title="t('title.teaching')" class="text-center" />
    <VideoGrid :videos="teachingVideos" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import H1Title from '@/components/core/title/H1Title.vue';
import VideoGrid from '@/components/teaching/VideoGrid.vue';

const { t } = useI18n();

const teachingVideos = computed(() => [
  // {
  //   id: 'intro-basics',
  //   title: t('teaching.videos.introBasics.title'),
  //   description: t('teaching.videos.introBasics.description'),
  //   embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  // },
]);
</script>

<style scoped></style>
