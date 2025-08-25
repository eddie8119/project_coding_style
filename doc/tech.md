# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## 專案技術紀錄

### 在 `<keep-alive>` 中的生命週期管理

- **情境**: 在 `src/layouts/AppLayout.vue` 中，`<router-view>` 被 `<keep-alive>` 包裹，以快取頁面組件，提升切換效能。
- **問題**: 這導致頁面切換時不會被銷毀。標準的 `onBeforeUnmount` 生命週期鉤子不會被觸發，造成事件監聽等資源無法釋放，引發記憶體洩漏與渲染錯誤。
- **解決方案**:
    1.  **資源清理**: 清理邏輯（停止動畫、銷毀 renderer、移除事件監聽等）從 `onBeforeUnmount` 移至 `onDeactivated` 鉤子中。此鉤子會在組件被快取時觸發。
    2.  **場景初始化**: 將場景的初始化邏輯封裝成一個獨立的 `initScene` 函數。
    3.  **重新渲染**: 在 `onMounted` (首次掛載) 和 `onActivated` (從快取中被重新啟用) 這兩個鉤子中都呼叫 `initScene` 函數，確保每次進入頁面時都能渲染一個全新的、乾淨的場景。
- **常見bug**:
    1.  Vue 不會重新執行 setup 函數，而是直接從快取中恢復元件狀態。這導致 useDevice(id) 在初次載入後沒有被重新觸發，導致 device 為 undefined，
    ```html
    // 當元件從 keep-alive 快取中被重新啟用時，重新獲取數據
    onActivated(() => {
      refetchDevice();
    });
    ```
    2.  **巢狀路由（Nested Routes）中的 `<keep-alive>` 問題**：
        - **情境**：應用程式使用巢狀路由，例如 `AppLayout.vue` 中有一個主 `<router-view>`，而其子元件 `ObservationLayout.vue` 中又有一個巢狀的 `<router-view>`。

### 處理多樣化的 WebSocket 訊息 (Discriminated Unions)

- **情境**: 應用程式透過單一 WebSocket 連線接收多種不同結構的訊息，例如即時數據 (`real-time`) 和操作狀態 (`action`)。
- **問題**: 在處理 `WsData` 聯合類型的資料時，TypeScript 無法在 `if (newVal.app === 'action')` 的判斷後，自動將 `newVal` 的類型縮小為 `ActionWsData`，導致存取 `newVal.status` 等特定屬性時出現型別錯誤。
- **根本原因**:
    - 聯合類型的辨識符（discriminator），也就是 `app` 屬性，最初被定義為通用的 `string` 類型。
    - 當辨識符是通用 `string` 時，TypeScript 無法從字串比對中確定唯一的子類型，因此無法進行有效的類型限縮。
- **解決方案**:
    1.  **使用字串字面量類型 (String Literal Types)**：將每個子介面中的 `app` 屬性從 `string` 修改為固定的字串字面量，例如 `app: 'action'` 或 `app: 'real-time'`。
    2.  **精確的類型辨識**: 如此一來，當程式碼中出現 `if (newVal.app === 'action')` 這樣的判斷時，TypeScript 就能夠百分之百確定 `newVal` 的類型是 `ActionWsData`，並在該程式區塊內安全地允許存取其特有屬性（如 `status`）。

    ```typescript
    // src/types/websocket.ts

    // 錯誤的作法：'app' 是通用 string
    // interface BasicWsData { app: string; ... }

    // 正確的作法：為每個介面定義具體的 app 字串字面量
    export interface ActionWsData extends BasicWsData {
      app: 'action';
      status: 'finish' | 'running';
    }

    export interface PhWsData extends BasicWsData {
      app: 'real-time';
      mv: number;
      ph: number;
      temperature: number;
    }

    export type WsData = PhWsData | ActionWsData; // ... 其他類型
    ```
- **結論**: 這種使用字串字面量作為辨識符的聯合類型模式，是 TypeScript 中處理異構資料結構最安全、最清晰的最佳實踐。
        - **問題**：即使最外層的 `AppLayout.vue` 使用了 `<keep-alive>`，它只會快取直接的子元件（即 `ObservationLayout.vue`）。巢狀的 `<router-view>` 所渲染的頁面（例如 `device.vue`）不會被快取，導致 `onActivated` 和 `onDeactivated` 鉤子不會觸發。
        - **解決方案**：必須在每一層需要快取內容的 `<router-view>` 都包裹上 `<keep-alive>`。因此，在 `ObservationLayout.vue` 中也需要加入 `<keep-alive>` 來快取其子路由頁面。
        ```html
        <!-- ObservationLayout.vue -->
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
        ```

#### `onMounted` 與 `onActivated` 差異說明

- `onMounted`：當組件**第一次被掛載到 DOM** 時觸發。只會在組件生命週期的起始階段執行一次。
- `onActivated`：當組件被 `<keep-alive>` 快取後，**每次重新進入（被激活）時都會觸發**。例如從其他頁面切回來時，`onActivated` 會再次執行。

因此，若組件有需要初始化的邏輯（如 Three.js 場景、事件監聽等），建議同時在這兩個鉤子中執行，才能兼容首次掛載與快取喚回的情境。

此方法確保了在使用 `<keep-alive>` 的同時，也能正確管理需要手動清理資源的複雜組件的生命週期。

---

### 效能優化與 CLS/INP 實踐原則

#### 降低 Cumulative Layout Shift (CLS)
- **預留容器尺寸**：所有異步資料區塊、圖片、圖表、iframe 都要有明確的 `min-height` 或 `width`/`height`，避免資料到來前高度突變。
- **Skeleton/骨架屏**：資料未到時顯示 skeleton loader，骨架高度應與資料渲染後內容一致。
- **避免條件渲染突變**：用 `v-if`/`v-show` 控制內容時，預留空間或用過渡動畫。
- **字體與 Icon**：Web font 設定 `font-display: swap`，SVG/iconfont 預留寬高。
- **表格/列表**：大量資料載入時，預留區塊高度或用 skeleton。
- **響應式 min-height 實作**：
  - Tailwind 寫法：
    ```html
    <div class="min-h-[220px] md:min-h-[300px] lg:min-h-[380px]">...</div>
    ```
  - 原生 CSS：
    ```css
    .panel-container { min-height: 220px; }
    @media (min-width: 768px) { .panel-container { min-height: 300px; } }
    @media (min-width: 1024px) { .panel-container { min-height: 380px; } }
    ```

#### 降低 Interaction to Next Paint (INP)
- **避免主執行緒阻塞**：拆分大型 JS 運算，必要時用 Web Worker 或 requestIdleCallback。
- **延遲/懶加載**：次要內容用 `defineAsyncComponent` 懶加載，圖片/模組/資料 lazy load。
- **減少不必要 re-render**：props 傳遞精簡、避免 watch/computed 重 fetch。
- **事件處理最佳化**：互動事件內避免重運算、資料處理，考慮 debounce/throttle。
- **虛擬化大型列表**：如需渲染大量資料，建議用 vue-virtual-scroll-list。
- **Skeleton/Loading 實踐**：loading/skeleton 必須與內容高度一致，避免 loading 消失後內容高度突變。

#### loading/skeleton 實作範例
```vue
<template>
  <div class="main-content min-h-[400px]">
    <Loading v-if="isLoading" />
    <template v-else>
      <!-- 真正內容 -->
    </template>
  </div>
</template>
```
- `min-h-[400px]` 保證 loading 和內容高度一致，避免 CLS。

---

### WebSocket 訊息處理原則

- **當 topic 數量不多且每個 topic 處理邏輯簡單時**：
  - 直接用 if 判斷分流即可，程式碼直觀、易於維護。
  - 範例：
    ```ts
    watch(wsParsedData, (newVal) => {
      if (!newVal) return;
      if (newVal.app === 'real-time') { /* ... */ }
      if (newVal.app === 'action') { /* ... */ }
    });
    ```
- **當 topic 很多，或每個 topic 處理邏輯複雜時**：
  - 建議用 switch/case、Map 或拆分成多個 handler function 來分流，讓程式碼更有彈性、易於擴充與維護。
  - 範例：
    ```ts
    const handlers = {
      'real-time': (data) => { /* ... */ },
      'action': (data) => { /* ... */ },
      // ...
    };
    watch(wsParsedData, (newVal) => {
      if (!newVal) return;
      const handler = handlers[newVal.app];
      if (handler) handler(newVal);
    });
    ```
