import type { PinLocation } from '@/types/pin';
import type { Ref } from 'vue';

export interface UsePinPositionCalculatorOptions {
  imageContainer: Ref<HTMLDivElement | undefined>;
  floorPlanImg: Ref<HTMLImageElement | undefined>;
  scale: Ref<number>;
  translateX: Ref<number>;
  translateY: Ref<number>;
  imageLoaded: Ref<boolean>;
}

export const usePinPositionCalculator = ({
  imageContainer,
  floorPlanImg,
  scale,
  translateX,
  translateY,
  imageLoaded,
}: UsePinPositionCalculatorOptions) => {
  const calculatePercentage = (
    clientX: number,
    clientY: number
  ): { xPercent: number; yPercent: number } | null => {
    if (!imageContainer.value || !floorPlanImg.value) return null;

    const imgRect = floorPlanImg.value.getBoundingClientRect();
    if (!imgRect.width || !imgRect.height) return null;

    const xPercent = ((clientX - imgRect.left) / imgRect.width) * 100;
    const yPercent = ((clientY - imgRect.top) / imgRect.height) * 100;

    if (xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100) {
      return { xPercent, yPercent };
    }

    return null;
  };

  const getPinPixelPosition = (pinLoc: PinLocation): { x: number; y: number } | null => {
    if (!imageContainer.value || !floorPlanImg.value || !pinLoc) return null;
    if (!imageLoaded.value) return null;

    // 額外讀取縮放和平移的值來建立響應式依賴，
    // 讓 fixedPins 在 zoom/pan 改變時會重新計算位置
    const currentScale = scale.value;
    const currentTranslateX = translateX.value;
    const currentTranslateY = translateY.value;
    void currentScale;
    void currentTranslateX;
    void currentTranslateY;
    const loaded = imageLoaded.value;
    void loaded;

    const containerRect = imageContainer.value.getBoundingClientRect();
    const imgRect = floorPlanImg.value.getBoundingClientRect();
    if (!imgRect.width || !imgRect.height) return null;

    const imgLeft = imgRect.left - containerRect.left;
    const imgTop = imgRect.top - containerRect.top;

    const x = imgLeft + (pinLoc.xPercent / 100) * imgRect.width;
    const y = imgTop + (pinLoc.yPercent / 100) * imgRect.height;

    return { x, y };
  };

  return {
    calculatePercentage,
    getPinPixelPosition,
  };
};
