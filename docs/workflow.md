# 完整流程設計

## 新建專案流程

```mermaid
flowchart TD
  A[啟動 App] --> B{新建或開啟}
  B -->|新建| C[輸入名稱 比例 解析度 FPS]
  C --> D[選擇專案根目錄]
  D --> E[建立標準資料夾]
  E --> F[寫入 storyboard.json]
  F --> G[建立第一鏡]
  G --> H[進入編輯器]
  B -->|開啟| I[選擇 storyboard.json]
  I --> J[Schema 驗證與 migration]
  J --> H
```

## 單鏡製作流程

```mermaid
flowchart LR
  A[新增鏡頭] --> B[輸入文字與畫面描述]
  B --> C[設定時長]
  C --> D{視覺類型}
  D -->|圖片| E[匯入或指定圖片]
  D -->|影片| F[匯入影片與設定 In/Out]
  D -->|未定| G[保留文字分鏡卡]
  E --> H[設定旁白]
  F --> H
  G --> H
  H --> I[加入音效]
  I --> J[預覽]
  J --> K{節奏合格?}
  K -->|否| B
  K -->|是| L[標記完成]
```

## 預覽流程

1. 由所有 enabled shots 建立累積時間表。
2. 播放頭時間映射到鏡頭與鏡內 offset。
3. 載入視覺素材；若缺失則顯示 fallback。
4. 依 narration offset 排程旁白。
5. 排程鏡頭內音效。
6. 到達鏡頭末端時套用轉場並切換下一鏡。
7. 播放完成後停在最後一格。

## 素材匯入流程

1. 使用者選擇外部檔案。
2. App 偵測類型、大小、雜湊與 metadata。
3. 顯示「複製到專案」或「只連結」選項。
4. 預設複製到對應資料夾，避免外部路徑失效。
5. 同名檔使用 `name_001.ext`，不直接覆蓋。
6. JSON 僅保存相對路徑。
7. 產生縮圖或 waveform cache，cache 可安全重建。

## 自動儲存與恢復

```mermaid
sequenceDiagram
  participant UI
  participant Store
  participant Core
  participant FS
  UI->>Store: 修改鏡頭
  Store->>Store: dirty=true / debounce 1s
  Store->>Core: validate(project)
  Core-->>Store: valid
  Store->>FS: write temp
  FS->>FS: fsync + atomic rename
  FS-->>Store: success
  Store-->>UI: 已儲存
```

## 匯出流程

1. Validate project。
2. 掃描素材存在性與時長衝突。
3. 顯示匯出前檢查報告。
4. 使用者選擇輸出類型與資料夾。
5. 產生新檔，不自動覆蓋。
6. 寫入 export manifest，記錄版本與來源專案 hash。
