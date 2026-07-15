# 媒體處理流程

## 圖片

- 支援 PNG、JPEG、WebP、AVIF（依平台 decoder）。
- 匯入後建立最大 512 px 的縮圖 cache。
- 保留原檔，不在背景自動重新壓縮。
- fit：contain、cover、stretch。

## 影片

- 支援格式由系統 WebView 與 FFmpeg 能力共同決定。
- ffprobe 取得 duration、fps、尺寸、codec、audio streams。
- 每鏡可設定 source in/out。
- 若素材不足，提供：定格末幀、循環、縮短鏡頭、替換素材。

## 旁白

- 旁白文字與音檔可分開存在。
- 音檔匯入後探測 duration、sample rate、channels。
- 比較 `offset + audio duration` 與 shot duration，顯示超時。
- 不直接改寫原檔；normalize 或降噪產生新版本。

## 音效

- 每鏡多音效。
- 音效相對於鏡頭開始時間排程。
- MVP 超出鏡頭範圍自動截斷預覽；輸出前提示。
- 正式版 Web Audio graph：source → gain → fade automation → master。

## FFmpeg 輸出策略

1. 先產生 `ffmpeg-plan.json`。
2. 每鏡建立視覺 segment。
3. 圖片使用 loop + scale/pad/crop。
4. 影片使用 trim/setpts。
5. 旁白與音效使用 adelay、atrim、volume、afade。
6. 各鏡混音後 concat。
7. 預設輸出到新檔，禁止靜默覆蓋。

MVP 僅交付計畫生成契約，不宣稱完整 renderer 已完成。
