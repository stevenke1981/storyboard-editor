# 安全與資料保護

- 所有使用者輸入檔名先正規化。
- Windows 保留名稱 CON、PRN、AUX、NUL、COM1–9、LPT1–9 不可使用。
- canonicalize 後確認目的路徑仍位於專案根目錄。
- Tauri capability 採最小權限，不允許任意 shell。
- FFmpeg 命令使用 argument array，不拼接 shell string。
- 外部 URL 開啟必須限制 http/https。
- 專案 JSON 不保存 API key、token 或敏感設定。
- 永久刪除需二次確認並列出檔案數與大小。
