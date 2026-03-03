/**
 * 平面圖縮放和平移相關功能
 */

export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
  initialScale: number;
}

export interface DragState {
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
  dragStartTranslateX: number;
  dragStartTranslateY: number;
}

export interface WheelZoomParams {
  event: WheelEvent;
  currentScale: number;
  containerWidth: number;
  containerHeight: number;
  currentTranslateX: number;
  currentTranslateY: number;
}

export interface WheelZoomResult {
  newScale: number;
  newTranslateX: number;
  newTranslateY: number;
}

/**
 * 計算滾輪縮放結果（以滑鼠位置為中心）
 */
export const calculateWheelZoom = (params: WheelZoomParams): WheelZoomResult => {
  const {
    event,
    currentScale,
    containerWidth,
    containerHeight,
    currentTranslateX,
    currentTranslateY,
  } = params;

  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  const newScale = Math.max(0.1, Math.min(5, currentScale + delta));

  // 計算滑鼠相對於容器的位置（此處假設容器與畫面對齊，與原實作保持一致）
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  // 計算縮放中心點（容器中心）
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  // 調整平移以保持滑鼠位置不變
  const scaleDiff = newScale - currentScale;
  const newTranslateX = currentTranslateX - (mouseX - centerX) * scaleDiff;
  const newTranslateY = currentTranslateY - (mouseY - centerY) * scaleDiff;

  return {
    newScale,
    newTranslateX,
    newTranslateY,
  };
};

export interface DragMoveParams {
  event: MouseEvent;
  dragStartX: number;
  dragStartY: number;
  dragStartTranslateX: number;
  dragStartTranslateY: number;
}

export interface DragMoveResult {
  translateX: number;
  translateY: number;
}

/**
 * 計算拖拽移動結果
 */
export const calculateDragMove = (params: DragMoveParams): DragMoveResult => {
  const { event, dragStartX, dragStartY, dragStartTranslateX, dragStartTranslateY } = params;

  const deltaX = event.clientX - dragStartX;
  const deltaY = event.clientY - dragStartY;

  return {
    translateX: dragStartTranslateX + deltaX,
    translateY: dragStartTranslateY + deltaY,
  };
};

/**
 * 重置縮放和位置
 */
export const resetZoomState = (initialScale: number): ZoomState => {
  return {
    scale: initialScale,
    translateX: 0,
    translateY: 0,
    initialScale,
  };
};
