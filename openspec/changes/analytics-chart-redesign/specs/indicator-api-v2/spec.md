## ADDED Requirements

### Requirement: V2 查詢端點
系統 SHALL 提供 `GET /api/indicator/v2` 端點，回傳結構化指標資料。

#### Scenario: 查詢所有指標
- **WHEN** 前端呼叫 `GET /proxyApi/indicator/v2`
- **THEN** 系統 SHALL 回傳格式為 `{ data: [{ index, key, group, values: [{ year, month, value }] }] }` 的 JSON

#### Scenario: 按分組查詢
- **WHEN** 前端呼叫 `GET /proxyApi/indicator/v2?group=loan`
- **THEN** 系統 SHALL 僅回傳 group 為 `loan` 的指標資料

### Requirement: V2 批次更新端點
系統 SHALL 提供 `PUT /api/indicator/v2/batch` 端點，支援批次更新多筆指標數據。

#### Scenario: 批次更新成功
- **WHEN** 前端送出 `PUT /proxyApi/indicator/v2/batch` 包含 `{ updates: [{ index, year, month, value }] }`
- **THEN** 系統 SHALL 更新對應資料並回傳 `{ success: true, updated: N }`

#### Scenario: 批次更新同步舊 API
- **WHEN** 批次更新成功
- **THEN** 系統 SHALL 同步更新舊版 `/api/indicator` 的資料結構，確保前台 publication 頁面不受影響

### Requirement: V2 新增端點
系統 SHALL 提供 `POST /api/indicator/v2` 端點，新增單筆指標數據。

#### Scenario: 新增成功
- **WHEN** 前端送出 `POST /proxyApi/indicator/v2` 包含 `{ index, year, month, value }`
- **THEN** 系統 SHALL 新增資料至 v2 collection 並同步至舊版結構，回傳 `{ success: true }`

### Requirement: 不影響現有 API
所有 v2 端點 SHALL 為獨立新增，不修改現有 `/api/indicator` 端點的行為與資料格式。

#### Scenario: 舊 API 不變
- **WHEN** 前端呼叫 `GET /api/indicator`
- **THEN** 回傳格式與行為 SHALL 與變更前完全一致
