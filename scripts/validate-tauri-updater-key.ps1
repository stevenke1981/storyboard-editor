param([Parameter(Mandatory)][string]$Key)
$ErrorActionPreference='Stop'
$k=$Key.Trim();if($k -match '^-----BEGIN' -or $k -match '^__'){throw 'invalid tauri key format'}
try{$outer=[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($k))}catch{throw 'invalid tauri key encoding'}
$lines=$outer -split "`n"|%{$_.TrimEnd("`r")};if($lines.Count -ne 3 -or $lines[2] -ne '' -or $lines[0] -notmatch '^untrusted comment: minisign public key: [0-9A-F]{16}$'){throw 'invalid minisign header'}
try{$inner=[Convert]::FromBase64String($lines[1])}catch{throw 'invalid inner key'};if($inner.Length -ne 42 -or $inner[0] -ne 0x45 -or $inner[1] -ne 0x64){throw 'invalid minisign structure'}
$commentId=$lines[0].Substring($lines[0].Length-16).ToUpperInvariant();$innerId=(($inner[9..2]|%{$_.ToString('X2')})-join '');if($commentId -ne $innerId){throw 'minisign key id mismatch'};Write-Output 'tauri-key: valid'
