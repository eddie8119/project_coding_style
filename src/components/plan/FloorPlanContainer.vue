<template>
  <FloorPlanView
    ref="floorPlanViewRef"
    :tasks="tasksRef"
    :construction-container="props.constructionContainer"
    :is-mobile-sidebar-open="isMobileSidebarOpen"
    :current-floor-plan-image="currentFloorPlanImage"
    :all-floor-plan-urls="allFloorPlanUrls"
    :current-image-index="currentImageIndex"
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
    :pinning-task-id="selectedTaskIdForPin"
    :pinning-task-title="pinningTaskTitle"
    :pending-existing-pin-task-id="pendingExistingPinTaskId"
    :dragging-existing-task-id="draggingExistingTaskId"
    :dragging-existing-pin-index="draggingExistingPinIndex"
    :pin-position="pinPosition"
    :fixed-pins="filteredFixedPins"
    :is-resetting-floor-plan="isResettingFloorPlan"
    :highlighted-task-id="highlightedTaskId"
    :pan-mouse-down="handlePanMouseDown"
    :pan-mouse-move="handlePanMouseMove"
    :pan-mouse-up="handlePanMouseUp"
    :start-pin-drag="startDraggingPin"
    :update-pin-position="updatePinPosition"
    :end-pin-drag="handleEndPinDrag"
    :update-existing-pin-position="updateExistingPinPosition"
    :end-existing-pin-drag="handleEndExistingPinDrag"
    @file-select="handleFileSelect"
    @file-drop="handleFileDrop"
    @update:is-mobile-sidebar-open="isMobileSidebarOpen = $event"
    @select-task="handleSidebarSelectTask"
    @link-task-to-marker="handleLinkTaskToMarker"
    @create-marker-for-task="selectTaskForPin"
    @remove-task-pin="handleRemoveTaskPin"
    @cancel-marker-for-task="handleCancelMarkerForTask"
    @add-pin-to-task="selectTaskForPin"
    @remove-single-pin="handleRemoveSinglePin"
    @add-image="triggerAddImage"
    @replace-image="triggerReplaceImage"
    @delete-image="resetFloorPlan"
    @confirm-delete="deleteCurrentImage"
    @cancel-delete="cancelResetFloorPlan"
    @reset-zoom="resetZoom"
    @prev-image="prevImage"
    @next-image="nextImage"
    @toggle-sidebar="toggleMobileSidebar"
    @wheel="handleWheel"
    @container-click="handleContainerClick"
    @image-load="handleImageLoad"
    @image-click="handleImageClickWithTask"
    @select-marker="selectMarker"
    @edit-marker="editMarker"
    @delete-marker="deleteMarkerById"
    @pin-click="handlePinClickFromCanvas"
    @pin-mousedown="handlePinMouseDownFromCanvas"
  />

  <!-- 隱藏的文件輸入框，用於工具欄操作 -->
  <input
    ref="addFileInput"
    type="file"
    class="hidden"
    accept="image/*,application/pdf"
    @change="handleFileSelect"
  />
  <input
    ref="replaceFileInput"
    type="file"
    class="hidden"
    accept="image/*,application/pdf"
    @change="handleReplaceFileSelect"
  />
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

import FloorPlanView from './FloorPlanView.vue';

import type { FloorPlanItem, TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

import { useFloorPlanDrag } from '@/composables/floorPlan/useFloorPlanDrag';
import { useFloorPlanImage } from '@/composables/floorPlan/useFloorPlanImage';
import { useFloorPlanMarker } from '@/composables/floorPlan/useFloorPlanMarker';
import { useFloorPlanMarkerUtils } from '@/composables/floorPlan/useFloorPlanMarkerUtils';
import { useFloorPlanPinning } from '@/composables/floorPlan/useFloorPlanPinning';
import { useFloorPlanTaskMarker } from '@/composables/floorPlan/useFloorPlanTaskMarker';
import { useFloorPlanUploadHandler } from '@/composables/floorPlan/useFloorPlanUploadHandler';
import { useFloorPlanZoom } from '@/composables/floorPlan/useFloorPlanZoom';
import { useTaskHighlight } from '@/composables/floorPlan/useTaskHighlight';
import { useTasks } from '@/composables/query/useTasks';
import { TaskPinCondition } from '@/types/task';

const props = withDefaults(
  defineProps<{
    floorPlanUrls?: FloorPlanItem[] | null;
    projectId: string;
    tasks: TaskResponse[] | undefined;
    updateProject: (data: Partial<CreateProjectSchema>) => Promise<unknown>;
    constructionContainer: ConstructionSelection[] | null;
  }>(),
  {
    floorPlanUrls: () => [],
    constructionContainer: () => [],
  }
);

// 模板引用
const floorPlanViewRef = ref<InstanceType<typeof FloorPlanView> | null>(null);
const imageContainer = computed(() => floorPlanViewRef.value?.floorPlanMainRef?.imageContainer);
const floorPlanImg = computed(() => floorPlanViewRef.value?.floorPlanMainRef?.floorPlanImg);
const desktopSidebarRef = computed(() => floorPlanViewRef.value?.desktopSidebarRef);
const mobileSidebarRef = computed(() => floorPlanViewRef.value?.mobileSidebarRef);
const addFileInput = ref<HTMLInputElement>();
const replaceFileInput = ref<HTMLInputElement>();

const isMobileSidebarOpen = ref(false);

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

const triggerAddImage = () => {
  addFileInput.value?.click();
};

const triggerReplaceImage = () => {
  replaceFileInput.value?.click();
};

// 任務管理
const tasksRef = ref<TaskResponse[]>(props.tasks ?? []);
const { updateTask } = useTasks(props.projectId);

const {
  highlightedTaskId,
  highlightTemporarily,
  dispose: disposeTaskHighlight,
} = useTaskHighlight({ defaultDuration: 1200 });

const pinningTaskTitle = computed(() => {
  if (!selectedTaskIdForPin.value) return '';
  return tasksRef.value.find((task) => task.id === selectedTaskIdForPin.value)?.title ?? '';
});

watch(
  () => props.tasks,
  (newTasks) => {
    tasksRef.value = newTasks ?? [];
  },
  { deep: true }
);

// 縮放和平移
const {
  scale,
  translateX,
  translateY,
  imageLoaded,
  imageStyle,
  resetZoom,
  handleImageLoad,
  handleWheel,
} = useFloorPlanZoom({
  imageContainer,
  floorPlanImg,
});

// 平移拖拽
const {
  handleMouseDown: handlePanMouseDown,
  handleMouseMove: handlePanMouseMove,
  handleMouseUp: handlePanMouseUp,
} = useFloorPlanDrag({
  translateX,
  translateY,
});

// 標記點
const {
  taskMarkers,
  isAddingMarker,
  selectedMarkerId,
  getMarkerStyle,
  handleContainerClick,
  createMarker,
  selectMarker,
  editMarker,
  deleteMarkerById,
} = useFloorPlanMarker({
  imageContainer,
  floorPlanImg,
  scale,
  translateX,
  translateY,
});

// 圖片管理 composable
const {
  currentImageIndex,
  isResettingFloorPlan,
  allFloorPlanUrls,
  currentFloorPlanImage,
  currentFloorPlanKey,
  prevImage,
  nextImage,
  addUploadedImage,
  resetFloorPlan,
  deleteCurrentImage,
  replaceCurrentImage,
  cancelResetFloorPlan,
} = useFloorPlanImage({
  floorPlanUrls: computed(() => props.floorPlanUrls ?? []),
  updateProject: props.updateProject,
  onResetComplete: () => {
    resetZoom();
    taskMarkers.value = [];
  },
});

// 文件上傳處理 composable
const { handleFileSelect, handleFileDrop } = useFloorPlanUploadHandler({
  onImageAdded: addUploadedImage,
});

const { handleFileSelect: handleReplaceFileSelect } = useFloorPlanUploadHandler({
  onImageAdded: replaceCurrentImage,
});

// 釘選功能 composable
const {
  isAddingPin,
  selectedTaskIdForPin,
  pinPosition,
  isDraggingPin,
  isDraggingExistingPin,
  pendingExistingPinTaskId,
  draggingExistingTaskId,
  draggingExistingPinIndex,
  startDraggingExistingPin,
  updateExistingPinPosition,
  endDraggingExistingPin,
  selectTaskForPin,
  cancelPin,
  startDraggingPin,
  updatePinPosition,
  endDraggingPin,
  getPinPixelPosition,
  pinsOnCurrentImage,
} = useFloorPlanPinning({
  tasks: tasksRef,
  currentFloorPlanKey,
  scale,
  translateX,
  translateY,
  imageContainer,
  floorPlanImg,
  imageLoaded,
  updateTask,
});

const handleEndPinDrag = async (event: MouseEvent) => {
  await endDraggingPin(event);
};

const handleRemoveSinglePin = async (payload: { taskId: string; index: number }) => {
  const { taskId, index } = payload;
  const task = tasksRef.value.find((t) => t.id === taskId);

  if (!task || !task.pinLocation) return;

  const updatedPins = task.pinLocation.filter((_, i) => i !== index);
  const newPinLocation = updatedPins.length > 0 ? updatedPins : null;

  try {
    const result = await updateTask(taskId, { pinLocation: newPinLocation });
    if (result?.success) {
      task.pinLocation = newPinLocation;
    }
    ElMessage.success('Pin removed successfully');
  } catch (error) {
    ElMessage.error('Failed to remove pin');
  }
};

const handleEndExistingPinDrag = async (event: MouseEvent): Promise<boolean> => {
  // The pin index is now managed within the useFloorPlanPinning composable
  return endDraggingExistingPin(event);
};

// 標記點相關工具：將 pinLocation 轉換為畫布固定座標，並提供移除釘選的核心邏輯
const { fixedPins: allFixedPins, handleRemoveTaskPin } = useFloorPlanMarkerUtils({
  pinsOnCurrentImage,
  getPinPixelPosition,
  updateTask,
  tasksRef,
});

const filteredFixedPins = computed(() => {
  const sidebar = desktopSidebarRef.value || mobileSidebarRef.value;

  // 如果側邊欄不存在，或當前分頁是「全部」或「未釘選」，則顯示所有圖釘
  if (!sidebar || sidebar.activeTab === TaskPinCondition.WITHOUT_PIN) {
    return allFixedPins.value;
  }

  // 僅在「已釘選」分頁下，根據 filteredTasks 過濾圖釘
  const filteredTasks = sidebar.filteredTasks;
  if (!filteredTasks) {
    return []; // 如果沒有篩選後的任務，則不顯示任何圖釘
  }

  const filteredTaskIds = new Set(filteredTasks.map((task) => task.id));
  return allFixedPins.value.filter((pin) => filteredTaskIds.has(pin.taskId));
});

const handlePinClickFromCanvas = async (taskId: string) => {
  handleTaskSelect(taskId);
  highlightTemporarily(taskId);

  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    if (!isMobileSidebarOpen.value) {
      isMobileSidebarOpen.value = true;
      await nextTick();
    }
    if (mobileSidebarRef.value) {
      mobileSidebarRef.value.setActiveTab(TaskPinCondition.WITH_PIN);
      mobileSidebarRef.value.scrollToTask(taskId);
    }
  } else {
    if (desktopSidebarRef.value) {
      desktopSidebarRef.value.setActiveTab(TaskPinCondition.WITH_PIN);
      desktopSidebarRef.value.scrollToTask(taskId);
    }
  }
};

const handleSidebarSelectTask = (taskId: string) => {
  highlightTemporarily(taskId);
  handleTaskSelect(taskId);
};

const handlePinMouseDownFromCanvas = (payload: {
  taskId: string;
  index: number;
  event: MouseEvent;
}) => {
  startDraggingExistingPin(payload.taskId, payload.event, payload.index);
};

const handleCancelMarkerForTask = (taskId: string) => {
  if (!isAddingPin.value || selectedTaskIdForPin.value !== taskId) return;
  cancelPin();
  ElMessage.info('已取消標記');
};

// 任務與標記關聯 composable
const { handleImageClickWithTask, handleTaskSelect, handleLinkTaskToMarker } =
  useFloorPlanTaskMarker({
    taskMarkers,
    isAddingMarker,
    selectedMarkerId,
    scale,
    translateX,
    translateY,
    imageContainer,
    floorPlanImg,
    createMarker,
    selectMarker,
    tasks: computed(() => props.tasks),
  });

onBeforeUnmount(() => {
  disposeTaskHighlight();
});
</script>
