$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
cargo run -p storyboard-cli -- validate --project "$PWD/sample-project"
