/**
 * 平面圖任務標記點相關功能
 */

export interface TaskMarker {
  id: string;
  x: number; // 相對於圖片的百分比位置 (0-100)
  y: number;
  title: string;
  description?: string;
  taskId?: string; // 關聯的任務 ID
}

export interface MarkerPositionParams {
  markerX: number;
  markerY: number;
  imageWidth: number;
  imageHeight: number;
  scale: number;
  translateX: number;
  translateY: number;
  containerWidth: number;
  containerHeight: number;
}

export interface MarkerStyle {
  left: string;
  top: string;
}

/**
 * 計算標記點在螢幕上的位置
 */
export const calculateMarkerStyle = (params: MarkerPositionParams): MarkerStyle => {
  const {
    markerX,
    markerY,
    imageWidth,
    imageHeight,
    scale,
    translateX,
    translateY,
    containerWidth,
    containerHeight,
  } = params;

  // 計算圖片在容器中的實際尺寸
  const scaledImageWidth = imageWidth * scale;
  const scaledImageHeight = imageHeight * scale;

  // 計算容器中心
  const containerCenterX = containerWidth / 2;
  const containerCenterY = containerHeight / 2;

  // 圖片左上角在容器中的位置
  const imgLeft = containerCenterX - scaledImageWidth / 2 + translateX;
  const imgTop = containerCenterY - scaledImageHeight / 2 + translateY;

  // 標記點在容器中的絕對位置
  const screenMarkerX = imgLeft + (markerX / 100) * scaledImageWidth;
  const screenMarkerY = imgTop + (markerY / 100) * scaledImageHeight;

  return {
    left: `${screenMarkerX}px`,
    top: `${screenMarkerY}px`,
  };
};

export interface ClickToMarkerParams {
  clickX: number;
  clickY: number;
  imageWidth: number;
  imageHeight: number;
  scale: number;
  translateX: number;
  translateY: number;
  containerWidth: number;
  containerHeight: number;
}

export interface ClickToMarkerResult {
  relativeX: number;
  relativeY: number;
  isValid: boolean;
}

/**
 * 將點擊位置轉換為圖片上的相對百分比座標
 */
export const convertClickToMarkerCoordinates = (
  params: ClickToMarkerParams
): ClickToMarkerResult => {
  const {
    clickX,
    clickY,
    imageWidth,
    imageHeight,
    scale,
    translateX,
    translateY,
    containerWidth,
    containerHeight,
  } = params;

  // 計算圖片在容器中的實際尺寸
  const scaledImageWidth = imageWidth * scale;
  const scaledImageHeight = imageHeight * scale;

  // 計算容器中心
  const containerCenterX = containerWidth / 2;
  const containerCenterY = containerHeight / 2;

  // 圖片左上角在容器中的位置
  const imgLeft = containerCenterX - scaledImageWidth / 2 + translateX;
  const imgTop = containerCenterY - scaledImageHeight / 2 + translateY;

  // 計算點擊位置相對於圖片的百分比
  const relativeX = ((clickX - imgLeft) / scaledImageWidth) * 100;
  const relativeY = ((clickY - imgTop) / scaledImageHeight) * 100;

  // 確保點擊在圖片範圍內
  const isValid = relativeX >= 0 && relativeX <= 100 && relativeY >= 0 && relativeY <= 100;

  return {
    relativeX,
    relativeY,
    isValid,
  };
};

/**
 * 創建新的標記點
 */
export const createNewMarker = (
  x: number,
  y: number,
  title: string,
  description?: string
): TaskMarker => {
  return {
    id: Date.now().toString(),
    x,
    y,
    title,
    description,
  };
};

/**
 * 更新標記點
 */
export const updateMarker = (
  marker: TaskMarker,
  updates: Partial<Omit<TaskMarker, 'id'>>
): TaskMarker => {
  return {
    ...marker,
    ...updates,
  };
};

/**
 * 刪除標記點
 */
export const deleteMarker = (markers: TaskMarker[], markerId: string): TaskMarker[] => {
  return markers.filter((m) => m.id !== markerId);
};

/**
 * 查找標記點
 */
export const findMarker = (markers: TaskMarker[], markerId: string): TaskMarker | undefined => {
  return markers.find((m) => m.id === markerId);
};
