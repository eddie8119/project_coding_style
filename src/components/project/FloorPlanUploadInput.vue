<template>
  <ElFormItem :label="t('label.project.floor_plan')" :error="errorMessage">
    <div class="w-full space-y-4">
      <!-- 上傳區域 -->
      <UploadArea ref="uploadAreaRef" @file-select="handleFileSelect" @file-drop="handleFileDrop" />

      <!-- 圖片預覽 -->
      <div v-if="previews.length > 0" class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-700">
            {{ t('label.project.uploaded_images_count', { count: previews.length }) }}
          </p>
          <ElButton type="danger" size="small" @click="clearAllImages">
            {{ t('button.clear_all') }}
          </ElButton>
        </div>
        <div class="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div class="flex gap-4">
            <div v-for="(preview, index) in previews" :key="index" class="relative flex-shrink-0">
              <img
                :src="preview"
                alt="Floor plan preview"
                class="h-40 w-40 rounded-lg border border-gray-300 object-cover"
              />
              <div
                class="bg-black/50 absolute left-2 top-2 flex items-center justify-center rounded px-2 py-1 text-xs text-white"
              >
                {{ index + 1 }}
              </div>

              <div class="absolute right-2 top-2">
                <TrashButton @click="removeImage(index)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ElFormItem>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { useField } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FloorPlanItem } from '@/types/response';

import UploadArea from '@/components/core/input/UploadArea.vue';
import TrashButton from '@/components/ui/TrashButton.vue';
import { isSupportedPlanFile, processPlanFile } from '@/utils/floorPlan/floorPlanImage';

const props = withDefaults(
  defineProps<{
    fieldName?: string;
  }>(),
  {
    fieldName: 'floorPlanUrls',
  }
);

const { t } = useI18n();
const uploadAreaRef = ref();
const previews = ref<string[]>([]);
const items = ref<FloorPlanItem[]>([]);

const { value, errorMessage, setErrors } = useField(props.fieldName);

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (files) {
    Array.from(files).forEach((file) => {
      handleFileUpload(file);
    });
    // 重置 input 以便重新選擇相同檔案
    target.value = '';
  }
};

const handleFileDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files;
  if (files) {
    Array.from(files).forEach((file) => {
      handleFileUpload(file);
    });
  }
};

const handleFileUpload = async (file: File) => {
  // 驗證檔案類型
  if (!isSupportedPlanFile(file)) {
    ElMessage.error(t('message.error.invalid_file_type'));
    setErrors(t('message.error.invalid_file_type'));
    return;
  }

  // 驗證檔案大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error(t('message.error.file_too_large'));
    setErrors(t('message.error.file_too_large'));
    return;
  }

  try {
    const result = await processPlanFile(file);
    previews.value.push(result);
    items.value.push({ key: crypto.randomUUID(), data: result });
    value.value = items.value;
    // 上傳成功，清除先前的錯誤狀態
    setErrors([]);
  } catch (error) {
    ElMessage.error(t('message.error.file_processing_error'));
    console.error('File processing error:', error);
  }
};

const removeImage = (index: number) => {
  previews.value.splice(index, 1);
  items.value.splice(index, 1);
  value.value = items.value;
};

const clearAllImages = () => {
  previews.value = [];
  items.value = [];
  value.value = [];
  // 清除欄位錯誤
  setErrors([]);
  // 重置 UploadArea 的 input
  if (uploadAreaRef.value?.fileInputRef) {
    uploadAreaRef.value.fileInputRef.value = '';
  }
};
</script>
