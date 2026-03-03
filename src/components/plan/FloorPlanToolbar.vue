<template>
  <div
    class="absolute left-4 top-4 z-10 flex w-[calc(100%-2rem)] flex-wrap gap-2 md:w-auto md:flex-nowrap"
  >
    <!-- 圖片切換按鈕 -->
    <div v-if="hasMultipleImages" class="flex gap-1">
      <button
        class="navigationButtonClass panel-color-difference"
        :disabled="currentImageIndex === 0"
        @click="$emit('prev-image')"
      >
        ←
      </button>
      <div
        class="panel-color-difference flex items-center rounded-lg px-3 py-2 text-sm text-black-400 shadow-md"
      >
        {{ currentImageIndex + 1 }} / {{ totalImages }}
      </div>
      <button
        class="navigationButtonClass panel-color-difference"
        :disabled="currentImageIndex === totalImages - 1"
        @click="$emit('next-image')"
      >
        →
      </button>
    </div>

    <button class="primaryButtonClass panel-color-difference" @click="$emit('reset-zoom')">
      {{ t('button.floor_plan.fit_screen') }}
    </button>
    <div class="panel-color-difference rounded-lg px-3 py-2 text-sm text-black-400 shadow-md">
      {{ Math.round(scale * 100) }}%
    </div>

    <template v-if="!isConfirmingReset">
      <div class="flex gap-2">
        <!-- 手機版側邊欄切換按鈕 -->
        <button
          class="primaryButtonClass panel-color-difference md:hidden"
          :aria-label="t('button.floor_plan.toggle_sidebar')"
          @click="$emit('toggle-sidebar')"
        >
          <ElIcon><Menu /></ElIcon>
        </button>

        <button
          class="primaryButtonClass panel-color-difference"
          :aria-label="t('button.floor_plan.add_image')"
          :title="t('button.floor_plan.add_image')"
          @click="$emit('add-image')"
        >
          <img
            src="@/assets/icons/Add.svg"
            alt="Add"
            class="h-4 w-4 dark:brightness-0 dark:invert"
          />
        </button>
        <button
          class="primaryButtonClass panel-color-difference"
          :aria-label="t('button.floor_plan.replace_image')"
          :title="t('button.floor_plan.replace_image')"
          @click="$emit('replace-image')"
        >
          <img
            src="@/assets/icons/Restore.svg"
            alt="Restore"
            class="h-4 w-4 dark:brightness-0 dark:invert"
          />
        </button>
        <button
          class="dangerButtonClass panel-color-difference"
          :aria-label="t('button.floor_plan.delete_image')"
          :title="t('button.floor_plan.delete_image')"
          @click="$emit('delete-image')"
        >
          <TrashIcon />
        </button>
      </div>
    </template>

    <!-- 確認重置對話框 -->
    <template v-else>
      <div class="flex gap-2">
        <button class="confirmButtonClass" @click="$emit('confirm-delete')">
          {{ t('button.floor_plan.confirm_delete') }}
        </button>
        <button class="neutralButtonClass" @click="$emit('cancel-delete')">
          {{ t('button.floor_plan.cancel') }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Menu } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

import TrashIcon from '@/components/ui/TrashIcon.vue';

withDefaults(
  defineProps<{
    scale: number;
    isAddingMarker: boolean;
    isConfirmingReset?: boolean;
    hasMultipleImages?: boolean;
    currentImageIndex?: number;
    totalImages?: number;
  }>(),
  {
    isConfirmingReset: false,
    hasMultipleImages: false,
    currentImageIndex: 0,
    totalImages: 1,
  }
);

defineEmits<{
  'add-image': [];
  'replace-image': [];
  'delete-image': [];
  'confirm-delete': [];
  'cancel-delete': [];
  'reset-zoom': [];
  'prev-image': [];
  'next-image': [];
  'toggle-sidebar': [];
}>();

const { t } = useI18n();
</script>

<style scoped>
.baseButtonClass {
  @apply rounded-lg px-3 py-2 text-sm shadow-xl transition-colors disabled:opacity-50;
}

.primaryButtonClass {
  @apply baseButtonClass text-black-400 hover:bg-brand-tertiary hover:text-primary-text;
}
.dangerButtonClass {
  @apply baseButtonClass text-red-500 hover:bg-brand-tertiary;
}
.confirmButtonClass {
  @apply baseButtonClass bg-red-500 text-white hover:bg-red-600;
}
.neutralButtonClass {
  @apply baseButtonClass bg-gray-300 hover:bg-gray-400;
}

.navigationButtonClass {
  @apply baseButtonClass px-2 text-black-400 hover:bg-brand-tertiary;
}
</style>
