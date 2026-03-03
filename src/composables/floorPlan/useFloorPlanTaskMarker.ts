/**
 * 平面圖任務與標記關聯 composable
 * 處理任務與標記點的交互邏輯
 */

import { ref, type Ref } from 'vue';

import type { TaskResponse } from '@/types/response';
import type { TaskMarker } from '@/utils/floorPlan/floorPlanMarker';

export interface UseFloorPlanTaskMarkerOptions {
  taskMarkers: Ref<TaskMarker[]>;
  isAddingMarker: Ref<boolean>;
  selectedMarkerId: Ref<string | null>;
  scale: Ref<number>;
  translateX: Ref<number>;
  translateY: Ref<number>;
  imageContainer: Ref<HTMLDivElement | undefined>;
  floorPlanImg: Ref<HTMLImageElement | undefined>;
  createMarker: (x: number, y: number) => void;
  selectMarker: (markerId: string) => void;
  tasks: Ref<TaskResponse[] | undefined>;
}

export const useFloorPlanTaskMarker = (options: UseFloorPlanTaskMarkerOptions) => {
  const {
    taskMarkers,
    isAddingMarker,
    selectedMarkerId,
    scale,
    translateX,
    translateY,
    imageContainer,
    floorPlanImg,
    createMarker,
    selectMarker,
    tasks,
  } = options;

  const selectedTaskId = ref<string | null>(null);

  // 處理圖片點擊事件（支持任務關聯）
  const handleImageClickWithTask = (event: MouseEvent) => {
    if (!isAddingMarker.value || !floorPlanImg.value || !imageContainer.value) return;

    event.stopPropagation();

    const img = floorPlanImg.value;
    const container = imageContainer.value;
    const rect = container.getBoundingClientRect();

    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // 計算相對於圖片的百分比位置
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;

    // 計算圖片在容器中的實際尺寸
    const imgDisplayWidth = img.naturalWidth * scale.value;
    const imgDisplayHeight = img.naturalHeight * scale.value;

    // 計算圖片左上角在容器中的位置
    const imgLeft = centerX + translateX.value - imgDisplayWidth / 2;
    const imgTop = centerY + translateY.value - imgDisplayHeight / 2;

    // 計算點擊位置相對於圖片的座標
    const imgX = clickX - imgLeft;
    const imgY = clickY - imgTop;

    // 轉換為百分比
    const relativeX = (imgX / imgDisplayWidth) * 100;
    const relativeY = (imgY / imgDisplayHeight) * 100;

    // 檢查點擊是否在圖片範圍內
    if (relativeX >= 0 && relativeX <= 100 && relativeY >= 0 && relativeY <= 100) {
      createMarkerWithTask(relativeX, relativeY);
    }
  };

  // 覆寫原始的 createMarker 方法以支持任務關聯
  const createMarkerWithTask = (x: number, y: number) => {
    if (selectedTaskId.value) {
      // 為選中的任務創建標記
      const task = tasks.value?.find((t) => t.id === selectedTaskId.value);
      if (task) {
        const newMarker = {
          id: `marker-${Date.now()}`,
          x,
          y,
          title: task.title,
          description: task.description || undefined,
          taskId: task.id,
        };
        taskMarkers.value.push(newMarker);
        isAddingMarker.value = false;
        selectedMarkerId.value = newMarker.id;
        selectedTaskId.value = null;
      }
    } else {
      // 使用原始的創建方法
      createMarker(x, y);
    }
  };

  // 處理任務選擇
  const handleTaskSelect = (taskId: string) => {
    selectedTaskId.value = taskId;
    // 如果任務已有標記，選中該標記
    const marker = taskMarkers.value.find((m) => m.taskId === taskId);
    if (marker) {
      selectMarker(marker.id);
    }
  };

  // 為任務創建標記
  const handleCreateMarkerForTask = (taskId: string) => {
    const task = tasks.value?.find((t) => t.id === taskId);
    if (!task) return;

    selectedTaskId.value = taskId;
    // 啟動標記添加模式
    isAddingMarker.value = true;
  };

  // 連結任務到現有標記
  const handleLinkTaskToMarker = (taskId: string) => {
    const marker = taskMarkers.value.find((m) => m.taskId === taskId);
    if (marker) {
      selectMarker(marker.id);
    }
  };

  return {
    selectedTaskId,
    handleImageClickWithTask,
    createMarkerWithTask,
    handleTaskSelect,
    handleCreateMarkerForTask,
    handleLinkTaskToMarker,
  };
};
