<template>
  <div
    v-if="!isEditing"
    class="flex w-full flex-shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-3 hover:border-gray-400 md:w-[300px]"
    @click="startEditing"
  >
    <div class="text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mx-auto h-10 w-10 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      <span class="text200-color-difference mt-2 block">{{
        t('button.add_construction_type')
      }}</span>
    </div>
  </div>

  <div v-else class="construction-container" @click.stop>
    <div class="flex flex-col space-y-3">
      <input
        ref="inputRef"
        v-model="newContainerName"
        type="text"
        class="input-border input-common p-2 text-lg"
        :placeholder="t('placeholder.project.addContainer')"
        @keyup.enter="addNewConstruction"
        @keyup.esc="cancelEditing"
      />

      <div v-if="notAddedConstruction.length > 0" class="space-y-2">
        <Label :label="t('label.quick_select') + ':'" />
        <div class="flex flex-wrap gap-2">
          <button
            v-for="construction in notAddedConstruction"
            :key="construction.id"
            type="button"
            class="normal-button px-3 py-1 text-sm"
            :class="{ 'is-active': isConstructionSelected(construction) }"
            @click="toggleConstructionSelection(construction)"
          >
            {{ construction.name }}
          </button>
        </div>
      </div>

      <div class="flex justify-between">
        <TextButton size="md" variant="outline" @click="cancelEditing">
          {{ t('button.cancel') }}
        </TextButton>
        <TextButton
          variant="secondary"
          :disabled="!isValidName"
          size="md"
          @click="addNewConstruction"
        >
          {{ t('button.add') }}
        </TextButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ConstructionSelection } from '@/types/selection';

import TextButton from '@/components/core/button/TextButton.vue';
import Label from '@/components/core/title/Label.vue';
import { useCommon } from '@/composables/query/useCommon';
import { useEditingStateStore } from '@/stores/useEditingStateStore';

const props = defineProps<{
  id: string;
  existingConstructions: ConstructionSelection[];
}>();

const emit = defineEmits<{ (e: 'add-container', constructions: ConstructionSelection[]): void }>();

const { t } = useI18n();
const { constructionItemsFromCommon } = useCommon();
const editingStateStore = useEditingStateStore();
const newContainerName = ref<string>('');
const selectedConstructions = ref<ConstructionSelection[]>([]);
const inputRef = ref<HTMLInputElement | null>(null);

// 使用計算屬性來判斷是否處於編輯狀態
const isEditing = computed(() => {
  return editingStateStore.isEditing('container', props.id);
});

// Watch for changes in the global editing state
watch(
  () => editingStateStore.currentEditingState,
  (newState) => {
    // If this component is in edit mode, but the global state has changed to another component,
    // cancel the edit for this component.
    if (isEditing.value && (newState.type !== 'container' || newState.id !== props.id)) {
      cancelEditing();
    }
  },
  { deep: true }
);

// 計算屬性：確保有效的提交資料
const isValidName = computed((): boolean => {
  const hasManualInput =
    newContainerName.value.trim().length > 0 && selectedConstructions.value.length === 0;
  const hasSelectedConstructions = selectedConstructions.value.length > 0;
  return hasManualInput || hasSelectedConstructions;
});

// 開始編輯模式
const startEditing = (): void => {
  editingStateStore.startEditing('container', props.id);
  newContainerName.value = '';
  selectedConstructions.value = [];

  // 等待 DOM 更新後聚焦輸入框
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

// 素材準備: 未添加容器
const notAddedConstruction = computed(() => {
  return constructionItemsFromCommon.value.filter(
    (construction: ConstructionSelection) =>
      !props.existingConstructions.some((c) => c.name === construction.name)
  );
});

// 檢查是否已選中
const isConstructionSelected = (construction: ConstructionSelection): boolean => {
  return selectedConstructions.value.some((s: ConstructionSelection) => s.id === construction.id);
};

// 切換選中狀態
const toggleConstructionSelection = (construction: ConstructionSelection): void => {
  const index = selectedConstructions.value.findIndex(
    (s: ConstructionSelection) => s.id === construction.id
  );
  if (index > -1) {
    selectedConstructions.value.splice(index, 1);
  } else {
    selectedConstructions.value.push(construction);
  }
  updateInputDisplay();
};

// 更新輸入框顯示
const updateInputDisplay = (): void => {
  if (selectedConstructions.value.length > 0) {
    newContainerName.value = selectedConstructions.value
      .map((c: ConstructionSelection) => c.name)
      .join(', ');
  }
};

// 添加新容器
const addNewConstruction = (): void => {
  const constructionsToAdd: ConstructionSelection[] = [];

  // 如果有從快速選取選中的資料
  if (selectedConstructions.value.length > 0) {
    constructionsToAdd.push(...selectedConstructions.value);
  }

  // 如果有手動輸入的資料（且不是來自快速選取）
  if (newContainerName.value.trim() && selectedConstructions.value.length === 0) {
    constructionsToAdd.push({
      id: Date.now().toString(),
      name: newContainerName.value.trim(),
    });
  }

  if (constructionsToAdd.length > 0) {
    emit('add-container', constructionsToAdd);
    resetForm();
  }
};

// 取消編輯
const cancelEditing = (): void => {
  resetForm();
};

// 重置表單
const resetForm = (): void => {
  newContainerName.value = '';
  selectedConstructions.value = [];
  editingStateStore.stopEditing();
};
</script>

<style scoped></style>
