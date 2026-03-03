/**
 * 平面圖標記點功能
 * 處理標記點的建立、編輯、刪除和選擇
 */

import { ref, type Ref } from 'vue';

import {
  calculateMarkerStyle,
  type ClickToMarkerParams,
  convertClickToMarkerCoordinates,
  createNewMarker,
  deleteMarker,
  findMarker,
  type MarkerPositionParams,
  type TaskMarker,
  updateMarker,
} from '@/utils/floorPlan/floorPlanMarker';

export interface UseFloorPlanMarkerOptions {
  imageContainer: Ref<HTMLDivElement | undefined>;
  floorPlanImg: Ref<HTMLImageElement | undefined>;
  scale: Ref<number>;
  translateX: Ref<number>;
  translateY: Ref<number>;
}

export const useFloorPlanMarker = (options: UseFloorPlanMarkerOptions) => {
  const { imageContainer, floorPlanImg, scale, translateX, translateY } = options;

  const taskMarkers = ref<TaskMarker[]>([]);
  const isAddingMarker = ref(false);
  const selectedMarkerId = ref<string | null>(null);

  const getMarkerStyle = (marker: TaskMarker) => {
    if (!floorPlanImg.value || !imageContainer.value) return {};

    const img = floorPlanImg.value;
    const container = imageContainer.value;

    const params: MarkerPositionParams = {
      markerX: marker.x,
      markerY: marker.y,
      imageWidth: img.naturalWidth,
      imageHeight: img.naturalHeight,
      scale: scale.value,
      translateX: translateX.value,
      translateY: translateY.value,
      containerWidth: container.clientWidth,
      containerHeight: container.clientHeight,
    };

    return calculateMarkerStyle(params);
  };

  const handleImageClick = (event: MouseEvent) => {
    if (!isAddingMarker.value || !floorPlanImg.value || !imageContainer.value) return;

    event.stopPropagation();

    const img = floorPlanImg.value;
    const container = imageContainer.value;
    const rect = container.getBoundingClientRect();

    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const params: ClickToMarkerParams = {
      clickX,
      clickY,
      imageWidth: img.naturalWidth,
      imageHeight: img.naturalHeight,
      scale: scale.value,
      translateX: translateX.value,
      translateY: translateY.value,
      containerWidth: container.clientWidth,
      containerHeight: container.clientHeight,
    };

    const { relativeX, relativeY, isValid } = convertClickToMarkerCoordinates(params);

    if (isValid) {
      createMarker(relativeX, relativeY);
    }
  };

  const handleContainerClick = (event: MouseEvent) => {
    if (isAddingMarker.value) {
      event.stopPropagation();
    } else {
      selectedMarkerId.value = null;
    }
  };

  const createMarker = (x: number, y: number) => {
    // eslint-disable-next-line no-alert
    const title = prompt('請輸入任務標題：');
    if (!title) return;

    // eslint-disable-next-line no-alert
    const description = prompt('請輸入任務描述（可選）：') || undefined;

    const newMarker = createNewMarker(x, y, title, description);
    taskMarkers.value.push(newMarker);
    isAddingMarker.value = false;
    selectedMarkerId.value = newMarker.id;
  };

  const selectMarker = (markerId: string) => {
    selectedMarkerId.value = selectedMarkerId.value === markerId ? null : markerId;
  };

  const editMarker = (markerId: string) => {
    const marker = findMarker(taskMarkers.value, markerId);
    if (!marker) return;

    // eslint-disable-next-line no-alert
    const newTitle = prompt('請輸入新的任務標題：', marker.title);
    if (newTitle === null) return;

    // eslint-disable-next-line no-alert
    const newDescription = prompt('請輸入新的任務描述：', marker.description || '');

    const updatedMarker = updateMarker(marker, {
      title: newTitle,
      description: newDescription || undefined,
    });

    const index = taskMarkers.value.findIndex((m) => m.id === markerId);
    if (index > -1) {
      taskMarkers.value[index] = updatedMarker;
    }
  };

  const deleteMarkerById = (markerId: string) => {
    // eslint-disable-next-line no-alert
    if (confirm('確定要刪除這個任務標記嗎？')) {
      taskMarkers.value = deleteMarker(taskMarkers.value, markerId);
      selectedMarkerId.value = null;
    }
  };

  return {
    taskMarkers,
    isAddingMarker,
    selectedMarkerId,
    getMarkerStyle,
    handleImageClick,
    handleContainerClick,
    createMarker,
    selectMarker,
    editMarker,
    deleteMarkerById,
  };
};
