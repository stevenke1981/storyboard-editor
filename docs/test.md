# 測試策略

## 單元測試

### TypeScript

- 時間格式化與總時長計算。
- reducer 新增、複製、修改、排序、封存。
- 鏡頭時間映射。
- 旁白超時與素材警告。

### Rust

- 安全檔名。
- 路徑穿越拒絕。
- project validation。
- atomic save/load roundtrip。
- 建立標準專案資料夾。

## 整合測試

- React 呼叫 Tauri save/load command。
- 匯入素材後 JSON 使用相對路徑。
- 缺失素材仍能開啟專案。
- schema migration 前建立備份。

## E2E 測試案例

1. 新建專案。
2. 新增三鏡。
3. 分別設定圖片、影片、純文字卡。
4. 設定不同時長。
5. 加入旁白文字與音效。
6. 調整順序。
7. 重新開啟專案。
8. 確認總長度、順序與欄位一致。
9. 匯出 CSV 與 Markdown。

## 驗收矩陣

| 功能 | 正常 | 邊界 | 失敗恢復 |
|---|---|---|---|
| 時長 | 1–600 秒 | 100 ms、1 小時 | 非數字不寫入 |
| 圖片 | 存在檔案 | 超大圖、中文檔名 | 遺失時重新連結 |
| 影片 | 合法 in/out | 素材短於鏡頭 | probe 失敗仍可保存 |
| 旁白 | 長度小於鏡頭 | 完全相等 | 超時警告 |
| 音效 | 多音效混合 | 負 offset 拒絕 | 缺檔不崩潰 |
| 儲存 | 正常寫入 | 大型專案 | temp 檔失敗保留舊檔 |

## 執行

```powershell
npm test
npm run typecheck
cargo test --workspace
```
