<template>
  <div class="my-5 rounded-md border border-dashed p-2">
    <div class="flex flex-col space-y-3">
      <H3Title :title="showTitle" class="text-center" />
      <!-- 基本信息輸入 -->
      <div>
        <input
          ref="inputRef"
          v-model="title"
          type="text"
          class="input-border input-common p-2"
          :placeholder="t('placeholder.project.task')"
        />
        <span v-if="props.errors.title" class="text-sm text-secondary-red">{{
          props.errors.title
        }}</span>
      </div>
      <div>
        <textarea
          ref="textareaRef"
          v-model="description"
          class="input-border input-common h-[120px] p-2"
          :placeholder="t('placeholder.project.taskDescription')"
        />
        <span v-if="props.errors.description" class="text-sm text-secondary-red">
          {{ props.errors.description }}
        </span>
      </div>

      <!-- 展開更多設定按鈕 -->
      <div class="flex items-center justify-center">
        <button
          class="flex items-center text-blue-500 hover:text-blue-700 focus:outline-none"
          @click="toggleMoreSettings"
        >
          <span class="mr-1"
            >{{ showMoreSettings ? '- Less' : '+ More' }} ( {{ t('common.optional') }} )</span
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            :class="{ 'rotate-180 transform': showMoreSettings }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <!-- 更多設定區域 -->
      <TaskFormMoreSettings
        v-if="showMoreSettings"
        :item-errors="materialErrors"
        @add-material="handleAddMaterial"
        @remove-material="handleRemoveMaterial"
      />

      <!-- Action Buttons -->
      <div class="mt-4 flex justify-end space-x-2">
        <TextButton size="md" variant="outline" @click="() => props.onCancel()">
          {{ t('button.cancel') }}
        </TextButton>
        <TextButton
          variant="secondary"
          :disabled="props.disabledSaveButton"
          size="md"
          @click="handleSave"
        >
          {{ saveButtonText || t('button.save') }}
        </TextButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed, nextTick, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import TextButton from '@/components/core/button/TextButton.vue';
import H3Title from '@/components/core/title/H3Title.vue';
import TaskFormMoreSettings from '@/components/task/TaskFormMoreSettings.vue';

const props = defineProps<{
  initialData?: CreateTaskSchema;
  constructionId: string;
  errors: {
    title?: string;
    description?: string;
  };
  errorMessage?: string;
  showMore?: boolean;
  onSave: () => void;
  onCancel: () => void;
  saveButtonText?: string;
  disabledSaveButton?: boolean;
}>();

const { t } = useI18n();

const inputRef = ref<HTMLInputElement | null>(null);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const showMoreSettings = ref(false);
const materialErrors = ref<Record<number, string>>({});

// 初始化更多設定顯示狀態
if (props.showMore) {
  showMoreSettings.value = true;
}

const { value: title } = useField<string>('title');
const { value: description } = useField<string>('description');
const { value: materials } = useField('materials');
const { value: reminderDateTime } = useField<string | undefined>('reminderDateTime');
const { value: endDateTime } = useField<string | undefined>('endDateTime');

// 顯示卡片模式
const showTitle = computed(() =>
  props.initialData ? t('title.edit_task') + ' - ' + props.initialData?.title : t('title.add_task')
);

// 切換顯示更多設定
const toggleMoreSettings = () => {
  // 如果要關閉更多設定區域，先清除內容
  if (showMoreSettings.value) {
    materials.value = [];
    reminderDateTime.value = undefined;
    endDateTime.value = undefined;
    materialErrors.value = {};
  } else if (
    props.initialData?.materials?.length ||
    props.initialData?.reminderDateTime ||
    props.initialData?.endDateTime
  ) {
    // 如果是打開更多設定，且有初始數據，則恢復初始數據
    materials.value = props.initialData.materials || [];
    reminderDateTime.value = props.initialData.reminderDateTime;
    endDateTime.value = props.initialData.endDateTime;
  }

  // 切換顯示狀態
  showMoreSettings.value = !showMoreSettings.value;
};

// 材料相關處理方法
const handleAddMaterial = () => {
  // 可以在這裡添加額外的邏輯，如果需要的話
  clearMaterialErrors();
};

const handleRemoveMaterial = (index: number) => {
  // 移除對應的錯誤信息
  if (materialErrors.value[index]) {
    const newErrors = { ...materialErrors.value };
    delete newErrors[index];

    // 重新調整索引
    const adjustedErrors: Record<number, string> = {};
    Object.keys(newErrors).forEach((key) => {
      const numKey = parseInt(key);
      if (numKey > index) {
        adjustedErrors[numKey - 1] = newErrors[numKey];
      } else {
        adjustedErrors[numKey] = newErrors[numKey];
      }
    });

    materialErrors.value = adjustedErrors;
  }
};

// 清除材料驗證錯誤
const clearMaterialErrors = () => {
  materialErrors.value = {};
};

// 處理保存按鈕點擊
const handleSave = async () => {
  await props.onSave();
};

// 提供方法給父組件
defineExpose({
  clearMaterialErrors,
  focusInput: () => {
    nextTick(() => {
      inputRef.value?.focus();
    });
  },
  handleAddMaterial,
  handleRemoveMaterial,
});

// 在組件掛載後聚焦輸入框
onBeforeMount(() => {
  nextTick(() => {
    inputRef.value?.focus();
  });
});
</script>

<style scoped></style>
