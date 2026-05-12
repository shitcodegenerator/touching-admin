## ADDED Requirements

### Requirement: 資料遷移腳本
系統 SHALL 提供遷移腳本，將現有 indicator 資料轉換為 v2 結構。

#### Scenario: 遷移現有資料
- **WHEN** 執行遷移腳本
- **THEN** 系統 SHALL 讀取現有 indicator collection 中的 `[{key, value[]}]` 格式資料，根據預定義的 index-to-group 對照表和起始月份設定，轉換為 `{index, key, group, year, month, value}` 格式寫入 v2 collection

#### Scenario: Dry-run 模式
- **WHEN** 執行遷移腳本帶 `--dry-run` 參數
- **THEN** 系統 SHALL 僅輸出將會遷移的資料摘要（筆數、指標清單），不實際寫入資料庫

### Requirement: 遷移不影響現有資料
遷移腳本 SHALL 僅讀取現有 collection 並寫入新 collection，不修改或刪除現有資料。

#### Scenario: 現有資料完整性
- **WHEN** 遷移完成後
- **THEN** 現有 indicator collection 的資料 SHALL 與遷移前完全一致
