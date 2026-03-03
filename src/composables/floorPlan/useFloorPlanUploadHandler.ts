/**
 * 平面圖文件上傳處理 composable
 * 處理文件選擇和拖拽上傳邏輯
 */

import { ElMessage } from 'element-plus';

import type { FloorPlanItem } from '@/types/response';

import { isSupportedPlanFile, processPlanFile } from '@/utils/floorPlan/floorPlanImage';

export interface UseFloorPlanUploadHandlerOptions {
  onImageAdded: (image: FloorPlanItem) => Promise<void> | void;
}

export const useFloorPlanUploadHandler = (options: UseFloorPlanUploadHandlerOptions) => {
  const { onImageAdded } = options;

  // 生成唯一的 key
  const generateFloorPlanKey = (): string => {
    return crypto.randomUUID();
  };

  // 處理文件選擇事件
  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
    // 重置 input 以便重新選擇相同檔案
    target.value = '';
  };

  // 處理文件拖拽事件
  const handleFileDrop = async (event: DragEvent) => {
    const file = event.dataTransfer?.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!isSupportedPlanFile(file)) {
      ElMessage.error('不支援的檔案格式');
      return;
    }

    try {
      const data = await processPlanFile(file);
      const floorPlanItem: FloorPlanItem = {
        key: generateFloorPlanKey(),
        data,
      };
      await onImageAdded(floorPlanItem);
    } catch (error) {
      ElMessage.error('處理檔案失敗');
      console.error('Error processing file:', error);
    }
  };

  return {
    handleFileSelect,
    handleFileDrop,
  };
};
