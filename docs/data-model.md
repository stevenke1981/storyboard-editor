# 資料模型

## 真實來源

`storyboard.json` 是專案真實來源。SQLite 只能保存最近專案、搜尋索引、縮圖狀態等可重建資料。

## 時間單位

所有時間使用整數毫秒，避免浮點累積誤差。顯示層可格式化成 `HH:MM:SS.mmm`。

## ID

- project、shot、sound effect 使用 UUID v4。
- 重新排序不改變 shot ID。
- 複製鏡頭必須建立新 ID。

## 相對路徑

允許：

```text
02_visuals/images/scene-01.png
03_audio/narration/shot-01.wav
```

拒絕：

```text
C:\Users\name\Desktop\file.png
../outside/file.png
\\server\share\file.png
```

如使用者選擇「外部連結」，應放在 local-only sidecar，不寫入可攜專案主檔。

## Schema 版本

- `schemaVersion` 為整數。
- loader 先讀版本，再逐版 migration。
- migration 之前建立備份。
- 未知欄位應盡可能保留。

完整 JSON Schema 位於 `schemas/storyboard-project.schema.json`。
