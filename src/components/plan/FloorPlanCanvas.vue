<template>
  <div
    ref="imageContainer"
    class="relative h-full w-full overflow-hidden bg-primary-light dark:bg-primaryDark-panel"
    :class="
      isHoveringPin
        ? 'cursor-pointer'
        : isAddingPin
          ? 'cursor-grab active:cursor-grabbing'
          : isAddingMarker
            ? 'cursor-crosshair'
            : 'cursor-move'
    "
    @wheel.prevent="$emit('wheel', $event)"
    @mousedown="handleCanvasMouseDown"
    @mousemove="handleCanvasMouseMove"
    @mouseup="handleCanvasMouseUp"
    @mouseleave="handleCanvasMouseUp"
    @touchstart.passive="false"
    @touchstart.prevent="handleCanvasTouchStart"
    @touchmove.passive="false"
    @touchmove.prevent="handleCanvasTouchMove"
    @touchend.passive="false"
    @touchend.prevent="handleCanvasTouchEnd"
    @touchcancel.passive="false"
    @touchcancel.prevent="handleCanvasTouchEnd"
    @click="$emit('container-click', $event)"
  >
    <img
      ref="floorPlanImg"
      :src="floorPlanImage"
      :style="imageStyle"
      class="select-none"
      style="max-width: none; max-height: none; object-fit: contain"
      alt="平面圖"
      draggable="false"
      @load="$emit('image-load', $event)"
      @click="$emit('image-click', $event)"
    />

    <!-- 任務標記點 -->
    <FloorPlanMarkerPoint
      v-for="marker in taskMarkers"
      :key="marker.id"
      :marker="marker"
      :marker-style="getMarkerStyle(marker)"
      :is-selected="selectedMarkerId === marker.id"
      @select="$emit('select-marker', marker.id)"
      @edit="$emit('edit-marker', marker.id)"
      @delete="$emit('delete-marker', marker.id)"
    />

    <!-- 已保存的釘選 -->
    <div
      v-for="p in fixedPins"
      v-show="
        !(
          isDraggingExistingPin &&
          draggingExistingTaskId === p.taskId &&
          p.index === draggingExistingPinIndex
        )
      "
      :key="`${p.taskId}-${p.index}`"
      class="absolute z-50"
      :class="getPinContainerClass(p.taskId)"
      :title="p.title"
      :style="{
        left: `${p.x}px`,
        top: `${p.y}px`,
        transform: isDraggingExistingPin
          ? 'translate(-50%, -100%) scale(1.15)'
          : 'translate(-50%, -100%)',
        willChange: 'transform',
      }"
      @mouseenter="handlePinMouseEnter"
      @mouseleave="handlePinMouseLeave"
      @mousedown.stop="$emit('pin-mousedown', { taskId: p.taskId, index: p.index, event: $event })"
    >
      <TaskPin
        :title="p.title"
        @click="handlePinClick(p.taskId)"
        @pin-mousedown="$emit('pin-mousedown', { taskId: p.taskId, index: p.index, event: $event })"
        @remove="$emit('remove-single-pin', { taskId: p.taskId, index: p.index })"
      />
    </div>

    <!-- 既有釘選拖拽中的浮動預覽 -->
    <div
      v-if="isDraggingExistingPin && pinPosition"
      class="pointer-events-none absolute z-50 flex items-center justify-center"
      :style="{
        left: `${pinPosition.x}px`,
        top: `${pinPosition.y}px`,
        transform: 'translate(-50%, -100%)',
      }"
    >
      <TaskPin :title="fixedPins.find((fp) => fp.taskId === draggingExistingTaskId)?.title || ''" />
    </div>

    <!-- 釘選大頭釘 - 浮動動效 -->
    <div
      v-if="isAddingPin && pinPosition"
      class="pin-float pointer-events-none absolute z-50"
      :style="{
        left: `${pinPosition.x}px`,
        top: `${pinPosition.y}px`,
      }"
    >
      <PinningFloat :title="pinningTaskTitle" @cancel.stop="emit('cancel-pinning')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import FloorPlanMarkerPoint from './FloorPlanMarkerPoint.vue';
import PinningFloat from './PinningFloat.vue';

import type { TaskMarker } from '@/utils/floorPlan/floorPlanMarker';

import TaskPin from '@/components/core/TaskPin.vue';

const props = defineProps<{
  floorPlanImage: string;
  imageStyle: Record<string, string | number>;
  taskMarkers: TaskMarker[];
  selectedMarkerId: string | null;
  highlightedTaskId: string | null;
  isAddingMarker: boolean;
  isAddingPin: boolean;
  isDraggingPin: boolean;
  pendingExistingPinTaskId: string | null;
  pinningTaskTitle: string;
  pinPosition: { x: number; y: number } | null;
  isDraggingExistingPin: boolean;
  draggingExistingTaskId: string | null;
  draggingExistingPinIndex: number | null;
  fixedPins: Array<{ x: number; y: number; taskId: string; title: string; index: number }>;
  getMarkerStyle: (marker: TaskMarker) => Record<string, string>;
  translateX: number;
  translateY: number;
  startPinDrag: (event: MouseEvent) => void | Promise<void>;
  updatePinPosition: (event: MouseEvent) => void;
  endPinDrag: (event: MouseEvent) => void | Promise<void>;
  updateExistingPinPosition: (event: MouseEvent) => void;
  endExistingPinDrag: (event: MouseEvent) => Promise<boolean>;
  panMouseDown: (event: MouseEvent, isAddingMarker: boolean) => void;
  panMouseMove: (event: MouseEvent) => void;
  panMouseUp: () => void;
}>();

const emit = defineEmits<{
  wheel: [event: WheelEvent];
  'container-click': [event: MouseEvent];
  'image-load': [event: Event];
  'image-click': [event: MouseEvent];
  'select-marker': [markerId: string];
  'edit-marker': [markerId: string];
  'delete-marker': [markerId: string];
  'pin-hover': [isHovering: boolean];
  'pin-click': [taskId: string];
  'pin-mousedown': [payload: { taskId: string; index: number; event: MouseEvent }];
  'remove-single-pin': [payload: { taskId: string; index: number }];
  'cancel-pinning': [];
}>();

const imageContainer = ref<HTMLDivElement>();
const floorPlanImg = ref<HTMLImageElement>();
const isHoveringPin = ref(false);

const basePinContainerClass = computed(() => ({
  'duration-0': props.isDraggingExistingPin,
  'duration-150': !props.isDraggingExistingPin,
}));

const getPinContainerClass = (taskId: string) => ({
  ...basePinContainerClass.value,
  'ring-2 ring-blue-400 ring-offset-2 drop-shadow-lg': props.highlightedTaskId === taskId,
});

const getPrimaryTouch = (event: TouchEvent): Touch | null => {
  return event.touches[0] ?? event.changedTouches[0] ?? null;
};

const touchToMouseEvent = (touch: Touch, type: string): MouseEvent => {
  return new MouseEvent(type, {
    clientX: touch.clientX,
    clientY: touch.clientY,
    screenX: touch.screenX,
    screenY: touch.screenY,
    bubbles: true,
    cancelable: true,
  });
};

const handleCanvasMouseDown = (event: MouseEvent) => {
  if (props.isAddingPin) {
    props.startPinDrag(event);
    return;
  }
  if (
    props.pendingExistingPinTaskId !== null ||
    props.isDraggingExistingPin ||
    props.draggingExistingTaskId !== null
  ) {
    return;
  }

  props.panMouseDown(event, props.isAddingMarker);
};

const handleCanvasMouseMove = (event: MouseEvent) => {
  props.updateExistingPinPosition(event);
  if (props.isDraggingExistingPin) return;

  if (props.isDraggingPin) {
    props.updatePinPosition(event);
    return;
  }

  props.panMouseMove(event);
};

const handleCanvasMouseUp = async (event: MouseEvent) => {
  const handled = await props.endExistingPinDrag(event);
  if (handled) return;

  if (props.isDraggingPin) {
    await props.endPinDrag(event);
    return;
  }

  props.panMouseUp();
};

const handleCanvasTouchStart = (event: TouchEvent) => {
  const touch = getPrimaryTouch(event);
  if (!touch) return;
  handleCanvasMouseDown(touchToMouseEvent(touch, 'touchstart'));
};

const handleCanvasTouchMove = (event: TouchEvent) => {
  const touch = getPrimaryTouch(event);
  if (!touch) return;
  handleCanvasMouseMove(touchToMouseEvent(touch, 'touchmove'));
};

const handleCanvasTouchEnd = (event: TouchEvent) => {
  const touch = getPrimaryTouch(event);
  if (!touch) return;
  handleCanvasMouseUp(touchToMouseEvent(touch, 'touchend'));
};

const handlePinMouseEnter = () => {
  isHoveringPin.value = true;
  emit('pin-hover', true);
};

const handlePinMouseLeave = () => {
  isHoveringPin.value = false;
  emit('pin-hover', false);
};

const handlePinClick = (taskId: string) => {
  emit('pin-click', taskId);
};

defineExpose({ imageContainer, floorPlanImg });
</script>

<style scoped></style>
