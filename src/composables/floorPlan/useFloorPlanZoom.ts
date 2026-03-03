/**
 * 平面圖縮放和平移功能
 * 處理圖片縮放、平移和初始化
 */

import { computed, nextTick, ref, type Ref } from 'vue';

import { calculateInitialScale, type ImageDimensions } from '@/utils/floorPlan/floorPlanImage';
import {
  calculateWheelZoom,
  resetZoomState,
  type WheelZoomParams,
} from '@/utils/floorPlan/floorPlanZoom';

export interface UseFloorPlanZoomOptions {
  imageContainer: Ref<HTMLDivElement | undefined>;
  floorPlanImg: Ref<HTMLImageElement | undefined>;
}

export const useFloorPlanZoom = (options: UseFloorPlanZoomOptions) => {
  const { imageContainer, floorPlanImg } = options;

  const scale = ref(1);
  const translateX = ref(0);
  const translateY = ref(0);
  const initialScale = ref(1);
  const imageLoaded = ref(false);

  const imageStyle = computed(() => ({
    transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
    transformOrigin: 'top left',
    width: 'auto',
    height: 'auto',
    maxWidth: 'none',
    maxHeight: 'none',
    objectFit: 'contain',
    display: 'block',
  }));

  const centerImage = () => {
    if (!floorPlanImg.value || !imageContainer.value) return;
    const container = imageContainer.value;
    const img = floorPlanImg.value;
    const displayWidth = img.naturalWidth * scale.value;
    const displayHeight = img.naturalHeight * scale.value;
    translateX.value = (container.clientWidth - displayWidth) / 2;
    translateY.value = (container.clientHeight - displayHeight) / 2;
  };

  const handleImageLoad = () => {
    if (!floorPlanImg.value || !imageContainer.value) return;

    imageLoaded.value = false;

    const img = floorPlanImg.value;
    const container = imageContainer.value;

    const dimensions: ImageDimensions = {
      containerWidth: container.clientWidth,
      containerHeight: container.clientHeight,
      imageWidth: img.naturalWidth,
      imageHeight: img.naturalHeight,
    };

    const { initialScale: calculatedScale } = calculateInitialScale(dimensions);
    initialScale.value = calculatedScale;

    scale.value = calculatedScale;
    centerImage();

    nextTick(() => {
      imageLoaded.value = true;
    });
  };

  const resetZoom = () => {
    const zoomState = resetZoomState(initialScale.value);
    scale.value = zoomState.scale;
    centerImage();
  };

  const handleWheel = (event: WheelEvent) => {
    if (!imageContainer.value) return;

    const params: WheelZoomParams = {
      event,
      currentScale: scale.value,
      containerWidth: imageContainer.value.clientWidth,
      containerHeight: imageContainer.value.clientHeight,
      currentTranslateX: translateX.value,
      currentTranslateY: translateY.value,
    };

    const { newScale, newTranslateX, newTranslateY } = calculateWheelZoom(params);

    // 不允許縮小到適應螢幕以下（UI 上顯示的 100%）
    if (newScale < initialScale.value) {
      const zoomState = resetZoomState(initialScale.value);
      scale.value = zoomState.scale;
      // 重新置中圖片，保持行為與初始載入一致
      centerImage();
      return;
    }

    scale.value = newScale;
    translateX.value = newTranslateX;
    translateY.value = newTranslateY;
  };

  return {
    scale,
    translateX,
    translateY,
    initialScale,
    imageLoaded,
    imageStyle,
    handleImageLoad,
    resetZoom,
    handleWheel,
  };
};
