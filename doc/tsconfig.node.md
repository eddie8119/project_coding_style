# `tsconfig.node.json` 設定詳解

這個檔案是專門為 Node.js 環境設定的 TypeScript 編譯器選項。它確保了像是 `vite.config.js`、`.eslintrc.cjs` 等在 Node.js 中執行的設定檔，能夠被 TypeScript 正確地理解和檢查。

## `compilerOptions`

這部分包含了 TypeScript 編譯器的主要設定。

*   **`tsBuildInfoFile`**: `"./node_modules/.tmp/tsconfig.node.tsbuildinfo"`
    *   指定一個檔案路徑，用來儲存上次編譯的資訊。這有助於 TypeScript 進行增量編譯，加快後續的編譯速度。

*   **`target`**: `"ES2022"`
    *   設定 TypeScript 編譯後輸出的 JavaScript 版本。`ES2022` 表示會編譯成符合 ECMAScript 2022 標準的程式碼。

*   **`lib`**: `["ES2023"]`
    *   指定編譯時需要包含的內建 API 庫。`ES2023` 讓你可以使用最新的 JavaScript 功能，例如陣列的 `findLast` 方法。

*   **`module`**: `"ESNext"`
    *   指定輸出的模組系統。`ESNext` 表示使用最新的 ECMAScript 模組標準（`import`/`export`）。

*   **`moduleResolution`**: `"bundler"`
    *   設定模組解析策略。`"bundler"` 是 Vite 推薦的選項，它模仿了像 Vite 或 Webpack 這類打包工具的解析行為，能更好地處理 `exports` 欄位。

*   **`skipLibCheck`**: `true`
    *   跳過對所有宣告檔案（`.d.ts`）的型別檢查。這可以加快編譯速度，特別是當專案依賴很多第三方套件時。

*   **`isolatedModules`**: `true`
    *   要求每個檔案都必須是獨立的模組。這有助於確保程式碼可以被某些工具（如 Babel）正確地轉換，因為這些工具一次只處理一個檔案。

*   **`moduleDetection`**: `"force"`
    *   強制 TypeScript 將每個檔案都視為一個模組，即使它沒有 `import` 或 `export` 語句。

*   **`noEmit`**: `true`
    *   告訴 TypeScript 編譯器不要產生任何輸出檔案（如 `.js` 檔）。這個設定通常用在當你只用 TypeScript 來做型別檢查，而實際的程式碼轉換由其他工具（如 Vite 或 Babel）處理時。

*   **`baseUrl`**: `"."`
    *   設定解析非相對模組路徑的基準目錄。`"."` 表示專案根目錄。

*   **`paths`**: `{"@/*": ["./src/*"]}`
    *   設定路徑別名。這讓你可以用 `@/` 來代替 `src/`，使 `import` 路徑更簡潔。例如，`import MyComponent from '@/components/MyComponent.vue'`。

### `Linting` (程式碼品質檢查)

*   **`strict`**: `true`
    *   啟用所有嚴格的型別檢查選項，包含 `noImplicitAny`、`strictNullChecks` 等。這有助於在開發早期發現潛在的錯誤。

*   **`noUnusedLocals`**: `true`
    *   如果宣告了局部變數但未使用，編譯器會報錯。

*   **`noUnusedParameters`**: `true`
    *   如果宣告了函式參數但未使用，編譯器會報錯。

*   **`noFallthroughCasesInSwitch`**: `true`
    *   在 `switch` 語句中，如果一個 `case` 區塊沒有 `break` 或 `return`，編譯器會報錯，防止意外的 "fall-through" 行為。

## `include`

這個陣列指定了哪些檔案需要被 TypeScript 編譯器納入檢查範圍。

*   `"vite.config.*"`: 包含所有 `vite.config` 開頭的檔案 (如 `vite.config.js`, `vite.config.ts`)。
*   `"vitest.config.*"`: 包含 Vitest 測試設定檔。
*   `"cypress.config.*"`: 包含 Cypress 端對端測試設定檔。
*   `"nightwatch.config.*"`: 包含 Nightwatch 端對端測試設定檔。
*   `"playwright.config.*"`: 包含 Playwright 端對端測試設定檔。
*   `"postcss.config.js"`: 包含 PostCSS 設定檔。
*   `"tailwind.config.js"`: 包含 Tailwind CSS 設定檔。
*   `".eslintrc.cjs"`: 包含 ESLint 設定檔。
*   `"vitest.setup.ts"`: 包含 Vitest 的初始化設定檔。

這個設定確保了所有在 Node.js 環境中執行的重要設定檔都被 TypeScript 進行了型別檢查，提高了專案的穩定性和可維護性。
