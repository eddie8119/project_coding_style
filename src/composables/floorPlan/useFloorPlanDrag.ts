/**
 * 平面圖拖拽功能
 * 處理滑鼠拖拽和平移計算
 */

import { ref, type Ref } from 'vue';

import { calculateDragMove, type DragMoveParams } from '@/utils/floorPlan/floorPlanZoom';

export interface UseFloorPlanDragOptions {
  translateX: Ref<number>;
  translateY: Ref<number>;
}

export const useFloorPlanDrag = (options: UseFloorPlanDragOptions) => {
  const { translateX, translateY } = options;

  const isDragging = ref(false);
  const dragStartX = ref(0);
  const dragStartY = ref(0);
  const dragStartTranslateX = ref(0);
  const dragStartTranslateY = ref(0);

  const handleMouseDown = (event: MouseEvent, isAddingMarker: boolean) => {
    if (isAddingMarker) return;

    isDragging.value = true;
    dragStartX.value = event.clientX;
    dragStartY.value = event.clientY;
    dragStartTranslateX.value = translateX.value;
    dragStartTranslateY.value = translateY.value;
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value) return;

    const params: DragMoveParams = {
      event,
      dragStartX: dragStartX.value,
      dragStartY: dragStartY.value,
      dragStartTranslateX: dragStartTranslateX.value,
      dragStartTranslateY: dragStartTranslateY.value,
    };

    const { translateX: newTranslateX, translateY: newTranslateY } = calculateDragMove(params);
    translateX.value = newTranslateX;
    translateY.value = newTranslateY;
  };

  const handleMouseUp = () => {
    isDragging.value = false;
  };

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
