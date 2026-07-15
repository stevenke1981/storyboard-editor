# 系統架構

## 分層

```text
React UI
  ├─ feature state / commands
  ├─ preview scheduling
  └─ Tauri adapter
        ↓
Tauri commands
        ↓
storyboard-core
  ├─ domain models
  ├─ validation
  ├─ project I/O
  ├─ safe paths
  └─ export planning
        ↓
Filesystem / ffprobe / optional SQLite index
```

## Workspace

- `src/`：React UI，瀏覽器模式可使用 localStorage demo。
- `src-tauri/`：桌面命令與 OS 整合。
- `crates/storyboard-core/`：不依賴 UI 的領域核心。
- `crates/storyboard-cli/`：Agent 與自動化入口。
- `schemas/`：資料交換契約。

## 邊界原則

- UI 不直接組合磁碟路徑。
- Tauri command 只做參數轉換與權限邊界。
- Core 不依賴 Tauri。
- FFmpeg/ffprobe 以 adapter 隔離，測試時可替換。
- cache、縮圖與 waveform 不屬於真實資料，可刪除重建。

## 狀態管理

MVP 使用 React reducer：

- `project`：目前專案。
- `selectedShotId`：選取鏡頭。
- `playback`：播放狀態與時間。
- `history`：undo/redo snapshots 或 command log。
- `saveState`：clean、dirty、saving、error。

正式版可導入 Zustand，但不應讓狀態庫滲入 core contract。

## 效能

- Shot List 使用 memo；超過 300 鏡改為 virtualization。
- 影片不預載完整檔，只載 metadata 與目前鏡頭。
- 縮圖生成排入背景 queue。
- 大型 JSON 寫入採 streaming 或 worker，MVP 一般專案仍可直接 serialize。

## 擴充點

- `MediaProbe`：ffprobe、MediaInfo 或平台 API。
- `NarrationGenerator`：Qwen3-TTS、VoxCPM、Edge TTS。
- `Transcriber`：whisper.cpp。
- `ImageGenerator`／`VideoGenerator`：外部服務或本機模型。
- `Exporter`：CapCut、DaVinci Resolve、Premiere、FFmpeg。
