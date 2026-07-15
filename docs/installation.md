# 安裝與開發環境

## Windows 10 / 11

1. 安裝 Node.js 22 LTS 或符合 Vite 要求的版本。
2. 安裝 Rust stable 與 MSVC toolchain。
3. 安裝 Microsoft C++ Build Tools 與 Windows SDK。
4. 安裝 WebView2 Runtime；新版本 Windows 通常已具備。
5. 在專案根目錄執行：

```powershell
npm install
npm run dev
```

桌面模式：

```powershell
npm run tauri dev
```

## Linux

安裝 Rust、Node.js、WebKitGTK 與 Tauri 所需系統套件，再執行相同 npm 指令。實際套件名稱依發行版而異，請依 Tauri 2 官方 prerequisites 調整。

## macOS

安裝 Xcode Command Line Tools、Rust 與 Node.js。正式發行另需 Apple Developer 簽章與 notarization。

## FFmpeg

MVP UI 不要求 FFmpeg 才能啟動；媒體探測與正式輸出功能開發時需安裝 `ffmpeg` 與 `ffprobe`，並由設定頁確認版本與路徑。
