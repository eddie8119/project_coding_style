import { ElMessage } from 'element-plus';
import { type ComputedRef, type Ref, ref, watchEffect } from 'vue';

import type { FixedPin, FlatPin, PinLocation } from '@/types/pin';
import type { TaskResponse } from '@/types/response';

type UpdateTaskResult = {
  success: boolean;
  data?: unknown;
  message?: string;
};

type UpdateTaskFn = (taskId: string, updates: Partial<TaskResponse>) => Promise<UpdateTaskResult>;

export function useFloorPlanMarkerUtils({
  pinsOnCurrentImage,
  getPinPixelPosition,
  updateTask,
  tasksRef,
}: {
  pinsOnCurrentImage: ComputedRef<FlatPin[] | undefined>;
  getPinPixelPosition: (pinLocation: PinLocation) => { x: number; y: number } | null;
  updateTask: UpdateTaskFn;
  tasksRef: Ref<TaskResponse[]>;
}) {
  const fixedPins = ref<FixedPin[]>([]);

  watchEffect(
    () => {
      if (!pinsOnCurrentImage.value) {
        fixedPins.value = [];
        return;
      }

      const result: FixedPin[] = [];

      for (const pin of pinsOnCurrentImage.value) {
        const pos = getPinPixelPosition(pin);
        if (!pos) continue;
        result.push({
          x: pos.x,
          y: pos.y,
          taskId: pin.taskId,
          title: pin.taskTitle,
          index: pin.index,
        });
      }

      fixedPins.value = result;
    },
    { flush: 'post' }
  );

  const handleRemoveTaskPin = async (taskId: string) => {
    try {
      const result = await updateTask(taskId, { pinLocation: null });
      if (result?.success && tasksRef.value) {
        const task = tasksRef.value.find((t) => t.id === taskId);
        if (task) {
          task.pinLocation = null;
        }
        ElMessage.success('已移除釘選');
      }
      return result;
    } catch (error) {
      ElMessage.error('移除釘選失敗');
      return { success: false, error } as UpdateTaskResult;
    }
  };

  return {
    fixedPins,
    handleRemoveTaskPin,
  };
}
