# 平面圖組件模組

這個模組包含平面圖功能的所有 UI 組件，分為多個層級的組件。

## 組件結構

```
FloorPlanContainer (主容器)
├── UploadArea (上傳區域)
├── FloorPlanToolbar (工具列)
└── FloorPlanCanvas (平面圖容器)
    └── FloorPlanMarkerPoint (標記點)
        └── FloorPlanMarkerPopup (標記點資訊氣泡)
```

## 組件說明

### 1. FloorPlanContainer.vue

**主容器組件** - 整合所有子組件和業務邏輯

**功能：**

- 管理平面圖的整體狀態
- 使用 `useFloorPlan` composable 獲取所有功能
- 協調子組件之間的通信
- 處理事件分發

**Props：** 無

**Events：** 無（內部管理）

**使用方式：**

```vue
<template>
  <FloorPlanContainer />
</template>
```

---

### 2. UploadArea.vue

**上傳區域組件** - 處理圖片上傳

**功能：**

- 顯示上傳提示
- 支援點擊上傳
- 支援拖拽上傳
- 檔案格式提示

**Props：** 無

**Events：**

- `file-select` - 檔案被選擇時觸發
- `file-drop` - 檔案被拖拽放下時觸發

**Expose：**

- `fileInputRef` - 檔案輸入元素的引用

**使用方式：**

```vue
<UploadArea @file-select="handleFileSelect" @file-drop="handleFileDrop" />
```

---

### 3. FloorPlanToolbar.vue

**工具列組件** - 顯示操作按鈕和狀態

**功能：**

- 重新上傳按鈕
- 適應螢幕按鈕
- 添加標記按鈕（切換狀態）
- 縮放比例顯示

**Props：**

- `scale: number` - 當前縮放比例
- `isAddingMarker: boolean` - 是否在添加標記模式

**Events：**

- `reset-floor-plan` - 重新上傳按鈕被點擊
- `reset-zoom` - 適應螢幕按鈕被點擊
- `toggle-add-marker` - 添加標記按鈕被點擊

**使用方式：**

```vue
<FloorPlanToolbar
  :scale="scale"
  :is-adding-marker="isAddingMarker"
  @reset-floor-plan="resetFloorPlan"
  @reset-zoom="resetZoom"
/>
```

---

### 4. FloorPlanCanvas.vue

**平面圖容器組件** - 管理圖片和標記點的顯示

**功能：**

- 顯示平面圖
- 管理縮放和平移
- 渲染所有標記點
- 處理滑鼠和鍵盤事件

**Props：**

- `floorPlanImage: string` - 圖片 Base64 字符串
- `imageStyle: Record<string, string>` - 圖片樣式
- `taskMarkers: TaskMarker[]` - 標記點列表
- `selectedMarkerId: string | null` - 選中的標記點 ID
- `isAddingMarker: boolean` - 是否在添加標記模式
- `getMarkerStyle: (marker: TaskMarker) => Record<string, string>` - 計算標記點樣式的函數

**Events：**

- `wheel` - 滾輪事件
- `mousedown` - 滑鼠按下事件
- `mousemove` - 滑鼠移動事件
- `mouseup` - 滑鼠釋放事件
- `container-click` - 容器被點擊
- `image-load` - 圖片載入完成
- `image-click` - 圖片被點擊
- `select-marker` - 標記點被選擇
- `edit-marker` - 標記點編輯按鈕被點擊
- `delete-marker` - 標記點刪除按鈕被點擊

**Expose：**

- `imageContainer` - 容器元素的引用
- `floorPlanImg` - 圖片元素的引用

**使用方式：**

```vue
<FloorPlanCanvas
  :floor-plan-image="floorPlanImage"
  :image-style="imageStyle"
  :task-markers="taskMarkers"
  :selected-marker-id="selectedMarkerId"
  :is-adding-marker="isAddingMarker"
  :get-marker-style="getMarkerStyle"
  @wheel="handleWheel"
  @mousedown="handleMouseDown"
  @mousemove="handleMouseMove"
  @mouseup="handleMouseUp"
  @container-click="handleContainerClick"
  @image-load="handleImageLoad"
  @image-click="handleImageClick"
  @select-marker="selectMarker"
  @edit-marker="editMarker"
  @delete-marker="deleteMarkerById"
/>
```

---

### 5. FloorPlanMarkerPoint.vue

**標記點組件** - 顯示單個標記點

**功能：**

- 顯示標記點圖標
- 顯示選中狀態（顏色變化）
- 顯示懸停效果
- 條件渲染資訊氣泡

**Props：**

- `marker: TaskMarker` - 標記點數據
- `markerStyle: Record<string, string>` - 標記點位置樣式
- `isSelected: boolean` - 是否被選中

**Events：**

- `select` - 標記點被點擊
- `edit` - 編輯按鈕被點擊
- `delete` - 刪除按鈕被點擊

**使用方式：**

```vue
<FloorPlanMarkerPoint
  :marker="marker"
  :marker-style="markerStyle"
  :is-selected="isSelected"
  @select="selectMarker"
  @edit="editMarker"
  @delete="deleteMarker"
/>
```

---

### 6. FloorPlanMarkerPopup.vue

**標記點資訊氣泡組件** - 顯示標記點詳細資訊

**功能：**

- 顯示標記點標題
- 顯示標記點描述
- 編輯按鈕
- 刪除按鈕

**Props：**

- `marker: TaskMarker` - 標記點數據

**Events：**

- `edit` - 編輯按鈕被點擊
- `delete` - 刪除按鈕被點擊

**使用方式：**

```vue
<FloorPlanMarkerPopup :marker="marker" @edit="editMarker" @delete="deleteMarker" />
```

---

## 數據流

```
FloorPlanContainer
  ├─ useFloorPlan composable (業務邏輯)
  │
  ├─ UploadArea
  │   └─ emit: file-select, file-drop
  │
  ├─ FloorPlanToolbar
  │   └─ emit: reset-floor-plan, reset-zoom, toggle-add-marker
  │
  └─ FloorPlanCanvas
      ├─ emit: wheel, mousedown, mousemove, mouseup, etc.
      │
      └─ FloorPlanMarkerPoint (v-for)
          ├─ emit: select, edit, delete
          │
          └─ FloorPlanMarkerPopup (v-if isSelected)
              └─ emit: edit, delete
```

---

## 使用示例

### 在頁面中使用

```vue
<template>
  <FloorPlanContainer />
</template>

<script setup lang="ts">
import FloorPlanContainer from '@/components/plan/FloorPlanContainer.vue';
</script>
```

### 自定義使用（進階）

如果需要更細粒度的控制，可以直接使用子組件：

```vue
<template>
  <div class="h-full w-full bg-gray-50">
    <UploadArea
      v-if="!floorPlanImage"
      @file-select="handleFileSelect"
      @file-drop="handleFileDrop"
    />

    <div v-else class="relative h-full w-full">
      <FloorPlanToolbar
        :scale="scale"
        :is-adding-marker="isAddingMarker"
        @reset-floor-plan="resetFloorPlan"
        @reset-zoom="resetZoom"
      />

      <FloorPlanCanvas
        :floor-plan-image="floorPlanImage"
        :image-style="imageStyle"
        :task-markers="taskMarkers"
        :selected-marker-id="selectedMarkerId"
        :is-adding-marker="isAddingMarker"
        :get-marker-style="getMarkerStyle"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @container-click="handleContainerClick"
        @image-load="handleImageLoad"
        @image-click="handleImageClick"
        @select-marker="selectMarker"
        @edit-marker="editMarker"
        @delete-marker="deleteMarkerById"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFloorPlan } from '@/composables/useFloorPlan';
import UploadArea from '@/components/plan/UploadArea.vue';
import FloorPlanToolbar from '@/components/plan/FloorPlanToolbar.vue';
import FloorPlanCanvas from '@/components/plan/FloorPlanCanvas.vue';

const imageContainer = ref<HTMLDivElement>();
const floorPlanImg = ref<HTMLImageElement>();

const {
  floorPlanImage,
  handleFileSelect,
  handleFileDrop,
  resetFloorPlan,
  scale,
  imageStyle,
  resetZoom,
  handleImageLoad,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  taskMarkers,
  isAddingMarker,
  selectedMarkerId,
  getMarkerStyle,
  handleImageClick,
  handleContainerClick,
  selectMarker,
  editMarker,
  deleteMarkerById,
} = useFloorPlan({ imageContainer, floorPlanImg });
</script>
```

---

## 樣式

所有組件使用 Tailwind CSS 進行樣式設置，無需額外的 CSS 文件。

---

## 相關檔案

- `src/composables/useFloorPlan.ts` - 業務邏輯 composable
- `src/utils/floorPlan/` - 工具函數
- `src/pages/protected/todo/floor-plan.vue` - 頁面入口
