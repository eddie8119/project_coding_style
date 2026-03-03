<template>
  <div class="image-carousel" v-bind="$attrs">
    <div class="carousel-container relative grid h-full w-full grid-rows-[1fr_auto] gap-y-3">
      <!-- Main viewer -->
      <div class="viewer relative w-full overflow-hidden">
        <!-- Images list -->
        <ul class="image-layer relative flex h-full w-full items-center justify-center">
          <li
            v-for="(image, index) in props.images"
            :key="image.key || index"
            class="absolute inset-0 flex items-center justify-center"
          >
            <!-- 每張圖片自己的包裹容器，作為 pins 的座標系 -->
            <div class="relative max-h-full max-w-full">
              <img
                :src="image.data"
                :alt="`${altText}${index + 1}`"
                class="h-full w-full rounded object-contain opacity-0 transition-opacity duration-300"
                :class="{ 'opacity-100': activeIndex === index }"
                @click="openPreview"
              />

              <!-- 僅在當前顯示的圖片上渲染 pins，並以包裹容器為基準 -->
              <ImagePinsOverlay
                v-if="activeIndex === index"
                class="absolute inset-0"
                :images="props.images"
                :tasks="props.tasks"
                :active-index="index"
              />
            </div>
          </li>
        </ul>

        <!-- Navigation arrows -->
        <button v-if="activeIndex > 0" class="nav-arrow left-1" @click="prevImage">&lt;</button>

        <button
          v-if="activeIndex < props.images.length - 1"
          class="nav-arrow right-1"
          @click="nextImage"
        >
          &gt;
        </button>
      </div>
    </div>
    <div class="meta flex flex-col items-center gap-1 pb-1">
      <!-- Indicators -->
      <div class="indicators flex justify-center gap-1.5">
        <div
          v-for="(_, index) in props.images"
          :key="index"
          class="h-1 w-6 cursor-pointer rounded bg-gray-300 transition-all duration-300"
          :class="{ 'scale-y-150 bg-blue-500': activeIndex === index }"
          @click="activeIndex = index"
        />
      </div>

      <!-- Counter -->
      <div class="counter text200-color-difference text-center text-xs">
        {{ activeIndex + 1 }} / {{ props.images.length }}
      </div>
    </div>

    <!-- Image preview dialog -->
    <ImagePinsPreviewDialog
      :model-value="isPreviewOpen"
      :images="props.images"
      :tasks="props.tasks"
      :active-index="activeIndex"
      :alt-text="altText"
      @update:model-value="isPreviewOpen = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import ImagePinsOverlay from './ImagePinsOverlay.vue';

import type { FloorPlanItem, TaskResponse } from '@/types/response';

import ImagePinsPreviewDialog from '@/components/core/dialog/ImagePinsPreviewDialog.vue';
import { useCarousel } from '@/composables/useCarousel';

const props = defineProps<{
  images: FloorPlanItem[];
  altText?: string;
  tasks?: TaskResponse[];
}>();

const {
  currentIndex: activeIndex,
  next: nextImage,
  prev: prevImage,
} = useCarousel(computed(() => props.images));

const isPreviewOpen = ref(false);

const openPreview = () => {
  if (!props.images.length) return;
  isPreviewOpen.value = true;
};
</script>

<style scoped>
.nav-arrow {
  @apply absolute top-1/2 z-10 h-8 w-8 -translate-y-1/2 cursor-pointer rounded-full border-none bg-gray-400 bg-opacity-60 text-black-900;
}
@media (min-width: 768px) and (max-width: 1024px) {
  .nav-arrow {
    @apply h-7 w-7 text-sm;
  }
}
</style>
