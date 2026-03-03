# 平面圖圖片等比例顯示修復

## 問題描述

FloorPlanCanvas 組件中的圖片會出現變形問題，原因是沒有正確設定保持等比例的 CSS 屬性。

## 問題分析

### 原始問題

1. **缺少等比例屬性**：`<img>` 標籤沒有設定 `object-fit: contain`
2. **尺寸控制不當**：完全依賴 `transform: scale()` 但沒有基礎尺寸設定
3. **瀏覽器預設行為**：圖片可能被容器強制拉伸

### 根本原因

```vue
<!-- 原始代碼 - 會變形 -->
<img
  :src="floorPlanImage"
  :style="imageStyle"
  class="select-none transition-transform duration-200"
/>
```

`imageStyle` 只包含：

```typescript
{
  transform: `translate(${x}px, ${y}px) scale(${scale})`,
  transformOrigin: 'center center',
}
```

## 修復方案

### 1. FloorPlanCanvas.vue 修復

```vue
<!-- 修復後 - 保持等比例 -->
<img
  ref="floorPlanImg"
  :src="floorPlanImage"
  :style="imageStyle"
  class="select-none transition-transform duration-200"
  style="max-width: none; max-height: none; object-fit: contain"
  alt="平面圖"
  draggable="false"
  @load="$emit('image-load')"
  @click="$emit('image-click', $event)"
/>
```

**新增的 CSS 屬性：**

- `max-width: none` - 移除最大寬度限制
- `max-height: none` - 移除最大高度限制
- `object-fit: contain` - 保持等比例，完整顯示圖片

### 2. useFloorPlan.ts 修復

```typescript
const imageStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transformOrigin: 'center center',
  width: 'auto', // 新增：自動寬度
  height: 'auto', // 新增：自動高度
  maxWidth: 'none', // 新增：移除最大寬度限制
  maxHeight: 'none', // 新增：移除最大高度限制
  objectFit: 'contain', // 新增：保持等比例
}));
```

## 修復效果

### 修復前

- ❌ 圖片可能被拉伸變形
- ❌ 長寬比不正確
- ❌ 圖片顯示不自然

### 修復後

- ✅ 圖片保持原始長寬比
- ✅ 等比例縮放
- ✅ 完整顯示圖片內容
- ✅ 自然的視覺效果

## CSS 屬性說明

### `object-fit: contain`

- **作用**：保持圖片原始長寬比
- **行為**：圖片會完整顯示在容器內，可能會有空白區域
- **優點**：不會裁切或變形圖片

### `max-width: none` & `max-height: none`

- **作用**：移除瀏覽器或框架的預設尺寸限制
- **必要性**：確保圖片可以按照實際需要的尺寸顯示

### `width: auto` & `height: auto`

- **作用**：讓圖片保持原始尺寸比例
- **配合**：與 `object-fit: contain` 一起使用效果最佳

## 測試方法

### 1. 上傳不同比例的圖片

- 正方形圖片 (1:1)
- 橫向圖片 (16:9, 4:3)
- 縱向圖片 (9:16, 3:4)

### 2. 檢查縮放行為

- 放大縮小時圖片比例是否正確
- 平移時圖片是否保持形狀
- 重置縮放時是否回到正確比例

### 3. 多圖片切換測試

- 切換不同比例圖片時是否正確顯示
- 每張圖片是否都保持等比例

## 相關檔案

- `src/components/plan/FloorPlanCanvas.vue` - 主要修復
- `src/composables/useFloorPlan.ts` - 樣式計算修復
- `src/utils/floorPlan/floorPlanImage.ts` - 初始縮放計算（無需修改）

## 注意事項

1. **不要移除 `object-fit: contain`**：這是保持等比例的關鍵屬性
2. **保留 `transform: scale()`**：這是縮放功能的核心
3. **測試多種圖片比例**：確保各種尺寸的圖片都能正確顯示

## 未來優化建議

1. **響應式處理**：根據容器大小動態調整
2. **載入狀態**：圖片載入時顯示佔位符
3. **錯誤處理**：圖片載入失敗時的備用方案
