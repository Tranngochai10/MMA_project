$ErrorActionPreference = 'Stop'
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw 'Open PowerShell as Administrator, then run this script again. No database changes were made.'
}
$projectPath = Split-Path -Parent $PSScriptRoot
$configPath = 'C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg'
$dataPath = 'C:\Program Files\MongoDB\Server\8.2\data'
$config = Get-Content -LiteralPath $configPath -Raw
if ($config -notmatch 'bindIp:\s*127\.0\.0\.1' -or $config -notmatch '(?m)^#replication:\s*$' -or $config -match '(?m)^replication:') {
  throw 'MongoDB configuration differs from the reviewed local configuration. No changes were made.'
}
$backupPath = Join-Path $projectPath ('.runtime\mongo-backup-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $backupPath | Out-Null
Copy-Item -LiteralPath $configPath -Destination (Join-Path $backupPath 'mongod.cfg')
Stop-Service -Name MongoDB
try {
  # Copy only after a clean shutdown, preserving the complete database as a cold backup.
  Copy-Item -LiteralPath $dataPath -Destination (Join-Path $backupPath 'data') -Recurse
  $updated = [regex]::Replace($config, '(?m)^#replication:\s*$', "replication:`r`n  replSetName: rs0")
  [IO.File]::WriteAllText($configPath, $updated, (New-Object Text.UTF8Encoding($false)))
  Start-Service -Name MongoDB
  Push-Location $projectPath
  try {
    & node (Join-Path $PSScriptRoot 'init-local-replica.js')
    if ($LASTEXITCODE -ne 0) { throw 'Replica set initialization failed.' }
  } finally { Pop-Location }
  Write-Output "Replica set ready. Cold backup retained at $backupPath. Restart the backend."
} catch {
  $failure = $_
  Stop-Service -Name MongoDB -ErrorAction SilentlyContinue
  Copy-Item -LiteralPath (Join-Path $backupPath 'mongod.cfg') -Destination $configPath -Force
  Start-Service -Name MongoDB
  throw $failure
}
