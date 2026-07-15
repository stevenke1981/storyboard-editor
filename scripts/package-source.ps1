param([string]$SourceRoot,[string]$OutputPath)
$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$SourceRoot = if($SourceRoot){$SourceRoot}else{$Root}; $OutputPath = if($OutputPath){$OutputPath}else{Join-Path (Split-Path $Root -Parent) "Storyboard-Editor-Source.zip"}
$Root=[IO.Path]::GetFullPath($SourceRoot);$Destination=[IO.Path]::GetFullPath($OutputPath)

# Fail closed: package only source/config/docs; never operational state or credentials.
$AllowedTop = @("src", "src-tauri", "crates", "schemas", "scripts", "docs", "tests", "sample-project", "templates", ".github")
$AllowedFiles = @("AGENTS.md", "CHANGELOG.md", "CONTRIBUTING.md", "LICENSE", "MANIFEST.md", "README.md", "Cargo.toml", "Cargo.lock", "package.json", "package-lock.json", "tsconfig.json", "tsconfig.app.json", "tsconfig.node.json", "vite.config.ts", "playwright.config.ts", "index.html", "VERSION", ".gitignore")
$SensitiveExtension = @(".env", ".pem", ".pfx", ".p12", ".key", ".crt", ".cer", ".der", ".csr", ".p7b", ".jks")
$SensitiveName = @(".codex", ".codebase-memory", "node_modules", "target", "dist", ".git")

$Paths = [System.Collections.Generic.List[string]]::new()
foreach ($name in $AllowedFiles) { $path = Join-Path $Root $name; if (Test-Path -LiteralPath $path -PathType Leaf) { $Paths.Add($path) } }
foreach ($top in $AllowedTop) {
  $base = Join-Path $Root $top
  if (!(Test-Path -LiteralPath $base -PathType Container)) { continue }
  $foundSensitive = Get-ChildItem -LiteralPath $base -Recurse -File -Force | Where-Object { $_.Extension.ToLowerInvariant() -in $SensitiveExtension }
  if ($foundSensitive) { throw "Sensitive file detected; refusing to package" }
  Get-ChildItem -LiteralPath $base -Recurse -File -Force | Where-Object {
    $_.Name -notin $SensitiveName -and $_.Extension.ToLowerInvariant() -notin $SensitiveExtension -and $_.FullName -notmatch "\\(\.codex|\.codebase-memory|node_modules|target|dist|\.git)(\\|$)"
  } | ForEach-Object { $Paths.Add($_.FullName) }
}
if ($Paths.Count -eq 0) { throw "No safe source files found" }
$bad = $Paths | Where-Object { $_ -match "\.env($|\.)|\.(pem|pfx|p12|key|jks)$" }
if ($bad) { throw "Sensitive file detected; refusing to package" }
$secretPattern = 'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|' + '(?i)password' + '\s*='
foreach ($file in $Paths | Where-Object { $_ -match '\.(json|ya?ml|toml|ps1|psm1|ts|tsx|rs|md|txt|xml|conf)$' }) {
  $content = Get-Content -LiteralPath $file -Raw -ErrorAction Stop
  if ($content -match $secretPattern) { throw "Suspected secret content detected; refusing to package" }
}
if (Test-Path -LiteralPath $Destination) { Remove-Item -LiteralPath $Destination -Force }
Compress-Archive -LiteralPath $Paths.ToArray() -DestinationPath $Destination -CompressionLevel Optimal
Write-Output $Destination
