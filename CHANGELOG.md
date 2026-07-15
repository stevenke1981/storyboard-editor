# Changelog

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
