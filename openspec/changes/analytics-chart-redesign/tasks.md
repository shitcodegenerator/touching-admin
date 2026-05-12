## 1. 環境設定與依賴安裝

- [ ] 1.1 安裝 `echarts` 和 `vue-echarts` 依賴
- [ ] 1.2 在 `main.ts` 或獨立檔案中配置 ECharts 按需引入（bar, line, tooltip, legend, grid, markPoint 等）

## 2. 頁面架構拆分

- [ ] 2.1 建立 `src/views/analytics/` 目錄結構，將現有 `Analytics.vue` 遷移為 `analytics/index.vue`
- [ ] 2.2 建立 `src/views/analytics/components/chartGroups.ts` 圖表分組設定檔（定義所有指標分組、圖表類型、Y 軸配置）
- [ ] 2.3 更新路由設定，將 Analytics 路由指向新的 `analytics/index.vue`

## 3. 後端 API V2 端點

- [ ] 3.1 新增 `indicator_v2` 資料庫 collection/table（結構：index, key, group, year, month, value）
- [ ] 3.2 實作 `GET /api/indicator/v2` 端點（支援 group 篩選參數）
- [ ] 3.3 實作 `POST /api/indicator/v2` 端點（新增單筆，同步寫入舊版結構）
- [ ] 3.4 實作 `PUT /api/indicator/v2/batch` 端點（批次更新，同步寫入舊版結構）
- [ ] 3.5 在 `vite.config.ts` 中確認 proxy 設定支援 v2 路徑

## 4. 資料遷移

- [ ] 4.1 撰寫遷移腳本，將現有 indicator 資料轉換為 v2 結構（含 dry-run 模式）
- [ ] 4.2 定義 index-to-group 對照表（loan, trade, building, economy, consumer, construction, taipei, newtaipei）
- [ ] 4.3 執行遷移並驗證資料完整性

## 5. 數據編輯表格元件

- [ ] 5.1 建立 `DataEditTable.vue`：以 el-table 呈現指標資料（列=指標、欄=月份）
- [ ] 5.2 實作 cell 點擊切換為 el-input 編輯模式，修改後暫存前端狀態並標記已修改樣式
- [ ] 5.3 實作「儲存全部修改」按鈕，呼叫 v2 batch API 批次更新
- [ ] 5.4 實作無修改時按鈕禁用邏輯

## 6. 新增指標彈窗元件

- [ ] 6.1 建立 `IndicatorFormModal.vue`：將現有表單邏輯抽取為 Modal 元件（v-model:open + @success）
- [ ] 6.2 改用 v2 API 新增指標，成功後 emit success 通知主頁面重新載入

## 7. 圖表預覽元件

- [ ] 7.1 建立 `ChartPreview.vue`：接收 chartGroups 設定與指標資料，迴圈渲染多組 ECharts 圖表
- [ ] 7.2 實作雙 Y 軸混合圖（bar + line），用於房貸金額與利率
- [ ] 7.3 實作折線圖，用於進出口貿易、經濟指標
- [ ] 7.4 實作柱狀圖，用於建物登記、建照使照
- [ ] 7.5 實作 markPoint 標註最高/最低值
- [ ] 7.6 確保圖表在數據更新後自動刷新

## 8. 主頁面整合

- [ ] 8.1 在 `analytics/index.vue` 整合 Tab 切換（數據編輯 / 圖表預覽）
- [ ] 8.2 串接 v2 API 載入資料，傳遞給子元件
- [ ] 8.3 處理子元件事件（新增成功、儲存成功 → 重新載入資料）

## 9. 驗證與收尾

- [ ] 9.1 驗證所有圖表分組與 publication 頁面一致
- [ ] 9.2 驗證舊 API `/api/indicator` 行為不受影響
- [ ] 9.3 TypeScript 型別檢查通過（yarn ts）
