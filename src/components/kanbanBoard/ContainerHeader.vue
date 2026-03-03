<template>
  <div class="mb-3 flex items-center justify-between">
    <div class="flex items-center">
      <DragHandle v-if="!readOnly" handle-class="container-drag-handle" />
      <ContainerTitle
        :construction-name="constructionName"
        :container-id="constructionId"
        :read-only="readOnly"
        @update:construction-name="updateConstructionName"
        @editing-change="(v) => (isEditingTitle = v)"
      />
      <span class="text-color-difference">({{ tasksLength }})</span>
    </div>

    <div v-if="!readOnly" class="flex items-center gap-1">
      <OptionSelector
        v-if="isShowStatusFilter && !isEditingTitle && !taskListCollapsed"
        :model-value="selectedStatus"
        :options="options"
        :class-name="'w-[90px]'"
        @update:model-value="(v) => emit('update:selected-status', v)"
      />
      <TrashButton @click="showDeleteConstructionDialog = true" />
    </div>

    <!-- 刪除確認對話框 -->
    <DeleteDialog
      v-model="showDeleteConstructionDialog"
      :subject="t('project.construction')"
      :target="constructionName"
      :additional-info="t('message.sign.delete_construction_content')"
      @confirm="handleDeleteConstruction"
    />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { SelectorOption } from '@/types/selection';

import DeleteDialog from '@/components/core/dialog/DeleteDialog.vue';
import ContainerTitle from '@/components/kanbanBoard/ContainerTitle.vue';
import DragHandle from '@/components/ui/DragHandle.vue';
import OptionSelector from '@/components/ui/OptionSelector.vue';
import TrashButton from '@/components/ui/TrashButton.vue';
import { STATUS_FILTER_OPTIONS } from '@/constants/selection';

withDefaults(
  defineProps<{
    constructionName: string;
    constructionId: string;
    tasksLength: number;
    selectedStatus: string;
    options?: SelectorOption[];
    isShowStatusFilter: boolean;
    readOnly?: boolean;
    taskListCollapsed?: boolean;
  }>(),
  {
    options: () => [...STATUS_FILTER_OPTIONS],
    readOnly: false,
    taskListCollapsed: false,
  }
);

const emit = defineEmits<{
  (e: 'delete-container'): void;
  (e: 'update:construction-name', name: string): void;
  (e: 'update:selected-status', value: string): void;
}>();

const { t } = useI18n();
const showDeleteConstructionDialog = ref(false);
const isEditingTitle = ref(false);

// 處理容器名稱更新
const updateConstructionName = (newName: string) => {
  emit('update:construction-name', newName);
};

// 處理刪除工程類型
const handleDeleteConstruction = () => {
  emit('delete-container');
  showDeleteConstructionDialog.value = false;
};
</script>
