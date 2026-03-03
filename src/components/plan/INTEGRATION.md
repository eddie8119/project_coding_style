# 平面圖功能整合說明

## 整合概述

平面圖功能已成功整合到專案系統中，現在可以：

1. **讀取專案中的平面圖** - 從 `fetchedProject.floorPlanUrls` 讀取已保存的平面圖
2. **多圖片支持** - 支援顯示和切換多張平面圖
3. **新增圖片** - 在現有平面圖基礎上新增更多圖片
4. **圖片切換** - 提供前後切換按鈕瀏覽多張圖片

## 數據流

```
專案數據 (fetchedProject)
  ↓
floorPlanUrls: string[]
  ↓
FloorPlanContainer (props)
  ↓
合併專案圖片 + 新上傳圖片
  ↓
顯示當前選中的圖片
```

## 組件更新

### 1. FloorPlanContainer.vue

**新增功能：**

- `floorPlanUrls` props - 接收專案中的平面圖 URLs
- 多圖片管理 - 合併專案圖片和新上傳圖片
- 圖片切換邏輯 - 前後切換功能
- 自動縮放重置 - 切換圖片時自動適應螢幕

**Props：**

```typescript
interface Props {
  floorPlanUrls?: string[];
}
```

**新增狀態：**

- `currentImageIndex` - 當前顯示圖片的索引
- `uploadedImages` - 新上傳的圖片列表
- `allFloorPlanUrls` - 合併所有圖片的計算屬性
- `currentFloorPlanImage` - 當前顯示圖片的計算屬性

### 2. FloorPlanToolbar.vue

**新增功能：**

- 圖片切換按鈕 (← →)
- 圖片計數顯示 (1 / 3)
- 條件顯示 - 只在多圖片時顯示切換按鈕

**新增 Props：**

```typescript
{
  hasMultipleImages?: boolean;
  currentImageIndex?: number;
  totalImages?: number;
}
```

**新增 Events：**

```typescript
{
  'prev-image': [];
  'next-image': [];
}
```

### 3. floor-plan.vue

**整合功能：**

- 使用 `useProject` 獲取專案數據
- 傳遞 `floorPlanUrls` 到 FloorPlanContainer
- 添加載入狀態顯示

## 使用方式

### 基本使用

```vue
<template>
  <FloorPlanContainer :floor-plan-urls="projectFloorPlans" />
</template>

<script setup lang="ts">
const projectFloorPlans = ['url1.jpg', 'url2.jpg', 'url3.jpg'];
</script>
```

### 在專案頁面中使用

```vue
<template>
  <FloorPlanContainer :floor-plan-urls="fetchedProject?.floorPlanUrls || []" />
</template>

<script setup lang="ts">
import { useProject } from '@/composables/useProject';

const { fetchedProject } = useProject(projectId);
</script>
```

## 功能特性

### 1. 圖片來源合併

- **專案圖片**：從 `floorPlanUrls` 讀取
- **新上傳圖片**：用戶新上傳的圖片
- **自動合併**：兩者自動合併為一個列表

### 2. 圖片切換

- **前後切換**：← → 按鈕
- **鍵盤支持**：可擴展支持方向鍵
- **邊界處理**：第一張/最後一張時按鈕禁用

### 3. 狀態管理

- **索引追蹤**：記住當前顯示的圖片
- **自動重置**：專案數據變化時重置到第一張
- **縮放重置**：切換圖片時自動適應螢幕

### 4. 用戶體驗

- **載入狀態**：專案數據載入時顯示載入動畫
- **無圖片狀態**：沒有圖片時顯示上傳區域
- **多圖片指示**：清楚顯示當前圖片位置

## 數據結構

### ProjectResponse 類型

```typescript
interface ProjectResponse {
  // ... 其他屬性
  floorPlanUrls?: string[];
}
```

### 圖片數據流

```typescript
// 專案中的圖片
const projectImages = fetchedProject?.floorPlanUrls || [];

// 新上傳的圖片
const uploadedImages = ref<string[]>([]);

// 合併所有圖片
const allImages = computed(() => [...projectImages, ...uploadedImages.value]);

// 當前顯示的圖片
const currentImage = computed(() => allImages.value[currentIndex.value]);
```

## 擴展建議

### 1. 圖片管理

- **刪除功能**：允許刪除特定圖片
- **重新排序**：拖拽排序圖片
- **批量上傳**：一次上傳多張圖片

### 2. 數據持久化

- **保存到後端**：將新上傳的圖片保存到專案
- **同步更新**：更新專案的 `floorPlanUrls`
- **版本控制**：追蹤圖片變更歷史

### 3. 用戶體驗

- **縮略圖預覽**：底部顯示所有圖片縮略圖
- **快速跳轉**：點擊縮略圖快速切換
- **全螢幕模式**：支援全螢幕瀏覽

### 4. 性能優化

- **懶加載**：只載入當前和相鄰圖片
- **圖片壓縮**：上傳前自動壓縮
- **快取機制**：快取已載入的圖片

## 相關檔案

- `src/components/plan/FloorPlanContainer.vue` - 主容器組件
- `src/components/plan/FloorPlanToolbar.vue` - 工具列組件
- `src/pages/protected/todo/floor-plan.vue` - 頁面入口
- `src/types/response.ts` - 數據類型定義
- `src/composables/useProject.ts` - 專案數據管理
