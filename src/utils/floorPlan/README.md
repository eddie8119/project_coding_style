# 平面圖功能模組

這個模組包含平面圖功能的所有工具函數，分為三個主要部分：

## 檔案結構

### 1. `floorPlanImage.ts` - 圖片上傳和處理

負責圖片檔案的上傳、驗證和初始化相關功能。

**導出函數：**

- `processImageFile(file: File): Promise<string>` - 將圖片檔案轉換為 Base64 字符串
- `calculateInitialScale(dimensions: ImageDimensions): ScaleResult` - 計算圖片適應螢幕的初始縮放比例
- `isValidImageFile(file: File): boolean` - 驗證檔案是否為有效的圖片格式

**使用場景：**

- 用戶上傳平面圖時驗證和處理檔案
- 圖片載入完成後計算最佳縮放比例

---

### 2. `floorPlanZoom.ts` - 縮放和平移功能

負責圖片的縮放、平移和拖拽相關計算。

**導出函數：**

- `calculateWheelZoom(params: WheelZoomParams): WheelZoomResult` - 計算滾輪縮放結果（以滑鼠位置為中心）
- `calculateDragMove(params: DragMoveParams): DragMoveResult` - 計算拖拽移動結果
- `resetZoomState(initialScale: number): ZoomState` - 重置縮放和位置狀態

**核心特性：**

- 滾輪縮放時保持滑鼠位置不變（中心縮放）
- 支援拖拽平移圖片
- 縮放範圍限制在 0.1x 到 5x

**使用場景：**

- 用戶滾動滑鼠時調整圖片縮放
- 用戶拖拽圖片時計算新的位置
- 點擊「重置」按鈕時恢復初始狀態

---

### 3. `floorPlanMarker.ts` - 任務標記點功能

負責標記點的創建、編輯、刪除和位置計算。

**核心類型：**

```typescript
interface TaskMarker {
  id: string;
  x: number; // 相對於圖片的百分比位置 (0-100)
  y: number;
  title: string;
  description?: string;
}
```

**導出函數：**

- `calculateMarkerStyle(params: MarkerPositionParams): MarkerStyle` - 計算標記點在螢幕上的位置
- `convertClickToMarkerCoordinates(params: ClickToMarkerParams): ClickToMarkerResult` - 將點擊位置轉換為圖片上的相對座標
- `createNewMarker(x, y, title, description): TaskMarker` - 創建新的標記點
- `updateMarker(marker, updates): TaskMarker` - 更新標記點資訊
- `deleteMarker(markers, markerId): TaskMarker[]` - 刪除標記點
- `findMarker(markers, markerId): TaskMarker | undefined` - 查找標記點

**座標系統：**

- 使用百分比座標系統（0-100）確保標記點在縮放時保持正確位置
- 自動處理圖片縮放、平移和容器大小變化

**使用場景：**

- 用戶在平面圖上點擊創建標記點
- 顯示標記點在螢幕上的正確位置
- 編輯或刪除現有的標記點

---

## 使用方式

### 在 Vue 組件中使用

```typescript
import { useFloorPlan } from '@/composables/useFloorPlan';

export default {
  setup() {
    const imageContainer = ref<HTMLDivElement>();
    const floorPlanImg = ref<HTMLImageElement>();

    const {
      // 圖片上傳
      floorPlanImage,
      handleFileSelect,
      handleFileDrop,
      resetFloorPlan,

      // 縮放和平移
      scale,
      imageStyle,
      resetZoom,
      handleWheel,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,

      // 標記點
      taskMarkers,
      isAddingMarker,
      getMarkerStyle,
      handleImageClick,
      selectMarker,
      editMarker,
      deleteMarkerById,
    } = useFloorPlan({ imageContainer, floorPlanImg });

    return {
      imageContainer,
      floorPlanImg,
      floorPlanImage,
      // ... 其他返回值
    };
  },
};
```

---

## 座標系統說明

### 百分比座標系統

- **優點**：標記點位置與圖片尺寸無關，縮放時自動適應
- **範圍**：0-100（相對於圖片寬度和高度）
- **計算方式**：
  ```
  relativeX = (screenX - imageLeft) / imageWidth * 100
  relativeY = (screenY - imageTop) / imageHeight * 100
  ```

### 座標轉換流程

```
用戶點擊 (螢幕座標)
  ↓
計算相對於容器的座標
  ↓
計算相對於圖片的座標
  ↓
轉換為百分比座標 (0-100)
  ↓
保存到標記點
  ↓
顯示時反向轉換為螢幕座標
```

---

## 性能考慮

1. **標記點計算**：每個標記點的位置計算在 `getMarkerStyle()` 中進行，使用 Vue 的響應式系統自動更新
2. **縮放限制**：縮放範圍限制在 0.1x 到 5x，避免過度縮放
3. **事件節流**：可根據需要在 composable 中添加防抖/節流邏輯

---

## 擴展建議

1. **數據持久化**：添加保存/載入標記點到後端的功能
2. **標記點分類**：支援不同類型的標記點（如不同顏色、圖標）
3. **批量操作**：支援選擇多個標記點進行批量操作
4. **撤銷/重做**：實現撤銷和重做功能
5. **協作功能**：支援多用戶實時協作編輯標記點
