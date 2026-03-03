/**
 * 平面圖圖片管理 composable
 * 處理圖片上傳、切換、重置等邏輯
 */

import { computed, ref, type Ref, watch } from 'vue';

import type { FloorPlanItem } from '@/types/response';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

export interface UseFloorPlanImageOptions {
  floorPlanUrls: Ref<FloorPlanItem[]>;
  updateProject: (data: Partial<CreateProjectSchema>) => Promise<unknown>;
  onResetComplete?: () => void;
}

/**
 * 提取圖片資料 (data URL)
 */
const extractImageData = (item: FloorPlanItem): string => {
  return item.data;
};

export const useFloorPlanImage = (options: UseFloorPlanImageOptions) => {
  const { floorPlanUrls, updateProject, onResetComplete } = options;

  // 圖片管理狀態
  const currentImageIndex = ref(0);
  const uploadedImages = ref<FloorPlanItem[]>([]);
  const isResettingFloorPlan = ref(false);

  // 合併專案中的圖片和新上傳的圖片
  const allFloorPlanUrls = computed<FloorPlanItem[]>(() => {
    return [...floorPlanUrls.value, ...uploadedImages.value];
  });

  // 當前顯示的圖片 (提取 data URL)
  const currentFloorPlanImage = computed(() => {
    const item = allFloorPlanUrls.value[currentImageIndex.value];
    return item ? extractImageData(item) : '';
  });

  // 當前圖片的 key (用於釘選)
  const currentFloorPlanKey = computed(() => {
    const item = allFloorPlanUrls.value[currentImageIndex.value];
    return item ? item.key : '';
  });

  // 圖片切換功能
  const prevImage = () => {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value--;
    }
  };

  const nextImage = () => {
    if (currentImageIndex.value < allFloorPlanUrls.value.length - 1) {
      currentImageIndex.value++;
    }
  };

  // 監聽 floorPlanUrls 變化，同步 uploadedImages 並確保索引有效
  watch(
    floorPlanUrls,
    (newValue) => {
      uploadedImages.value = uploadedImages.value.filter((uploaded) => {
        return !newValue.some((existing) => existing.key === uploaded.key);
      });

      // 確保索引有效性，但不強制重置為 0
      const totalImages = newValue.length + uploadedImages.value.length;
      if (currentImageIndex.value >= totalImages) {
        currentImageIndex.value = Math.max(0, totalImages - 1);
      }
    },
    { immediate: true }
  );

  // 添加上傳的圖片
  const addUploadedImage = async (image: FloorPlanItem): Promise<void> => {
    uploadedImages.value.push(image);
    currentImageIndex.value = allFloorPlanUrls.value.length - 1;

    try {
      const persistedItems = [...floorPlanUrls.value, ...uploadedImages.value];
      await updateProject({ floorPlanUrls: persistedItems });
    } catch (error) {
      uploadedImages.value = uploadedImages.value.filter((item) => item.key !== image.key);
      if (allFloorPlanUrls.value.length === 0) {
        currentImageIndex.value = 0;
      } else {
        currentImageIndex.value = Math.max(0, allFloorPlanUrls.value.length - 1);
      }
      throw error;
    }
  };

  // 重置功能 - 顯示確認對話框
  const resetFloorPlan = () => {
    isResettingFloorPlan.value = true;
  };

  // 刪除當前圖片
  const deleteCurrentImage = async () => {
    try {
      const currentIndex = currentImageIndex.value;
      const isUploadedImage = currentIndex >= floorPlanUrls.value.length;

      if (isUploadedImage) {
        // 移除當前上傳的圖片
        const uploadedIndex = currentIndex - floorPlanUrls.value.length;
        uploadedImages.value.splice(uploadedIndex, 1);

        // 調整索引
        if (currentImageIndex.value >= allFloorPlanUrls.value.length) {
          currentImageIndex.value = Math.max(0, allFloorPlanUrls.value.length - 1);
        }

        // 如果還有圖片，更新專案；否則清空
        if (allFloorPlanUrls.value.length > 0) {
          const persistedItems = [...floorPlanUrls.value, ...uploadedImages.value];
          await updateProject({ floorPlanUrls: persistedItems });
        } else {
          await updateProject({ floorPlanUrls: null });
        }
      } else {
        // 移除專案中的圖片 - 只更新該索引位置
        const updatedUrls = floorPlanUrls.value.filter((_, index) => index !== currentIndex);

        // 調整索引
        if (currentImageIndex.value >= updatedUrls.length) {
          currentImageIndex.value = Math.max(0, updatedUrls.length - 1);
        }

        // 更新專案
        if (updatedUrls.length > 0) {
          await updateProject({ floorPlanUrls: updatedUrls });
        } else {
          await updateProject({ floorPlanUrls: null });
        }
      }

      isResettingFloorPlan.value = false;
      onResetComplete?.();
    } catch (error) {
      console.error('Error deleting floor plan:', error);
      isResettingFloorPlan.value = false;
    }
  };

  // 替換當前圖片 (保留原有 Key 以維持標記關聯)
  const replaceCurrentImage = async (newImage: FloorPlanItem) => {
    try {
      const currentIndex = currentImageIndex.value;
      const currentKey = currentFloorPlanKey.value;

      // 使用原有 Key，但使用新圖片數據
      const itemToSave: FloorPlanItem = {
        key: currentKey,
        data: newImage.data,
      };

      const isUploadedImage = currentIndex >= floorPlanUrls.value.length;

      if (isUploadedImage) {
        // 更新 uploadedImages
        const uploadedIndex = currentIndex - floorPlanUrls.value.length;
        uploadedImages.value[uploadedIndex] = itemToSave;

        const persistedItems = [...floorPlanUrls.value, ...uploadedImages.value];
        await updateProject({ floorPlanUrls: persistedItems });
      } else {
        // 更新 floorPlanUrls (需要構建新陣列)
        const updatedUrls = [...floorPlanUrls.value];
        updatedUrls[currentIndex] = itemToSave;

        await updateProject({ floorPlanUrls: updatedUrls });
      }
    } catch (error) {
      console.error('Error replacing floor plan:', error);
      throw error;
    }
  };

  // 取消操作
  const cancelOperation = () => {
    isResettingFloorPlan.value = false;
  };

  return {
    // 狀態
    currentImageIndex,
    uploadedImages,
    isResettingFloorPlan, // 現在用作 "是否正在顯示刪除確認"
    allFloorPlanUrls,
    currentFloorPlanImage,
    currentFloorPlanKey,

    // 方法
    prevImage,
    nextImage,
    addUploadedImage,
    resetFloorPlan, // 保留此別名以兼容，實際觸發刪除確認
    confirmResetFloorPlan: deleteCurrentImage, // 將確認操作映射到刪除
    cancelResetFloorPlan: cancelOperation,
    deleteCurrentImage,
    replaceCurrentImage,
  };
};
