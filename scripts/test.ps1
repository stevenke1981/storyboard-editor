$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
npm run typecheck
npm test
cargo test --workspace
Write-Host "All available checks passed." -ForegroundColor Green
