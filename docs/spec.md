# 產品規格

## 使用者故事

- 作為影片創作者，我要為每一鏡設定內容與時長，以便先確認節奏。
- 作為 AI 影片製作者，我要保存每鏡提示詞與採用素材，以便重生成。
- 作為旁白製作者，我要知道每段旁白對應哪個鏡頭與可用時間。
- 作為剪輯師，我要匯出 shot list 與素材路徑，以便快速組裝時間軸。
- 作為 Agent，我要透過 JSON Schema 與 CLI 安全建立或修改分鏡。

## 專案欄位

- id、名稱、描述、影片比例、解析度、fps。
- 語言、預設轉場、建立與修改時間。
- 鏡頭陣列、標籤、輸出設定。

## 鏡頭欄位

### 基本

- id：穩定 UUID。
- order：顯示順序。
- title：鏡頭短標題。
- scriptText：畫面中要表達的文字或劇情。
- visualDescription：畫面描述。
- durationMs：鏡頭時長，最小 100 ms。
- enabled：是否參與輸出。
- notes：製作備註。

### 圖片／影片

- visual.kind：none、image、video。
- visual.path：專案相對路徑。
- visual.prompt：生成提示詞。
- visual.fit：contain、cover、stretch。
- visual.inMs/outMs：影片素材的取用區段。
- visual.posterPath：影片海報圖。

### 旁白

- narration.text：旁白文字。
- narration.path：音檔相對路徑。
- narration.voice：角色或模型名稱。
- narration.gainDb：音量。
- narration.offsetMs：延遲進場。

### 音效

每鏡可有多個音效：

- id、name、path。
- startMs、trimInMs、trimOutMs。
- gainDb、loop、fadeInMs、fadeOutMs。

### 轉場

- type：cut、fade、dissolve、wipe、custom。
- durationMs。

## 功能規格

### 鏡頭管理

- 新增鏡頭插入目前鏡頭後方。
- 複製時產生新 UUID，素材路徑可共用。
- 排序支援按鈕、鍵盤與拖曳。
- 封存鏡頭保留原始內容與順序資訊。
- 批次修改可設定時長、轉場、比例適配。

### 時間軸

- 鏡頭寬度與 durationMs 成比例，但設最小可點擊寬度。
- 顯示鏡頭序號、標題、視覺類型與時長。
- 播放頭可定位到鏡頭與鏡內時間。
- 縮放範圍 25%–400%。

### 預覽

- 圖片依 fit 呈現。
- 影片依 in/out 區段播放。
- 無素材時顯示文字分鏡卡。
- 旁白和音效可個別靜音。
- MVP 可先做單鏡模擬；正式版用 Web Audio 或 Rust/FFmpeg 混音。

### 儲存

- 內容變更 1 秒後自動儲存。
- 儲存前寫入 `.storyboard.json.tmp`。
- 成功 fsync 後替換正式檔。
- 保留最近 10 個 `.backups/` 版本。
- Schema migration 必須可重跑且不可破壞未知欄位。

### 匯出

- storyboard.json：完整資料。
- shot-list.csv：鏡號、起訖時間、時長、文字與素材。
- storyboard.md：可供審稿的分鏡表。
- ffmpeg-plan.json：媒體組裝計畫，不直接執行危險覆寫。
- subtitles.srt：依鏡頭或旁白切段產生草稿。

## 錯誤狀態

- 素材遺失：標示紅色警告，允許重新連結。
- 影片短於鏡頭：警告並提供循環、定格或縮短鏡頭。
- 旁白長於鏡頭：顯示超時毫秒。
- 音效超出鏡頭：允許截斷或跨鏡，MVP 預設截斷。
- JSON 格式錯誤：只讀開啟並提供備份恢復。
