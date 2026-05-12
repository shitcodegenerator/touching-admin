## Why

目前 Analytics 後台頁面僅提供簡易表單新增指標數據與表格查詢功能，缺乏可視化圖表預覽，後台用戶無法直觀確認數據正確性或趨勢變化。同時現有的資料儲存結構（以 `{key, value[]}` 陣列存放）缺乏時間軸對應，導致前台 publication 頁面需以固定 index 取值（`totalData[0]`、`totalData[1]`...），不易維護且容易出錯。

需要一個能讓後台用戶方便編輯、即時預覽圖表效果的管理介面，並優化資料結構以支援更靈活的查詢與分組顯示。

## What Changes

- 新增 ECharts 可視化圖表區塊，依據 publication 頁面分組方式呈現（如：購屋貸款金額 + 利率同一張圖、進出口貿易同圖、經濟指標分組等）
- 重新設計指標數據編輯介面，支援 inline 編輯表格數據，取代目前逐筆新增的方式
- 新增後端 API endpoint `/proxyApi/indicator/v2` 系列，提供分組查詢與批次更新功能（不動現有 `/proxyApi/indicator`）
- 新增資料庫 collection/table 以優化結構，增加時間軸欄位（year/month）和分組（group）欄位
- 頁面拆分為子元件架構：主頁面 + ChartPreview + DataEditTable + IndicatorFormModal

## Capabilities

### New Capabilities
- `chart-visualization`: 依據 publication 分組規則，使用 ECharts 渲染多組可視化圖表（柱狀圖、折線圖、雙 Y 軸混合圖）
- `inline-data-editing`: 表格內直接編輯指標數據，支援批次儲存，取代逐筆新增表單
- `indicator-api-v2`: 新版 API 端點，支援分組查詢、批次更新、帶時間軸的結構化資料格式
- `data-migration`: 將現有 indicator 資料遷移至新結構（保留舊 API 不動）

### Modified Capabilities
<!-- 不修改現有 capabilities，所有新功能透過新 API 和新元件實現 -->

## Impact

- **前端**：`src/views/Analytics.vue` 重構為目錄結構 `src/views/analytics/index.vue` + 子元件
- **新增依賴**：`echarts`、`vue-echarts`
- **後端 API**：新增 `/api/indicator/v2/*` 系列端點（不影響現有 `/api/indicator`）
- **資料庫**：新增 collection/table，不修改現有資料結構
- **Publication 前台**：本次不影響，未來可逐步遷移至新 API
