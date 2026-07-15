# YouTube Project Manager 整合

## 建議目錄

```text
YouTube-Project/
├─ project.json
├─ 02_script/
├─ storyboard/
│  ├─ storyboard.json
│  ├─ 02_visuals/
│  ├─ 03_audio/
│  └─ 04_exports/
├─ 04_images/
├─ 05_video/
└─ 06_subtitles/
```

## 整合方式

- YTPM 建立影片專案時可選擇同時建立 storyboard。
- Storyboard Editor 接收專案根路徑與 `storyboard/storyboard.json`。
- 已存在的共用素材可透過 import adapter 複製或建立 local link。
- Storyboard 匯出的旁白文字可回寫到腳本或字幕草稿。
- YTPM 只讀取 schema 定義欄位，不直接解析 UI state。

## IPC/CLI 契約

```text
storyboard-cli new --root <video-project>/storyboard --title <title>
storyboard-cli validate --project <...>/storyboard
storyboard-cli export --project <...> --format shot-list-csv
```
