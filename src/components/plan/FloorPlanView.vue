<template>
  <div class="flex h-full w-full flex-col lg:flex-row">
    <!-- 主要內容區域 -->
    <div class="min-h-0 min-w-0 flex-1 md:flex-[2] lg:flex-1">
      <div v-if="!currentFloorPlanImage" class="flex h-full items-center justify-center">
        <!-- 上傳區域 -->
        <UploadArea
          @file-select="$emit('fileSelect', $event)"
          @file-drop="$emit('fileDrop', $event)"
        />
      </div>

      <!-- 平面圖顯示區域 -->
      <FloorPlanMain
        v-else
        ref="floorPlanMainRef"
        :tasks="tasks"
        :construction-container="constructionContainer"
        :is-mobile-sidebar-open="isMobileSidebarOpen"
        :all-floor-plan-urls="allFloorPlanUrls"
        :scale="scale"
        :translate-x="translateX"
        :translate-y="translateY"
        :image-style="imageStyle"
        :task-markers="taskMarkers"
        :is-adding-marker="isAddingMarker"
        :selected-marker-id="selectedMarkerId"
        :get-marker-style="getMarkerStyle"
        :is-adding-pin="isAddingPin"
        :is-dragging-pin="isDraggingPin"
        :is-dragging-existing-pin="isDraggingExistingPin"
        :pinning-task-id="pinningTaskId"
        :pending-existing-pin-task-id="pendingExistingPinTaskId"
        :dragging-existing-task-id="draggingExistingTaskId"
        :dragging-existing-pin-index="draggingExistingPinIndex"
        :pin-position="pinPosition"
        :fixed-pins="fixedPins"
        :is-resetting-floor-plan="isResettingFloorPlan"
        :highlighted-task-id="highlightedTaskId"
        :pinning-task-title="pinningTaskTitle"
        :pan-mouse-down="panMouseDown"
        :pan-mouse-move="panMouseMove"
        :pan-mouse-up="panMouseUp"
        :start-pin-drag="startPinDrag"
        :update-pin-position="updatePinPosition"
        :end-pin-drag="endPinDrag"
        :update-existing-pin-position="updateExistingPinPosition"
        :end-existing-pin-drag="endExistingPinDrag"
        :floor-plan-image="currentFloorPlanImage as string"
        :has-multiple-images="allFloorPlanUrls.length > 1"
        :current-image-index="currentImageIndex"
        :total-images="allFloorPlanUrls.length"
        @cancel-pinning="pinningTaskId && $emit('cancelMarkerForTask', pinningTaskId)"
        @add-image="$emit('addImage')"
        @replace-image="$emit('replaceImage')"
        @delete-image="$emit('deleteImage')"
        @confirm-delete="$emit('confirmDelete')"
        @cancel-delete="$emit('cancelDelete')"
        @reset-zoom="$emit('resetZoom')"
        @prev-image="$emit('prevImage')"
        @next-image="$emit('nextImage')"
        @toggle-sidebar="$emit('toggleSidebar')"
        @wheel="$emit('wheel', $event)"
        @container-click="$emit('containerClick', $event)"
        @image-load="$emit('imageLoad', $event)"
        @image-click="$emit('imageClick', $event)"
        @select-marker="$emit('selectMarker', $event)"
        @edit-marker="$emit('editMarker', $event)"
        @delete-marker="$emit('deleteMarker', $event)"
        @pin-click="$emit('pinClick', $event)"
        @pin-mousedown="$emit('pinMousedown', $event)"
        @remove-single-pin="$emit('remove-single-pin', $event)"
      />
    </div>

    <!-- 任務列表：平板於下方，桌機於右側 -->
    <div
      class="hidden w-full shrink-0 overflow-y-auto border-t border-gray-200 md:flex md:min-h-0 md:flex-[1] lg:block lg:h-full lg:w-80 lg:flex-none lg:border-l lg:border-t-0"
    >
      <TaskSidebar
        ref="desktopSidebarRef"
        class="h-full"
        :tablet-horizontal="true"
        :tasks="tasks"
        :task-markers="taskMarkers"
        :selected-marker-id="selectedMarkerId"
        :highlighted-task-id="highlightedTaskId"
        :is-pinning="isAddingPin"
        :pinning-task-id="pinningTaskId"
        :construction-container="constructionContainer"
        @select-task="$emit('selectTask', $event)"
        @link-task-to-marker="$emit('linkTaskToMarker', $event)"
        @create-marker-for-task="$emit('createMarkerForTask', $event)"
        @remove-task-pin="$emit('removeTaskPin', $event)"
        @cancel-marker-for-task="$emit('cancelMarkerForTask', $event)"
        @add-pin-to-task="$emit('addPinToTask', $event)"
      />
    </div>

    <!-- 手機版側邊欄 SlidePanel -->
    <SlidePanel
      :model-value="isMobileSidebarOpen"
      side="left"
      :top-offset-rem="0"
      :width-percent="85"
      :max-width-px="400"
      body-class="p-0"
      @update:model-value="$emit('update:isMobileSidebarOpen', $event)"
    >
      <TaskSidebar
        ref="mobileSidebarRef"
        :tasks="tasks"
        :task-markers="taskMarkers"
        :selected-marker-id="selectedMarkerId"
        :highlighted-task-id="highlightedTaskId"
        :is-pinning="isAddingPin"
        :pinning-task-id="pinningTaskId"
        :construction-container="constructionContainer"
        @select-task="$emit('selectTask', $event)"
        @link-task-to-marker="$emit('linkTaskToMarker', $event)"
        @create-marker-for-task="$emit('createMarkerForTask', $event)"
        @remove-task-pin="$emit('removeTaskPin', $event)"
        @cancel-marker-for-task="$emit('cancelMarkerForTask', $event)"
        @add-pin-to-task="$emit('addPinToTask', $event)"
      />
    </SlidePanel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import FloorPlanMain from './FloorPlanMain.vue';
import TaskSidebar from './TaskSidebar.vue';

import type { FixedPin } from '@/types/pin';
import type { FloorPlanItem, TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';
import type { TaskMarker } from '@/utils/floorPlan/floorPlanMarker';

import UploadArea from '@/components/core/input/UploadArea.vue';
import SlidePanel from '@/components/ui/SlidePanel.vue';

defineProps<{
  // General
  tasks: TaskResponse[];
  constructionContainer: ConstructionSelection[] | null;
  isMobileSidebarOpen: boolean;

  // Image
  currentFloorPlanImage: string | null;
  allFloorPlanUrls: FloorPlanItem[];
  currentImageIndex: number;

  // Zoom & Pan
  scale: number;
  translateX: number;
  translateY: number;
  imageStyle: Record<string, string | number>;

  // Markers
  taskMarkers: TaskMarker[];
  isAddingMarker: boolean;
  selectedMarkerId: string | null;
  getMarkerStyle: (marker: TaskMarker) => Record<string, string>;

  // Pinning
  isAddingPin: boolean;
  isDraggingPin: boolean;
  isDraggingExistingPin: boolean;
  pinningTaskId: string | null;
  pinningTaskTitle: string;
  pendingExistingPinTaskId: string | null;
  draggingExistingTaskId: string | null;
  draggingExistingPinIndex: number | null;
  pinPosition: { x: number; y: number } | null;
  fixedPins: FixedPin[];

  // Toolbar state
  isResettingFloorPlan: boolean;

  // Highlight
  highlightedTaskId: string | null;

  // Functions
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
  (e: 'fileSelect', payload: unknown): void;
  (e: 'fileDrop', payload: unknown): void;
  (e: 'update:isMobileSidebarOpen', value: boolean): void;
  (e: 'selectTask', taskId: string): void;
  (e: 'linkTaskToMarker', taskId: string): void;
  (e: 'createMarkerForTask', taskId: string): void;
  (e: 'removeTaskPin', taskId: string): void;
  (e: 'cancelMarkerForTask', taskId: string): void;
  (e: 'addPinToTask', taskId: string): void;

  // FloorPlanMain emits
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
  (e: 'remove-single-pin', payload: { taskId: string; index: number }): void;
}>();

const floorPlanMainRef = ref<InstanceType<typeof FloorPlanMain> | null>(null);
const desktopSidebarRef = ref<InstanceType<typeof TaskSidebar> | null>(null);
const mobileSidebarRef = ref<InstanceType<typeof TaskSidebar> | null>(null);

defineExpose({
  floorPlanMainRef,
  desktopSidebarRef,
  mobileSidebarRef,
});
</script>
