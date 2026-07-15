# AGENTS.md

本檔提供 Codex、OpenCode、Claude Code 與其他程式代理共同遵守。

## 任務目標

維護一套離線優先、資料可攜、非破壞性的 Storyboard Editor。每個功能必須同時考慮 GUI、Rust 核心、CLI、資料格式與測試。

## 不可違反的規則

1. 不可將專案資料鎖在私有資料庫；`storyboard.json` 是可攜真實來源。
2. 不可直接刪除素材或鏡頭資料；使用封存或垃圾桶流程。
3. 不可在未建立備份的情況下遷移 schema。
4. 不可加入依賴雲端的必要功能；雲端與 AI 只能是可選擴充。
5. 不可將使用者絕對路徑寫入可攜 JSON；以專案根目錄相對路徑保存。
6. 所有寫入必須避免半寫入；Rust 使用 atomic save。
7. 任何 UI 控制都必須有鍵盤焦點、可讀標籤與錯誤狀態。
8. 刪除、覆寫、批次移動與 schema migration 必須先顯示影響範圍。

## 建議工作順序

1. 閱讀 `docs/spec.md`、`docs/architecture.md` 與 `docs/data-model.md`。
2. 在 `docs/todos.md` 選擇未完成項目。
3. 先新增或更新測試，再實作。
4. 執行 `npm test`、`npm run typecheck`、`cargo test --workspace`。
5. 更新 `CHANGELOG.md` 與 `docs/final.md`。

## 完成定義

- 功能可從 GUI 操作。
- 同一資料操作可由 core 層重用。
- CLI 需要時具有等價命令。
- 錯誤不造成資料遺失。
- 測試與文件同步。
- 變更不破壞 sample-project。

## 需要詢問使用者的高風險操作

- 永久刪除資料。
- 覆蓋已存在的輸出。
- 改變大量檔名或路徑。
- schema 降級。
- 發布、上傳或推送至遠端。

其他本機讀取、建立新檔、測試、格式化與非破壞性重構可直接執行。
