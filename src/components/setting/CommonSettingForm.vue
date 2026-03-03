<template>
  <div class="panel-container mx-auto w-full p-4 sm:p-6 md:p-8">
    <div ref="scrollContainer" class="relative pb-24 md:px-[200px] md:pb-0">
      <!-- Submit Button: Mobile -->
      <div class="md:hidden">
        <TextButton
          variant="primary"
          size="md"
          class="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+16px)] z-50 h-12 rounded-xl shadow-lg"
          :loading="isSubmitting"
          :disabled="isSubmitting || !construction.length"
          @click="onSubmit"
        >
          {{ t('common.save') }}
        </TextButton>
      </div>

      <!-- Submit Button: Desktop/Tablet -->
      <div class="hidden md:block">
        <TextButton
          variant="primary"
          size="md"
          :class="[
            'z-50 h-10 px-6',
            isScrolledDown ? 'absolute -bottom-12 -right-4 shadow-lg' : 'absolute -right-4 -top-4',
          ]"
          :loading="isSubmitting"
          :disabled="isSubmitting || !construction.length"
          @click="onSubmit"
        >
          {{ t('common.save') }}
        </TextButton>
      </div>

      <div class="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Construction Input -->

        <DraggableArrayInput
          v-model="localConstructionItems"
          :title="t('setting.construction')"
          :new-item-factory="createNewConstructionItem"
          :name-placeholder="t('placeholder.project.add_construction')"
          :add-button-text="t('common.add')"
        />
        <span v-if="constructionError" class="mt-1 text-sm text-secondary-red">
          {{ constructionError }}
        </span>

        <!-- Unit Input -->
        <DraggableArrayInput
          v-model="localUnitItems"
          :title="t('setting.unit')"
          :new-item-factory="createNewUnitItem"
          :name-placeholder="t('placeholder.project.add_unit')"
          :add-button-text="t('common.add')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { ElMessage } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Item } from '@/types/input';
import type { CommonResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';
import type { CreateCommonSchema } from '@/utils/schemas/createCommonSchema';
import type { MutateFunction } from '@tanstack/vue-query';

import TextButton from '@/components/core/button/TextButton.vue';
import DraggableArrayInput from '@/components/core/input/DraggableArrayInput.vue';
import { createCommonSchema } from '@/utils/schemas/createCommonSchema';
import {
  addScrollListener,
  getScrollTop,
  removeScrollListener,
  resolveScrollTarget,
  type ScrollTarget,
} from '@/utils/scroll';

interface Props {
  fetchedCommon: CommonResponse | undefined;
  updateCommon: MutateFunction<
    CommonResponse | undefined,
    Error,
    {
      id: string;
      data: Partial<CreateCommonSchema>;
    },
    unknown
  >;
}

const props = defineProps<Props>();

const { t } = useI18n();

// Form validation setup
const { handleSubmit, isSubmitting, setValues } = useForm({
  validationSchema: toTypedSchema(createCommonSchema(t)),
  initialValues: {
    construction: props.fetchedCommon?.construction || [],
    unit: props.fetchedCommon?.unit || [],
  },
});

// Form fields
const { value: construction, errorMessage: constructionError } =
  useField<ConstructionSelection[]>('construction');
const { value: unit } = useField<string[]>('unit');

// Local copies for array inputs
type ConstructionItem = Item & { id: string };
const localConstructionItems = ref<ConstructionItem[]>([]);
type UnitItem = Item & { id: string };
const localUnitItems = ref<UnitItem[]>([]);

// Scroll state for save button position
const isScrolledDown = ref(false);
const scrollContainer = ref<HTMLElement | null>(null); // local container ref
let scrollTarget: ScrollTarget | null = null; // resolved actual scroll target

// Factory function for new construction items
const createNewConstructionItem = () => {
  return { name: '', id: crypto.randomUUID() } as ConstructionItem;
};

// Factory function for new unit items
const createNewUnitItem = () => {
  return { name: '', id: crypto.randomUUID() } as UnitItem;
};

// Sync from form state to local state
const syncToLocal = () => {
  localConstructionItems.value = construction.value.map((item: ConstructionSelection) => ({
    name: item.name,
    id: item.id,
  }));

  localUnitItems.value = unit.value.map((name, index) => ({
    name,
    id: `${index}-${name}`,
  }));
};

// Sync from local state to form state
const syncToForm = () => {
  construction.value = localConstructionItems.value
    .filter((item: ConstructionItem) => item.name)
    .map((item: ConstructionItem) => ({
      name: item.name,
      id: item.id,
    }));

  unit.value = localUnitItems.value
    .filter((item: UnitItem) => item.name)
    .map((item: UnitItem) => item.name as string);
};

// Watch for external changes to common data and update form values
watch(
  () => props.fetchedCommon,
  (newCommon) => {
    if (newCommon) {
      setValues({
        construction: newCommon.construction || [],
        unit: newCommon.unit || [],
      });
      syncToLocal(); // Update local state when form state changes
    }
  },
  { immediate: true, deep: true }
);

// Track scroll position to toggle button position
const handleScroll = () => {
  if (!scrollTarget) return;
  isScrolledDown.value = getScrollTop(scrollTarget) > 20;
};

onMounted(() => {
  // Resolve actual scroll target: nearest scrollable ancestor -> main -> window
  scrollTarget = resolveScrollTarget(scrollContainer.value, 'main');
  addScrollListener(scrollTarget, handleScroll, { passive: true });
  handleScroll();
});

onBeforeUnmount(() => {
  if (scrollTarget) removeScrollListener(scrollTarget, handleScroll);
  scrollTarget = null;
});

// Form submission handler
const onSubmit = handleSubmit(async () => {
  syncToForm(); // Sync local changes to form state before submitting
  try {
    if (!props.fetchedCommon) {
      ElMessage.error(t('message.no_common_data_exists'));
      return;
    }

    await props.updateCommon({
      id: props.fetchedCommon.id,
      data: {
        construction: construction.value,
        unit: unit.value,
      },
    });

    ElMessage.success(t('message.success.update'));
  } catch (error) {
    console.error('Failed to update common data:', error);
    ElMessage.error(t('message.error.update'));
  }
});
</script>
