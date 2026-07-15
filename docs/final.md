# 交付狀態

## 本開發包包含

- 完整產品、流程、UI、架構、資料與測試設計。
- 可直接執行的 React/Vite MVP 編輯器。
- Tauri 2 桌面專案骨架。
- 可編譯的 Rust core 與 CLI 設計。
- sample project、JSON Schema、CI 與 PowerShell 腳本。

## 已實作的 MVP 互動

- 新增、複製、選取與封存鏡頭。
- 編輯標題、時長、腳本文字、畫面描述。
- 設定圖片／影片路徑與生成提示詞。
- 設定旁白文字、音檔路徑、voice、offset、gain。
- 新增與移除音效。
- 顯示預覽卡與比例時間軸。
- localStorage 自動保存瀏覽器 demo。
- CSV、Markdown、SRT 與 FFmpeg plan 可由 core/CLI 匯出；FFmpeg plan 僅描述組裝計畫，不直接執行。
- 編輯器支援最多 50 層 undo/redo 快照與鍵盤快捷鍵。
- 鏡頭清單支援以 HTML5 drag-and-drop 重新排序（仍保留按鈕與鍵盤操作）。
- Tauri 提供不可覆寫的素材複製命令；瀏覽器模式可選取檔案建立本機預覽 URL。
- ffprobe adapter 與 YTPM 腳本橋接均為可選，缺少外部工具時保留清楚錯誤。
- Playwright E2E 已覆蓋啟動、新增、復原與匯出 JSON 的非破壞流程。
- 桌面版已註冊 Tauri updater plugin，提供鍵盤可達的「檢查更新」按鈕與錯誤狀態；安裝前確認流程仍由正式 updater artifact/憑證提供。
- Security runner 覆蓋 metadata tamper、version contract、source package secrets 與 Tauri Minisign key 結構/id/marker/extra-line 案例。

## 尚待完成

- 完整 FFmpeg renderer（目前只有安全的 plan JSON）。
- 完整更新器整合仍需平台憑證與替換 pinned public key；目前已註冊 Tauri updater plugin，並提供實際 RSA 驗簽、版本遞增、hash/path gate 與 Tauri installer workflow，但本機未持有正式憑證，未宣稱已發行。

請勿將上述未完成項目誤稱為已通過或已發行功能。

## 本次環境驗證

- JSON：全部可解析。
- JSON Schema：`sample-project/storyboard.json` 驗證通過。
- SVG：UI 線框圖 XML 結構通過。
- TypeScript：`npm run typecheck`、`npm test` 與 `npm run build` 通過。
- E2E：`npm run test:e2e` 通過 1 個非破壞流程。
- Rust：使用 `C:\Users\steven\.cargo\bin\cargo.exe test --workspace` 通過。
- Release gate：dev 模式通過；release 缺 endpoint、HTTP endpoint、hash mismatch 時正確拒絕；source package allowlist 未包含敏感副檔名或 operational 目錄。

完整紀錄見 `docs/validation-report.md`。
