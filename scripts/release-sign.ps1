[CmdletBinding()]
param([Parameter(Mandatory)][string]$Artifact, [Parameter(Mandatory)][string]$PrivateKeyPath, [Parameter(Mandatory)][string]$Version, [string]$Output = "release-artifacts/update-metadata.json")
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$artifactPath = [IO.Path]::GetFullPath((Join-Path $root $Artifact))
$releaseRoot = [IO.Path]::GetFullPath((Join-Path $root "release-artifacts"))
if (!$artifactPath.StartsWith($releaseRoot + [IO.Path]::DirectorySeparatorChar) -or !(Test-Path -LiteralPath $artifactPath -PathType Leaf)) { throw "artifact must be inside release-artifacts" }
$rsa = [Security.Cryptography.RSA]::Create()
try {
  $rsa.ImportFromPem((Get-Content -LiteralPath $PrivateKeyPath -Raw))
  $hash = (Get-FileHash -LiteralPath $artifactPath -Algorithm SHA256).Hash.ToUpperInvariant()
  $signature = [Convert]::ToBase64String($rsa.SignData([Text.Encoding]::UTF8.GetBytes($hash), [Security.Cryptography.HashAlgorithmName]::SHA256, [Security.Cryptography.RSASignaturePadding]::Pkcs1))
} finally { $rsa.Dispose() }
$metadata = [ordered]@{ version = $Version; artifactPath = $artifactPath.Substring($root.Length + 1); sha256 = $hash; signature = $signature; allowDowngrade = $false }
$outputPath = Join-Path $root $Output; New-Item -ItemType Directory -Force (Split-Path $outputPath) | Out-Null; $metadata | ConvertTo-Json | Set-Content -LiteralPath $outputPath -NoNewline
Write-Output $outputPath
