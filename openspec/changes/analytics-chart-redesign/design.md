## Context

目前 `Analytics.vue` 是一個單一頁面，使用 Element Plus 表單逐筆新增指標資料，並以表格呈現。後端 API 為 `/api/indicator`（GET/POST），資料結構為陣列 `[{key, value[]}]`，前台 publication 頁面以固定 index（如 `totalData[0]`）取值。

前台 publication 頁面使用 ECharts 將指標分組顯示：
- **房貸金額+利率**：雙 Y 軸混合圖（bar + line）
- **進出口貿易**：雙折線圖
- **建物登記**：柱狀圖（第一次登記 vs 買賣移轉）
- **經濟指標**：GDP、匯率、股價指數
- **消費者指標**：CPI、房租指數、購屋時機指數等
- **建照使照**：營造物價指數 + 核發量
- **雙北房市**：移轉棟數、成交量、均價

後台需新增圖表預覽功能，讓用戶能確認數據趨勢是否合理。

## Goals / Non-Goals

**Goals:**
- 後台用戶可在表格內直接編輯指標數據（inline editing），支援批次儲存
- 以 ECharts 圖表預覽指標資料，分組方式與 publication 頁面一致
- 新增 v2 API 端點，支援帶時間軸的結構化資料與分組查詢
- 新增資料庫 collection，不影響現有資料
- 頁面拆分為子元件架構，符合 coding style 規範

**Non-Goals:**
- 不修改現有 `/api/indicator` 端點或資料庫結構
- 不修改前台 publication 頁面（未來可逐步遷移）
- 不做用戶權限管理（現有認證機制不變）
- 不實作匯入/匯出 Excel 功能

## Decisions

### 1. 圖表庫選擇：ECharts + vue-echarts

**選擇**：使用 `echarts` + `vue-echarts`
**原因**：前台 publication 已使用 ECharts，保持技術棧一致，且 ECharts 原生支援雙 Y 軸混合圖、工具提示等功能。
**替代方案**：Chart.js（較輕量但雙 Y 軸支援較弱）、ApexCharts（API 友好但社群較小）

### 2. 圖表分組規則：硬編碼對照表

**選擇**：在前端定義 `chartGroups` 設定檔，描述每組圖表包含哪些指標、圖表類型、Y 軸配置
**原因**：分組規則與 publication 頁面對齊，變動頻率低，前端定義即可。未來可擴展為後端配置。

```ts
const chartGroups = [
  {
    title: '房貸金額與利率',
    indicators: [
      { index: 1, label: '購屋貸款金額', type: 'bar', yAxisIndex: 0 },
      { index: 2, label: '購屋貸款利率', type: 'line', yAxisIndex: 1 },
    ],
    yAxis: [
      { name: '新台幣百萬元' },
      { name: '年息百分比率' },
    ]
  },
  // ...更多分組
]
```

### 3. 資料結構優化：新增 v2 結構

**選擇**：新增 `indicator_v2` collection/table，結構為：

```json
{
  "index": 1,
  "key": "購屋貸款金額",
  "group": "loan",
  "year": 113,
  "month": 4,
  "value": 95566
}
```

**原因**：每筆資料帶有明確時間軸，可靈活查詢任意時間範圍，不依賴陣列 index 位置。
**替代方案**：在現有結構上加 metadata（但會破壞現有 API 契約）

### 4. 頁面架構：目錄式元件拆分

```
src/views/analytics/
├── index.vue                    # 主頁面：Tab 切換（編輯/圖表預覽）
└── components/
    ├── ChartPreview.vue         # 圖表預覽區（接收分組設定渲染 ECharts）
    ├── DataEditTable.vue        # 指標數據 inline 編輯表格
    ├── IndicatorFormModal.vue   # 新增指標彈窗（保留現有功能）
    └── chartGroups.ts           # 圖表分組設定檔
```

### 5. Inline 編輯策略：Element Plus editable table

**選擇**：使用 `el-table` 搭配 `el-input` 在 cell 層級切換編輯狀態，修改後統一「儲存全部」
**原因**：用戶常需要同時修改多個月份數據，逐筆 API call 效率低。批次儲存更符合使用場景。

## Risks / Trade-offs

- **[資料遷移一致性]** 現有資料需遷移至 v2 結構 → 撰寫遷移腳本，支援 dry-run 模式驗證
- **[雙寫維護成本]** 新舊 API 並存期間需雙寫 → 短期成本可接受，待前台遷移後可廢棄舊 API
- **[ECharts 套件大小]** ECharts 較大（~800KB） → 使用 tree-shaking 按需引入元件
- **[圖表分組硬編碼]** 分組規則寫在前端不夠靈活 → 目前指標穩定，未來再考慮後端配置化
