# 發行流程

## 版本

採 Semantic Versioning：

- MAJOR：schema 或使用流程不相容。
- MINOR：向下相容功能。
- PATCH：修正與內部改善。

## 建置前

1. 更新 CHANGELOG。
2. 通過 npm 與 cargo 測試。
3. 驗證 sample project。
4. 執行 release build。
5. 在乾淨 Windows VM smoke test。
6. 產生 SHA-256。

## 簽章與更新安全邊界

Workflow 僅上傳已驗證的 installer/updater artifact、官方 `.sig`、`latest.json` 與額外 `update-metadata.json`；`.sig` 不是唯一輸出。

- Windows NSIS/MSI：workflow 先執行 `npm run tauri build -- --bundles nsis`，確認 installer 存在後才由 CI secret 注入私鑰簽章；私鑰禁止寫入 repo。
- macOS：需 Apple Developer ID 與 notarization 憑證（`APPLE_*` secrets）。
- 未提供憑證時只能產生未簽章本機 artifact；workflow 會在簽章/驗證前停止，不會上傳。
- 發布前以 SHA-256 與簽章工具驗證，並在乾淨 VM 測試更新回滾。
- `scripts/release-preflight.ps1 -Mode release` 會 fail-closed 檢查固定 HTTPS endpoint、私鑰/公鑰/metadata、artifact SHA-256、RSA 簽章、版本遞增與禁止降級；`.github/workflows/release.yml` 會在簽章驗證後才上傳 artifact。
- `scripts/package-source.ps1` 使用 allowlist 並拒絕憑證、環境檔與 operational artifacts；可用 `tar -tf` 檢查封裝內容。
- Tauri updater plugin 已註冊，設定只接受固定 HTTPS endpoint 與 build-time 注入的 pinned Ed25519 public key；placeholder 未替換時不得作正式發行。
- workflow 在 Tauri bundler 前注入 `TAURI_UPDATER_PUBLIC_KEY`、`TAURI_SIGNING_PRIVATE_KEY(_PASSWORD)` 並拒絕 placeholder；每個可安裝／更新 artifact 必須有對應官方 `.sig`，但 `.sig` 不是唯一上傳檔。

## 平台輸出

- Windows：NSIS 或 MSI。
- macOS：app + dmg，正式發布需簽章與 notarization。
- Linux：AppImage、deb。

## Schema 發行

任何 schema 變更都要：

- 更新 JSON Schema。
- 新增 migration。
- 新增舊版 fixture 測試。
- 更新整合契約。
