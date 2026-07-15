# Desktop IPC Contract

React 不直接存取檔案系統，統一透過 Tauri command。

## `new_project`

輸入：

```json
{ "root": "D:\\StoryboardProjects", "title": "影片名稱" }
```

輸出：建立後的專案根路徑字串。

## `open_project`

輸入：

```json
{ "projectRoot": "D:\\StoryboardProjects\\影片名稱" }
```

輸出：完整 `StoryboardProject`。

## `write_project`

輸入：

```json
{ "projectRoot": "...", "project": { "schemaVersion": 1 } }
```

行為：驗證、備份、暫存寫入、替換正式檔。

## `check_project`

輸入完整 project，輸出診斷文字陣列。正式版應改為結構化 severity/path/message。

## 參數命名

Tauri JavaScript 呼叫使用 camelCase；Rust command 參數由 Tauri 對應。修改命令名稱或參數時必須同步 `src/api/desktop.ts`、Rust command 與測試。
