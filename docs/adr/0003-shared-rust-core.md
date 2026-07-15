# ADR 0003：GUI 與 CLI 共用 Rust 核心

## 決策

資料驗證、專案建立、存取與匯出計畫放在 `storyboard-core`；Tauri 與 CLI 僅作 adapter。

## 理由

讓人工操作與 AI Agent 使用同一套規則，降低行為分歧。
