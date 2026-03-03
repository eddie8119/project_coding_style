<template>
  <section class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    <article
      v-for="video in videos"
      :key="video.id"
      class="chart-panel-container border border-white/10"
    >
      <div class="aspect-video overflow-hidden rounded-xl">
        <iframe
          class="h-full w-full"
          :src="video.embedUrl"
          :title="video.title"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        />
      </div>
      <div class="my-4">
        <H3Title :title="video.title" class-name="" />
        <!-- <p class="text-text200-color mt-1 text-sm">{{ video.description }}</p> -->
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import H3Title from '@/components/core/title/H3Title.vue';

type TeachingVideo = {
  id: string;
  title: string;
  description: string;
  embedUrl: string;
};

defineProps<{
  videos: TeachingVideo[];
}>();
</script>

<style scoped></style>
