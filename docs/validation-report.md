# Validation Report

日期：2026-07-15

## 已執行

| 檢查 | 結果 | 說明 |
|---|---|---|
| JSON parse | 通過 | 9 個 JSON 檔案均可解析 |
| JSON Schema | 通過 | sample project 符合 Draft 2020-12 schema |
| SVG XML | 通過 | UI wireframe 可解析 |
| TypeScript syntax transpile | 通過 | 15 個 TS/TSX 檔案無轉譯語法診斷 |
| npm install | 未完成 | 目前執行環境下載逾時，未保留不完整 node_modules |
| npm build/test | 未執行 | 依賴未下載，因此不宣稱通過 |
| Rust build/test | 未執行 | 目前執行環境沒有 cargo 與 rustc |

## 建議接手後第一輪驗證

```powershell
npm install
npm run typecheck
npm test
npm run build
cargo fmt --all -- --check
cargo test -p storyboard-core -p storyboard-cli
npm run tauri dev
```

## 人工 UI smoke test

1. 啟動 Web demo。
2. 新增、複製、上下移動與封存鏡頭。
3. 修改時長並確認時間軸比例和總時長改變。
4. 設定 image/video 類型、素材相對路徑與提示詞。
5. 加入旁白與兩個音效。
6. 播放跨越三鏡，確認選取鏡頭跟隨播放頭。
7. 重新載入，確認 localStorage demo 保留資料。
8. 匯出 JSON，使用 schema 再次驗證。
