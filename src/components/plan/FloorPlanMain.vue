<template>
  <div class="relative h-full w-full overflow-hidden bg-gray-50 dark:bg-gray-700">
    <!-- 工具列 -->
    <FloorPlanToolbar
      :scale="scale"
      :is-adding-marker="isAddingMarker"
      :is-confirming-reset="isResettingFloorPlan"
      :has-multiple-images="hasMultipleImages"
      :current-image-index="currentImageIndex"
      :total-images="totalImages"
      @add-image="$emit('addImage')"
      @replace-image="$emit('replaceImage')"
      @delete-image="$emit('deleteImage')"
      @confirm-delete="$emit('confirmDelete')"
      @cancel-delete="$emit('cancelDelete')"
      @reset-zoom="$emit('resetZoom')"
      @prev-image="$emit('prevImage')"
      @next-image="$emit('nextImage')"
      @toggle-sidebar="$emit('toggleSidebar')"
    />

    <!-- 平面圖容器 -->
    <FloorPlanCanvas
      ref="canvasRef"
      :floor-plan-image="floorPlanImage"
      :image-style="imageStyle"
      :task-markers="taskMarkers"
      :selected-marker-id="selectedMarkerId"
      :highlighted-task-id="highlightedTaskId"
      :is-adding-marker="isAddingMarker"
      :is-adding-pin="isAddingPin"
      :is-dragging-pin="isDraggingPin"
      :pending-existing-pin-task-id="pendingExistingPinTaskId"
      :pinning-task-title="pinningTaskTitle"
      :pin-position="pinPosition"
      :is-dragging-existing-pin="isDraggingExistingPin"
      :dragging-existing-task-id="draggingExistingTaskId"
      :dragging-existing-pin-index="draggingExistingPinIndex"
      :fixed-pins="fixedPins"
      :get-marker-style="getMarkerStyle"
      :translate-x="translateX"
      :translate-y="translateY"
      :pan-mouse-down="panMouseDown"
      :pan-mouse-move="panMouseMove"
      :pan-mouse-up="panMouseUp"
      :start-pin-drag="startPinDrag"
      :update-pin-position="updatePinPosition"
      :end-pin-drag="endPinDrag"
      :update-existing-pin-position="updateExistingPinPosition"
      :end-existing-pin-drag="endExistingPinDrag"
      @cancel-pinning="$emit('cancel-pinning')"
      @wheel="$emit('wheel', $event)"
      @container-click="$emit('containerClick', $event)"
      @image-load="$emit('imageLoad', $event)"
      @image-click="$emit('imageClick', $event)"
      @select-marker="$emit('selectMarker', $event)"
      @edit-marker="$emit('editMarker', $event)"
      @delete-marker="$emit('deleteMarker', $event)"
      @pin-click="$emit('pinClick', $event)"
      @pin-mousedown="$emit('pinMousedown', $event)"
      @remove-single-pin="$emit('removeSinglePin', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import FloorPlanCanvas from './FloorPlanCanvas.vue';
import FloorPlanToolbar from './FloorPlanToolbar.vue';

import type { FixedPin } from '@/types/pin';
import type { TaskMarker } from '@/utils/floorPlan/floorPlanMarker';

defineProps<{
  floorPlanImage: string;
  scale: number;
  isAddingMarker: boolean;
  isResettingFloorPlan: boolean;
  hasMultipleImages: boolean;
  currentImageIndex: number;
  totalImages: number;
  imageStyle: Record<string, string | number>;
  taskMarkers: TaskMarker[];
  selectedMarkerId: string | null;
  highlightedTaskId: string | null;
  isAddingPin: boolean;
  isDraggingPin: boolean;
  pendingExistingPinTaskId: string | null;
  pinningTaskTitle: string;
  pinPosition: { x: number; y: number } | null;
  isDraggingExistingPin: boolean;
  draggingExistingTaskId: string | null;
  draggingExistingPinIndex: number | null;
  fixedPins: FixedPin[];
  getMarkerStyle: (marker: TaskMarker) => Record<string, string>;
  translateX: number;
  translateY: number;
  panMouseDown: (event: MouseEvent, isAddingMarker: boolean) => void;
  panMouseMove: (event: MouseEvent) => void;
  panMouseUp: () => void;
  startPinDrag: (event: MouseEvent) => void;
  updatePinPosition: (event: MouseEvent) => void;
  endPinDrag: (event: MouseEvent) => Promise<void>;
  updateExistingPinPosition: (event: MouseEvent) => void;
  endExistingPinDrag: (event: MouseEvent) => Promise<boolean>;
}>();

defineEmits<{
  (e: 'addImage'): void;
  (e: 'replaceImage'): void;
  (e: 'deleteImage'): void;
  (e: 'confirmDelete'): void;
  (e: 'cancelDelete'): void;
  (e: 'resetZoom'): void;
  (e: 'prevImage'): void;
  (e: 'nextImage'): void;
  (e: 'toggleSidebar'): void;
  (e: 'wheel', event: WheelEvent): void;
  (e: 'containerClick', event: MouseEvent): void;
  (e: 'imageLoad', event: Event): void;
  (e: 'imageClick', event: MouseEvent): void;
  (e: 'selectMarker', id: string): void;
  (e: 'editMarker', id: string): void;
  (e: 'deleteMarker', id: string): void;
  (e: 'pinClick', taskId: string): void;
  (e: 'pinMousedown', payload: { taskId: string; index: number; event: MouseEvent }): void;
  (e: 'removeSinglePin', payload: { taskId: string; index: number }): void;
  (e: 'cancel-pinning'): void;
}>();

const canvasRef = ref<InstanceType<typeof FloorPlanCanvas> | null>(null);

defineExpose({
  get imageContainer() {
    return canvasRef.value?.imageContainer;
  },
  get floorPlanImg() {
    return canvasRef.value?.floorPlanImg;
  },
});
</script>
