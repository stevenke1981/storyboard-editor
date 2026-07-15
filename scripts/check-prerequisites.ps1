$ErrorActionPreference = "Continue"

function Check-Command($Name, $Args = @("--version")) {
  $Command = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $Command) {
    Write-Host "[缺少] $Name" -ForegroundColor Red
    return $false
  }
  Write-Host "[找到] $Name -> $($Command.Source)" -ForegroundColor Green
  & $Name @Args
  return $true
}

$Ok = $true
$Ok = (Check-Command "node") -and $Ok
$Ok = (Check-Command "npm") -and $Ok
$Ok = (Check-Command "rustc") -and $Ok
$Ok = (Check-Command "cargo") -and $Ok
$Ok = (Check-Command "ffmpeg") -and $Ok
$Ok = (Check-Command "ffprobe") -and $Ok

if (-not $Ok) {
  Write-Host "部分必要或建議工具尚未安裝，請閱讀 docs/installation.md。" -ForegroundColor Yellow
  exit 1
}
