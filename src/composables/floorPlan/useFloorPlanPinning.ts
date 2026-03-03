/**
 * 平面圖釘選功能 composable
 * 管理任務在平面圖上的釘選位置
 */

import { computed, ref, type Ref } from 'vue';

import { useNewPinDrag } from '../pinning/useNewPinDrag';
import { usePinPositionCalculator } from '../pinning/usePinPositionCalculator';
import { usePinSelection } from '../pinning/usePinSelection';

import type { PinLocation } from '@/types/pin';
import type { TaskResponse } from '@/types/response';

export interface UseFloorPlanPinningOptions {
  tasks: Ref<TaskResponse[] | null>;
  currentFloorPlanKey: Ref<string>;
  scale: Ref<number>;
  translateX: Ref<number>;
  translateY: Ref<number>;
  imageContainer: Ref<HTMLDivElement | undefined>;
  floorPlanImg: Ref<HTMLImageElement | undefined>;
  imageLoaded: Ref<boolean>;
  updateTask: (taskId: string, data: Partial<TaskResponse>) => Promise<{ success: boolean }>;
}

export const useFloorPlanPinning = (options: UseFloorPlanPinningOptions) => {
  const {
    tasks,
    currentFloorPlanKey,
    scale,
    translateX,
    translateY,
    imageContainer,
    floorPlanImg,
    imageLoaded,
    updateTask,
  } = options;

  const { calculatePercentage, getPinPixelPosition } = usePinPositionCalculator({
    imageContainer,
    floorPlanImg,
    scale,
    translateX,
    translateY,
    imageLoaded,
  });

  const { isAddingPin, selectedTaskIdForPin, pinPosition, selectTaskForPin, cancelPin } =
    usePinSelection({
      imageContainer,
    });

  const { isDraggingPin, startDraggingPin, updatePinPosition, endDraggingPin, resetNewPinState } =
    useNewPinDrag({
      pinPosition,
      isAddingPin,
      selectedTaskIdForPin,
      imageContainer,
      currentFloorPlanKey,
      calculatePercentage,
      updateTask,
      tasks,
    });

  // 拖拽已存在的釘選
  const isDraggingExistingPin = ref(false);
  const draggingExistingTaskId = ref<string | null>(null);
  const draggingExistingPinIndex = ref<number | null>(null);
  // 拖拽門檻狀態（判斷 click vs drag）
  const pendingExistingPinTaskId = ref<string | null>(null);
  const existingPinPressStart = ref<{ x: number; y: number } | null>(null);
  const DRAG_THRESHOLD_PX = 4;

  const resetExistingPinDragState = () => {
    isDraggingExistingPin.value = false;
    draggingExistingTaskId.value = null;
    draggingExistingPinIndex.value = null;
    pendingExistingPinTaskId.value = null;
    existingPinPressStart.value = null;
  };

  // 按下已存在的釘選（先記錄，超過門檻才真正進入拖拽）
  const startDraggingExistingPin = (taskId: string, event: MouseEvent, pinIndex: number) => {
    pendingExistingPinTaskId.value = taskId;
    draggingExistingPinIndex.value = pinIndex;
    existingPinPressStart.value = { x: event.clientX, y: event.clientY };
    // 預先更新即時位置，便於一旦進入拖拽立即有預覽
    if (imageContainer.value) {
      const rect = imageContainer.value.getBoundingClientRect();
      pinPosition.value = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }
  };

  const ensureExistingPinDragHasStarted = (event: MouseEvent): boolean => {
    if (isDraggingExistingPin.value) return true;
    if (!pendingExistingPinTaskId.value || !existingPinPressStart.value) return false;

    const dx = event.clientX - existingPinPressStart.value.x;
    const dy = event.clientY - existingPinPressStart.value.y;
    if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD_PX) return false;

    draggingExistingTaskId.value = pendingExistingPinTaskId.value;
    isDraggingExistingPin.value = true;
    return true;
  };

  // 拖拽中更新既有釘選位置（沿用 pinPosition 作為即時位置）
  const updateExistingPinPosition = (event: MouseEvent) => {
    if (!imageContainer.value) return;
    if (!ensureExistingPinDragHasStarted(event)) return; // 未超過門檻不算拖拽
    const rect = imageContainer.value.getBoundingClientRect();
    pinPosition.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  // 結束拖拽並保存既有釘選位置
  const endDraggingExistingPin = async (event: MouseEvent): Promise<boolean> => {
    // 如果沒有 pending，直接重置
    if (!pendingExistingPinTaskId.value) {
      resetExistingPinDragState();
      return false;
    }

    // 未達門檻：視為點擊，不更新位置
    if (!isDraggingExistingPin.value) {
      resetExistingPinDragState();
      return false;
    }

    if (!draggingExistingTaskId.value || !currentFloorPlanKey.value) {
      resetExistingPinDragState();
      return false;
    }

    const coords = calculatePercentage(event.clientX, event.clientY);
    if (!coords) {
      resetExistingPinDragState();
      return false;
    }

    const taskToUpdate = tasks.value?.find((t) => t.id === draggingExistingTaskId.value);
    if (!taskToUpdate || !taskToUpdate.pinLocation) {
      resetExistingPinDragState();
      return false;
    }

    const updatedPin = {
      floorPlanKey: currentFloorPlanKey.value,
      xPercent: coords.xPercent,
      yPercent: coords.yPercent,
    };

    if (draggingExistingPinIndex.value === null) {
      resetExistingPinDragState();
      return false;
    }
    const newPinLocations = [...taskToUpdate.pinLocation];
    newPinLocations[draggingExistingPinIndex.value] = updatedPin;

    try {
      const result = await updateTask(draggingExistingTaskId.value, {
        pinLocation: newPinLocations,
      } as Partial<TaskResponse>);
      const ok = !!result?.success;
      resetExistingPinDragState();
      return ok;
    } catch (error) {
      console.error('Error saving existing pin location:', error);
      resetExistingPinDragState();
      return false;
    }
  };

  // 取消釘選
  const cancelPinSelection = () => {
    cancelPin();
    resetNewPinState();
  };

  // 獲取任務的釘選位置
  const getTaskPinLocation = (taskId: string): PinLocation[] | null => {
    if (!tasks.value) return null;
    const task = tasks.value.find((t) => t.id === taskId);
    return task?.pinLocation || null;
  };

  // 獲取當前圖片上的所有釘選
  const pinsOnCurrentImage = computed(() => {
    if (!tasks.value || !currentFloorPlanKey.value) return [];

    return tasks.value.flatMap((task) =>
      (task.pinLocation || [])
        .map((pin, index) => ({ ...pin, taskId: task.id, taskTitle: task.title, index }))
        .filter((pin) => pin.floorPlanKey === currentFloorPlanKey.value)
    );
  });

  return {
    // 狀態
    isAddingPin,
    selectedTaskIdForPin,
    pinPosition,
    isDraggingPin,
    isDraggingExistingPin,
    draggingExistingTaskId,
    draggingExistingPinIndex,
    pendingExistingPinTaskId,

    // 方法
    selectTaskForPin,
    cancelPin: cancelPinSelection,
    startDraggingPin,
    updatePinPosition,
    endDraggingPin,
    startDraggingExistingPin,
    updateExistingPinPosition,
    endDraggingExistingPin,
    getTaskPinLocation,
    getPinPixelPosition,

    // 計算屬性
    pinsOnCurrentImage,
  };
};
