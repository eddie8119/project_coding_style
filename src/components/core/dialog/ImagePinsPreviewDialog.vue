<template>
  <BasicEditDialog
    :model-value="props.modelValue"
    :title="props.title"
    :width="props.width"
    :show-footer-button="false"
    @update:model-value="onUpdateModelValue"
    @cancel="onCancel"
  >
    <div class="flex max-h-[70vh] max-w-[80vw] items-center justify-center">
      <!-- 圖片包裹容器：大小等於實際顯示的圖片矩形 -->
      <div class="relative inline-flex items-center justify-center">
        <img
          v-if="previewImage"
          :src="previewImage.data"
          :alt="props.altText || 'Floor plan'"
          class="block h-auto max-h-[70vh] w-auto max-w-[80vw] rounded object-contain"
        />
        <ImagePinsOverlay
          v-if="previewImage"
          class="absolute inset-0"
          :images="props.images"
          :tasks="props.tasks"
          :active-index="currentIndex"
        />

        <!-- Navigation arrows -->
        <button v-if="currentIndex > 0" class="nav-arrow left-1" @click="prevImage">&lt;</button>

        <button
          v-if="props.images && currentIndex < props.images.length - 1"
          class="nav-arrow right-1"
          @click="nextImage"
        >
          &gt;
        </button>
      </div>
    </div>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

import type { FloorPlanItem, TaskResponse } from '@/types/response';

import ImagePinsOverlay from '@/components/core/carousel/ImagePinsOverlay.vue';
import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { useCarousel } from '@/composables/useCarousel';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    images: FloorPlanItem[];
    tasks?: TaskResponse[];
    activeIndex: number;
    title?: string;
    width?: string;
    altText?: string;
  }>(),
  {
    title: '',
    width: '80vw',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const {
  currentIndex,
  next: nextImage,
  prev: prevImage,
} = useCarousel(
  computed(() => props.images),
  computed(() => props.activeIndex)
);

watch(
  () => props.modelValue,
  (isOpen: boolean) => {
    if (isOpen) {
      currentIndex.value = props.activeIndex;
    }
  }
);

const previewImage = computed(() => {
  if (!props.images || !props.images.length) return null;
  const index = Math.min(Math.max(currentIndex.value, 0), props.images.length - 1);
  return props.images[index];
});

const onUpdateModelValue = (value: boolean) => {
  emit('update:modelValue', value);
};

const onCancel = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped>
.nav-arrow {
  @apply absolute top-1/2 z-10 h-8 w-8 -translate-y-1/2 cursor-pointer rounded-full border-none bg-gray-400 bg-opacity-60 text-black-900;
}
</style>
