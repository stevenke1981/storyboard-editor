# Changelog

## Unreleased

- 桌面版改用 Tauri App Data 工作區載入與原子保存 `storyboard.json`，保存失敗會顯示於工具列。
- 新增受控影片預覽、跨鏡頭連續播放，以及可點選與拖曳定位的時間軸播放頭。
- 新增 JSON 下載與桌面匯出，產生 `storyboard.json`、FFmpeg concat 清單與指令範本。
- 桌面匯出會先列出可能覆寫的檔案並要求確認，Rust command 亦會拒絕未確認的呼叫。
- 統一 Rust 原始碼格式與 LF 行尾，確保 workspace 的 rustfmt 檢查可重現通過。

## 0.1.0 - 2026-07-15

- 建立完整 Storyboard Editor 開發骨架。
- 實作鏡頭清單、編輯器、預覽區與比例時間軸。
- 支援文字、時長、圖片、影片、旁白與多音效資料模型。
- 新增 Tauri、Rust core、CLI、JSON Schema、sample project。
- 新增完整流程、UI、測試、發行與 Agent 文件。
- 新增 core/CLI 的 CSV、Markdown、SRT 與 FFmpeg plan 匯出，僅處理啟用鏡頭且不執行覆寫。
- 新增編輯器 undo/redo（最多 50 個快照）與 Ctrl/Cmd+Z、Ctrl/Cmd+Y 快捷鍵。
- 新增安全素材匯入、ffprobe/缺少工具降級、真實媒體預覽與音訊排程。
- 新增 YTPM 唯讀腳本橋接、Playwright 非破壞流程 E2E 與發行簽章說明。
- 新增 fail-closed source packaging 與 release signing preflight/workflow，避免敏感檔案洩漏與未驗證更新。
- Release gate 改為實際 RSA 公鑰驗簽、artifact hash、canonical path 與單調版本檢查，驗證失敗不會上傳。
- 補強 Tauri Minisign key 結構驗證與完整安全 fixture runner。
