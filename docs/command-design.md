# CLI 命令設計

## 已有骨架

```text
storyboard-cli new --root <dir> --title <name>
storyboard-cli validate --project <dir> [--json]
storyboard-cli summary --project <dir>
```

## 後續命令

```text
storyboard-cli shot add --project <dir> --title <title> --duration 5s
storyboard-cli shot update --project <dir> --id <uuid> --set durationMs=6500
storyboard-cli shot move --project <dir> --id <uuid> --after <uuid>
storyboard-cli asset import --project <dir> --shot <uuid> --kind image --file <path>
storyboard-cli export --project <dir> --format csv --output <dir>
```

## Agent 輸出

- `--json` 時 stdout 只輸出 JSON。
- 診斷寫入 stderr。
- 成功 exit code 0、驗證錯誤 2、I/O 錯誤 3。
- 高風險操作需要 `--confirm`，且不可預設永久刪除。
