## ADDED Requirements

### Requirement: 表格 Inline 編輯
系統 SHALL 以表格形式展示所有指標資料，每個 cell 可直接點擊進入編輯模式。

#### Scenario: 點擊 cell 進入編輯
- **WHEN** 用戶點擊表格中的數值 cell
- **THEN** 該 cell SHALL 切換為 input 輸入框，顯示當前數值供編輯

#### Scenario: 離開 cell 保留暫存
- **WHEN** 用戶修改 cell 數值後點擊其他位置
- **THEN** 修改 SHALL 暫存於前端狀態（不立即送出 API），cell 顯示為「已修改」樣式

### Requirement: 批次儲存
系統 SHALL 提供「儲存全部修改」按鈕，將所有暫存的修改一次送出。

#### Scenario: 批次儲存成功
- **WHEN** 用戶點擊「儲存全部修改」且有暫存修改
- **THEN** 系統 SHALL 呼叫 v2 API 批次更新，成功後清除修改狀態並顯示成功訊息

#### Scenario: 無修改時儲存按鈕禁用
- **WHEN** 沒有任何暫存修改
- **THEN** 「儲存全部修改」按鈕 SHALL 為禁用狀態

### Requirement: 新增指標資料
系統 SHALL 保留現有的表單新增功能，以 Modal 彈窗方式呈現。

#### Scenario: 開啟新增彈窗
- **WHEN** 用戶點擊「新增資料」按鈕
- **THEN** 系統 SHALL 顯示 Modal 彈窗，包含指標選擇、年月輸入、數值輸入欄位

### Requirement: 表格顯示結構
表格 SHALL 以指標名稱為列（row），月份為欄（column），顯示對應數值。

#### Scenario: 表格列欄配置
- **WHEN** 表格載入資料
- **THEN** 第一欄 SHALL 為固定的指標名稱，後續欄位 SHALL 為時間序列月份（如 113/4、113/5...），按時間升序排列
