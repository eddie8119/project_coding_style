/**
 * 平面圖上傳功能
 * 處理檔案選擇、驗證、轉換和資料庫更新
 */

import { ElMessage } from 'element-plus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { FloorPlanItem } from '@/types/response';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

import { isSupportedPlanFile, processPlanFile } from '@/utils/floorPlan/floorPlanImage';

export interface UseFloorPlanUploadOptions {
  updateProject: (data: Partial<CreateProjectSchema>) => Promise<unknown>;
}

export const useFloorPlanUpload = (options: UseFloorPlanUploadOptions) => {
  const { updateProject } = options;

  const fileInput = ref<HTMLInputElement>();
  const isUploadingFloorPlan = ref(false);
  const { t } = useI18n();

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      await uploadFloorPlanImages(Array.from(files));
    }
  };

  const handleFileDrop = async (event: DragEvent) => {
    const files = event.dataTransfer?.files;
    if (files) {
      await uploadFloorPlanImages(Array.from(files));
    }
  };

  const uploadFloorPlanImages = async (files: File[]) => {
    isUploadingFloorPlan.value = true;
    try {
      const items: FloorPlanItem[] = [];

      for (const file of files) {
        if (!isSupportedPlanFile(file)) {
          ElMessage.error(t('message.upload.unsupported_format', { fileName: file.name }));
          continue;
        }

        try {
          const data = await processPlanFile(file);
          items.push({ key: crypto.randomUUID(), data });
        } catch (error) {
          ElMessage.error(t('message.upload.process_failed', { fileName: file.name }));
          console.error('Failed to process file:', error);
        }
      }

      if (items.length > 0) {
        await updateProject({
          floorPlanUrls: items,
        });
        ElMessage.success(t('message.upload.success', { count: items.length }));
      }
    } catch (error) {
      ElMessage.error(t('message.upload.failed'));
      console.error('Failed to upload floor plan images:', error);
    } finally {
      isUploadingFloorPlan.value = false;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    }
  };

  const resetFloorPlan = () => {
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  return {
    fileInput,
    isUploadingFloorPlan,
    triggerFileInput,
    handleFileSelect,
    handleFileDrop,
    uploadFloorPlanImages,
    resetFloorPlan,
  };
};
