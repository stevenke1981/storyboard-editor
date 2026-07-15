# Storyboard Editor

獨立運行、離線優先的影片分鏡編輯器。每一鏡可設定文字、時長、圖片、影片、旁白、音效、轉場與備註，並能匯出供剪輯軟體、FFmpeg 或 YouTube Project Manager 使用的結構化專案。

## 主要能力

- 鏡頭清單：新增、複製、排序、停用與封存鏡頭。
- 鏡頭屬性：標題、腳本文字、畫面描述、時長、比例、轉場。
- 視覺素材：圖片、影片、生成提示詞、裁切與適配方式。
- 音訊素材：旁白文字、旁白音檔、多個音效、音量與起始位置。
- 預覽：單鏡預覽、連續播放、目前時間與總長度。
- 時間軸：依時長比例呈現鏡頭，可選取與快速定位。
- 專案保存：JSON 為真實來源，SQLite 僅作索引快取。
- 桌面打包：Tauri 2 + Rust。
- Agent 友善：CLI、JSON Schema、AGENTS.md、明確驗收條件。

## 技術架構

- React 19 + TypeScript + Vite
- Tauri 2
- Rust workspace
- storyboard-core 共用核心
- storyboard-cli 命令列工具
- JSON Schema 2020-12
- Vitest 單元測試

## 快速開始

### 前端預覽

```powershell
npm install
npm run dev
```

開啟 `http://localhost:1420`。

### 桌面開發

先安裝 Node.js、Rust 與 Tauri 所需系統元件，再執行：

```powershell
npm install
npm run tauri dev
```

### 建置

```powershell
npm run build
npm run tauri build
```

### Rust CLI

```powershell
cargo run -p storyboard-cli -- new --root D:\StoryboardProjects --title "我的影片"
cargo run -p storyboard-cli -- validate --project D:\StoryboardProjects\我的影片
cargo run -p storyboard-cli -- summary --project D:\StoryboardProjects\我的影片
```

## 專案資料夾

```text
My-Storyboard/
├─ storyboard.json
├─ project-notes.md
├─ 01_script/
├─ 02_visuals/
│  ├─ images/
│  └─ videos/
├─ 03_audio/
│  ├─ narration/
│  └─ sfx/
└─ 04_exports/
```

## 文件索引

- `docs/plan.md`：開發計畫與里程碑
- `docs/spec.md`：完整產品規格
- `docs/workflow.md`：使用與系統流程
- `docs/ui-design.md`：UI/UX、狀態與響應式設計
- `docs/architecture.md`：系統架構與模組界線
- `docs/data-model.md`：資料模型與 JSON 格式
- `docs/media-pipeline.md`：媒體匯入、預覽與輸出流程
- `docs/test.md`：測試策略與驗收矩陣
- `docs/release.md`：打包、版本與發行流程
- `docs/final.md`：交付狀態與限制

## 與 YouTube Project Manager 整合

Storyboard Editor 可獨立使用，也可掛載到單支影片專案中的 `storyboard/` 目錄。整合契約見 `docs/integration-ytpm.md`。

## 安全原則

- 不直接刪除使用者素材，預設移至專案內 `archive/`。
- 所有專案寫入採暫存檔再原子替換。
- 拒絕 `..`、絕對路徑注入及 Windows 非法名稱。
- 不在 JSON 中嵌入大型二進位資料，只保存相對路徑與中繼資料。

## 授權

MIT，詳見 `LICENSE`。
