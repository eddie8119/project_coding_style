import { ref, type Ref } from 'vue';

import type { TaskResponse } from '@/types/response';

export interface UseNewPinDragOptions {
  pinPosition: Ref<{ x: number; y: number }>;
  isAddingPin: Ref<boolean>;
  selectedTaskIdForPin: Ref<string | null>;
  imageContainer: Ref<HTMLDivElement | undefined>;
  currentFloorPlanKey: Ref<string>;
  calculatePercentage: (
    clientX: number,
    clientY: number
  ) => { xPercent: number; yPercent: number } | null;
  updateTask: (taskId: string, data: Partial<TaskResponse>) => Promise<{ success: boolean }>;
}

export const useNewPinDrag = ({
  pinPosition,
  isAddingPin,
  selectedTaskIdForPin,
  imageContainer,
  currentFloorPlanKey,
  calculatePercentage,
  updateTask,
  tasks,
}: UseNewPinDragOptions & { tasks: Ref<TaskResponse[] | null> }) => {
  const isDraggingPin = ref(false);

  const updatePinPosition = (event: MouseEvent) => {
    if (!isDraggingPin.value || !imageContainer.value) return;

    const rect = imageContainer.value.getBoundingClientRect();
    pinPosition.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDraggingPin = (event: MouseEvent) => {
    if (!isAddingPin.value) return;
    isDraggingPin.value = true;
    updatePinPosition(event);
  };

  const endDraggingPin = async (event: MouseEvent): Promise<boolean> => {
    if (!isDraggingPin.value || !selectedTaskIdForPin.value || !currentFloorPlanKey.value) {
      isDraggingPin.value = false;
      return false;
    }

    const coords = calculatePercentage(event.clientX, event.clientY);
    if (!coords) {
      isDraggingPin.value = false;
      return false;
    }

    try {
      const task = tasks.value?.find((t) => t.id === selectedTaskIdForPin.value);
      if (!task) return false;

      const newPin = {
        floorPlanKey: currentFloorPlanKey.value,
        xPercent: coords.xPercent,
        yPercent: coords.yPercent,
      };

      const existingPins = task.pinLocation || [];
      const updatedPins = [...existingPins, newPin];

      const result = await updateTask(selectedTaskIdForPin.value, {
        pinLocation: updatedPins,
      } as Partial<TaskResponse>);

      isDraggingPin.value = false;
      if (result.success) {
        isAddingPin.value = false;
        selectedTaskIdForPin.value = null;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error saving pin location:', error);
      isDraggingPin.value = false;
      return false;
    }
  };

  const resetNewPinState = () => {
    isDraggingPin.value = false;
  };

  return {
    isDraggingPin,
    startDraggingPin,
    updatePinPosition,
    endDraggingPin,
    resetNewPinState,
  };
};
