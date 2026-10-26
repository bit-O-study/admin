# Run from an administrator PowerShell session on the managed server.
# Installs only the independent agent; does not stop/restart any project.
param([string]$ToolsRoot='C:\services\Bit-O\tools', [string]$NodePath='C:\Program Files\nodejs\node.exe')
$ErrorActionPreference='Stop'
$agentRoot=Join-Path $ToolsRoot 'server-control'
if (Get-ScheduledTask -TaskName 'BitO-Server-Control' -ErrorAction SilentlyContinue) {throw 'Agent task already exists; review the existing installation before updating.'}
if (-not (Test-Path -LiteralPath $NodePath)) {throw 'Node executable is missing'}
New-Item -ItemType Directory -Force -Path $agentRoot | Out-Null
& icacls $agentRoot /inheritance:r /grant:r '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) {throw 'Agent ACL configuration failed'}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'control-agent.cjs') -Destination $agentRoot
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'deployment-status.cjs') -Destination $agentRoot
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'control-ast.ps1') -Destination $agentRoot
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'server-inventory.json') -Destination $agentRoot
$tokenFile=Join-Path $agentRoot 'token.txt'
if (-not (Test-Path -LiteralPath $tokenFile)) {
  $bytes=New-Object byte[] 48
  $rng=[Security.Cryptography.RandomNumberGenerator]::Create()
  try {$rng.GetBytes($bytes)} finally {$rng.Dispose()}
  [IO.File]::WriteAllText($tokenFile,[Convert]::ToBase64String($bytes))
}
$config=@{port=4199;tokenFile=$tokenFile;inventoryFile=(Join-Path $agentRoot 'server-inventory.json');auditPath=(Join-Path $agentRoot 'audit.jsonl')}
$configPath=Join-Path $agentRoot 'control-agent.config.json'
[IO.File]::WriteAllText($configPath,($config | ConvertTo-Json))
$runtime='C:\services\Bit-O\admin\config\runtime.env'
if (-not (Test-Path -LiteralPath $runtime)) {throw 'Admin runtime configuration is missing'}
$existing=[IO.File]::ReadAllText($runtime)
if ($existing -match '(?m)^SERVER_CONTROL_(TOKEN|URL)=') {throw 'Admin server-control variables already exist; reconcile them manually.'}
$secret=[IO.File]::ReadAllText($tokenFile).Trim()
[IO.File]::AppendAllText($runtime,"`r`nSERVER_CONTROL_URL=http://127.0.0.1:4199`r`nSERVER_CONTROL_TOKEN=$secret`r`n")
$secret=$null
$action=New-ScheduledTaskAction -Execute $NodePath -Argument "`"$agentRoot\control-agent.cjs`" `"$configPath`"" -WorkingDirectory $agentRoot
$trigger=New-ScheduledTaskTrigger -AtStartup
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName 'BitO-Server-Control' -Action $action -Trigger $trigger -Settings $settings -User 'SYSTEM' -RunLevel Highest | Out-Null
Start-ScheduledTask -TaskName 'BitO-Server-Control'
Write-Output 'Agent installed on loopback port 4199. Project processes were not restarted. Deploy the admin UI and roll out the updated supervisor separately.'
