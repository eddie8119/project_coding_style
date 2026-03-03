<template>
  <!-- 拖拽上傳區域 -->
  <div
    class="upload-container flex h-full w-full items-center justify-center"
    :class="uploadContainerClass"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @click="triggerFileInput"
  >
    <!-- 隱藏的檔案輸入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".xlsx,.xls"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- 上傳圖示和文字 -->
    <div class="flex flex-col items-center justify-center">
      <div v-if="loading" class="loading-state">
        <div class="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        <p class="text-gray-600">{{ t('upload.parsing_excel') }}...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="mb-4 text-4xl text-red-500">⚠️</div>
        <p class="mb-2 font-medium text-secondary-red">{{ t('upload_failed') }}</p>
        <p class="text-sm text-secondary-red">{{ error }}</p>
        <TextButton class="mt-3" variant="outline" size="sm" @click.stop="clearError">
          {{ t('button.upload_retry') }}
        </TextButton>
      </div>

      <div v-else class="normal-state flex flex-col items-center justify-center text-center">
        <div
          class="border-color-difference mb-4 flex h-[65px] w-[65px] items-center justify-center rounded-[24px] border"
        >
          <img src="@/assets/icons/Excel.svg" alt="Excel" class="h-8 w-8" />
        </div>

        <p class="text-sm text-gray-500 dark:text-gray-600">{{ t('upload.description') }}</p>
        <p class="mb-4 text-sm text-gray-500 dark:text-gray-600">
          {{ t('upload.description_cover') }}
        </p>
        <p class="text-xs text-gray-400 dark:text-gray-700">
          {{ t('upload.supported_formats') }}: .xlsx, .xls
        </p>
        <TextButton class="mt-4 px-2" variant="primary" size="md">
          {{ t('upload.process_excel_file') }}
        </TextButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';

interface Props {
  loading?: boolean;
  error?: string | null;
}

interface Emits {
  (e: 'file-uploaded', file: File): void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const emit = defineEmits<Emits>();

const { t } = useI18n();

const fileInputRef = ref<HTMLInputElement>();
const isDragOver = ref(false);
const selectedFile = ref<File | null>(null);

const uploadContainerClass = computed(() => ({
  'drag-over': isDragOver.value,
  loading: props.loading,
  error: Boolean(props.error),
}));

/**
 * 處理拖拽進入
 */
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = true;
};

/**
 * 處理拖拽離開
 */
const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;
};

/**
 * 處理檔案拖拽放置
 */
const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;

  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFile(files[0]);
  }
};

/**
 * 觸發檔案選擇
 */
const triggerFileInput = () => {
  if (props.loading) return;
  fileInputRef.value?.click();
};

/**
 * 處理檔案選擇
 */
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0) {
    handleFile(files[0]);
  }
};

/**
 * 處理檔案
 */
const handleFile = (file: File) => {
  selectedFile.value = file;
  emit('file-uploaded', file);
};

/**
 * 清除錯誤
 */
const clearError = () => {
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};
</script>

<style scoped></style>
