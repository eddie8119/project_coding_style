<template>
  <div class="relative inline-flex items-center">
    <!-- 小記號 -->
    <button
      v-if="previewImageUrls.length > 0"
      ref="buttonRef"
      :title="buttonTitle"
      class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-all hover:bg-blue-200 hover:shadow-md"
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      @click="navigateToFloorPlan"
    >
      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
        />
      </svg>
    </button>

    <PreviewTooltip
      :show="showTooltip"
      :image-urls="previewImageUrls"
      :title="tooltipTitle"
      :hint="tooltipHint"
      :tooltip-style="tooltipStyle"
      :get-alt-text="getAltText"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import type { FloorPlanItem } from '@/types/response';

import PreviewTooltip from '@/components/core/PreviewTooltip.vue';

interface Props {
  floorPlanUrls?: FloorPlanItem[];
  projectId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  floorPlanUrls: () => [] as FloorPlanItem[],
  projectId: undefined,
});

const router = useRouter();
const { t } = useI18n();

const showTooltip = ref(false);
const buttonRef = ref<HTMLButtonElement>();
const tooltipStyle = ref<Partial<Record<string, string>>>({});

// 確保 floorPlanUrls 是有效的陣列
const previewImageUrls = computed(() => {
  if (!Array.isArray(props.floorPlanUrls)) return [] as string[];
  return props.floorPlanUrls
    .map((item) => item?.data)
    .filter((data): data is string => typeof data === 'string' && data.length > 0);
});

const updateTooltipPosition = () => {
  if (!buttonRef.value) return;

  const rect = buttonRef.value.getBoundingClientRect();
  tooltipStyle.value = {
    top: `${rect.bottom + 8}px`,
    left: `${rect.left + rect.width / 2}px`,
    transform: 'translateX(-50%)',
  };
};

const addListeners = () => {
  window.addEventListener('scroll', updateTooltipPosition, true);
  window.addEventListener('resize', updateTooltipPosition);
};

const removeListeners = () => {
  window.removeEventListener('scroll', updateTooltipPosition, true);
  window.removeEventListener('resize', updateTooltipPosition);
};

watch(
  () => showTooltip.value,
  (visible) => {
    if (visible) {
      updateTooltipPosition();
      addListeners();
    } else {
      removeListeners();
    }
  }
);

onBeforeUnmount(() => {
  removeListeners();
});

const imageCount = computed(() => previewImageUrls.value.length);

const buttonTitle = computed(() =>
  t('dropdown.floor_plan_preview_icon.button_title', { count: imageCount.value })
);

const tooltipTitle = computed(() =>
  t('dropdown.floor_plan_preview_icon.tooltip_title', { count: imageCount.value })
);

const tooltipHint = computed(() => t('dropdown.floor_plan_preview_icon.tooltip_hint'));

const getAltText = (index: number) =>
  t('dropdown.floor_plan_preview_icon.image_alt', { index: index + 1 });

const navigateToFloorPlan = () => {
  if (!props.projectId) return;
  router.push(`/todo/plan/${props.projectId}`);
};
</script>

<style scoped></style>
