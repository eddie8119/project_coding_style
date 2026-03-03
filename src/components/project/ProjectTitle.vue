<template>
  <div v-if="!isEditingTitle">
    <button
      class="text-color-difference inline-flex items-center gap-2 rounded-md text-2xl font-bold transition-all duration-300 ease-in-out hover:bg-slate-200 dark:hover:bg-slate-600"
      @click="startEditing"
    >
      <span>{{ projectTitle }} {{ t('project.project') }}</span>
      <EditIcon />
    </button>
  </div>

  <div v-else class="flex place-items-center">
    <input
      ref="titleInputRef"
      v-model="tempTitle"
      type="text"
      class="background-color-difference text-color-difference block h-8 w-[230px] rounded-lg border border-gray-300 px-3 text-2xl leading-tight focus:border-blue-500 focus:ring-blue-500"
      :placeholder="t('placeholder.project_name')"
      @focus="onInputFocus"
      @blur="isEditingTitle = false"
      @keyup.enter="saveTitle"
      @keyup.esc="cancelEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import EditIcon from '@/components/ui/EditIcon.vue';
import { useEditableTitle } from '@/composables/useEditableTitle';

const props = defineProps<{
  id: string;
  projectTitle: string | undefined;
}>();

const emit = defineEmits<{
  (e: 'update:project-title', value: string): void;
}>() as (event: string, ...args: unknown[]) => void;

const { t } = useI18n();

// 使用可編輯標題的共用邏輯
const {
  isEditingTitle,
  tempTitle,
  titleInputRef,
  title: projectTitle,
  startEditing,
  onInputFocus,
  saveTitle,
  cancelEdit,
} = useEditableTitle(props, emit, 'projectTitle');
</script>

<style scoped>
.title-edit input {
  transition: none;
}
</style>
