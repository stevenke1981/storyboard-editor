$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
npm run build
cargo test --workspace
npm run tauri build
