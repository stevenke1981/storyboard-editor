# 開發計畫

## 產品目標

建立可獨立運行的桌面分鏡管理工具，讓影片創作者在不進入剪輯軟體前，先完成每一鏡的內容、時長與素材編排。

## MVP 範圍

1. 建立、開啟、儲存與另存專案。
2. 新增、複製、排序、封存鏡頭。
3. 編輯鏡頭文字、畫面描述、時長與轉場。
4. 指定圖片或影片素材。
5. 指定旁白文字與旁白音檔。
6. 新增多個音效，設定起始時間與音量。
7. 單鏡預覽與專案連續預覽。
8. 依鏡頭時長呈現時間軸。
9. JSON Schema 驗證與自動備份。
10. 匯出 JSON、CSV、Markdown shot list 與 FFmpeg manifest。

## 非 MVP

- 完整非線性剪輯器。
- 多軌逐幀精剪。
- 內建大型 AI 模型。
- YouTube 自動上傳。
- 多人即時協作。

## 里程碑

### M0：骨架與契約

- Workspace、Tauri、React、核心 crate、CLI。
- JSON Schema 與 sample project。
- CI 與基本測試。

### M1：鏡頭編輯

- 鏡頭 CRUD、排序、時長計算。
- Inspector 完整欄位。
- localStorage demo 與 JSON save/load。

### M2：媒體工作流

- 檔案選擇、專案內複製、縮圖與 metadata。
- ffprobe 取得影片與音訊長度。
- 播放器與音量混合預覽。

### M3：匯出與整合

- CSV、Markdown、EDL-like JSON。
- FFmpeg concat/filter_complex 草稿。
- YouTube Project Manager adapter。

### M4：可用性與發行

- Undo/Redo、自動儲存、崩潰恢復。
- 快捷鍵、可及性、國際化。
- Windows MSI/NSIS、macOS DMG、Linux AppImage/deb。

## 驗收原則

- 100 鏡專案在一般桌機操作無明顯卡頓。
- JSON 中斷寫入不破壞上一個可讀版本。
- 所有鏡頭時長加總與時間軸總長一致。
- 素材缺失時顯示警告，不使專案無法開啟。
- 使用者可直接用文字編輯器閱讀與修改專案 JSON。
