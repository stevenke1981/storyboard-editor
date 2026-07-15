[CmdletBinding()]
param(
  [ValidateSet("dev", "release")][string]$Mode = "dev",
  [string]$UpdateEndpoint = $env:STORYBOARD_UPDATE_ENDPOINT,
  [string]$SigningKeyPath = $env:TAURI_SIGNING_PRIVATE_KEY,
  [string]$PublicKeyPath = $env:TAURI_SIGNING_PUBLIC_KEY,
  [string]$MetadataPath = $env:STORYBOARD_UPDATE_METADATA
  ,[string]$WorkspaceRoot = (Split-Path $PSScriptRoot -Parent)
  ,[string]$PinnedPublicKeyPath
)
$ErrorActionPreference = "Stop"
if ($Mode -eq "dev") { Write-Output "dev preflight: signing gate skipped"; exit 0 }
if ([string]::IsNullOrWhiteSpace($UpdateEndpoint)) { throw "release blocked: update endpoint is required" }
$uri = $null
if (![Uri]::TryCreate($UpdateEndpoint, [UriKind]::Absolute, [ref]$uri) -or $uri.Scheme -ne "https" -or $uri.Host -notin @("updates.storyboard-editor.example")) { throw "release blocked: endpoint must be fixed HTTPS allowlist" }
foreach ($path in @($SigningKeyPath, $PublicKeyPath, $MetadataPath)) { if ([string]::IsNullOrWhiteSpace($path) -or !(Test-Path -LiteralPath $path -PathType Leaf)) { throw "release blocked: signing key, public key, and metadata are all required" } }
$metadata = Get-Content -LiteralPath $MetadataPath -Raw | ConvertFrom-Json
if (!$metadata.signature -or !$metadata.version -or !$metadata.sha256 -or !$metadata.artifactPath) { throw "release blocked: metadata requires signature, version, sha256, artifactPath" }
if ($metadata.allowDowngrade -eq $true) { throw "release blocked: downgrade is not permitted" }
if ($metadata.sha256 -notmatch '^[0-9a-fA-F]{64}$') { throw "release blocked: artifact hash invalid" }
$workspace = [IO.Path]::GetFullPath($WorkspaceRoot)
$relativeArtifact = [string]$metadata.artifactPath
if ([IO.Path]::IsPathRooted($relativeArtifact) -or $relativeArtifact -match '(^|[\\/])\.\.([\\/]|$)') { throw "release blocked: artifact path must be relative and traversal-free" }
$artifact = [IO.Path]::GetFullPath((Join-Path $workspace $relativeArtifact))
$releaseRoot = [IO.Path]::GetFullPath((Join-Path $workspace "release-artifacts"))
if (!$artifact.StartsWith($releaseRoot + [IO.Path]::DirectorySeparatorChar) -or !(Test-Path -LiteralPath $artifact -PathType Leaf)) { throw "release blocked: artifact must be inside release-artifacts" }
$actualHash = (Get-FileHash -LiteralPath $artifact -Algorithm SHA256).Hash
if ($actualHash -ne $metadata.sha256.ToUpperInvariant()) { throw "release blocked: artifact hash mismatch" }
if ($metadata.signature -notmatch '^[A-Za-z0-9+/=]{32,}$' -or !(Test-Path -LiteralPath $PublicKeyPath -PathType Leaf)) { throw "release blocked: signature/public key is missing or malformed" }
$current = Get-Content (Join-Path $workspace "VERSION") -Raw
 $packageVersion = ((Get-Content (Join-Path $workspace "package.json") -Raw | ConvertFrom-Json).version)
$tauriVersion = ((Get-Content (Join-Path $workspace "src-tauri/tauri.conf.json") -Raw | ConvertFrom-Json).version)
if ($current.Trim() -ne $packageVersion -or $current.Trim() -ne $tauriVersion) { throw "release blocked: VERSION/package/tauri versions disagree" }
$pinnedKey = ((Get-Content (Join-Path $workspace "src-tauri/tauri.conf.json") -Raw | ConvertFrom-Json).plugins.updater.pubkey)
if ([string]::IsNullOrWhiteSpace($PinnedPublicKeyPath) -and ([string]::IsNullOrWhiteSpace($pinnedKey) -or $pinnedKey -match '^__.*__$')) { throw "release blocked: updater public key placeholder is not permitted" }
if ($PinnedPublicKeyPath) { if (!(Test-Path $PinnedPublicKeyPath)) { throw "release blocked: pinned key missing" }; $configKey = ($pinnedKey -replace '\s',''); $fileKey = ((Get-Content $PinnedPublicKeyPath -Raw) -replace '\s',''); if ($configKey -match '^__' -or $configKey -ne $fileKey) { throw "release blocked: pinned key mismatch" } }
try { if ([Version]$metadata.version -le [Version]$current.Trim()) { throw "release blocked: version must be greater than current version" } } catch { if ($_.Exception.Message.StartsWith("release blocked")) { throw }; throw "release blocked: invalid semantic version" }
$rsa = [Security.Cryptography.RSA]::Create()
try {
  $rsa.ImportFromPem((Get-Content -LiteralPath $PublicKeyPath -Raw))
  $signatureBytes = [Convert]::FromBase64String($metadata.signature)
  $hashBytes = [Text.Encoding]::UTF8.GetBytes($metadata.sha256.ToUpperInvariant())
  if (!$rsa.VerifyData($hashBytes, $signatureBytes, [Security.Cryptography.HashAlgorithmName]::SHA256, [Security.Cryptography.RSASignaturePadding]::Pkcs1)) { throw "release blocked: cryptographic signature verification failed" }
} finally { $rsa.Dispose() }
Write-Output "release preflight passed (artifact hash and RSA signature verified)"
