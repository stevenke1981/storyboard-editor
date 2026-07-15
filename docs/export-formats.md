# 匯出格式

## shot-list.csv

欄位：`order,title,start_ms,end_ms,duration_ms,script_text,visual_kind,visual_path,narration_path,sfx_count,status`。

## storyboard.md

每鏡輸出標題、時間範圍、文字、畫面描述、視覺素材、旁白、音效與備註，適合審稿。

## subtitles.srt

MVP 以旁白文字或 scriptText 建立一鏡一段。正式版可依標點與 ASR 字級時間再次切分。

## ffmpeg-plan.json

描述輸入、鏡頭 segment、視覺 filter、音訊排程與輸出設定。計畫檔與 renderer 分離，便於先檢查再執行。

## interchange.json

保持核心欄位穩定，供 YouTube Project Manager、CapCut adapter、DaVinci adapter 或自訂 Agent 使用。
