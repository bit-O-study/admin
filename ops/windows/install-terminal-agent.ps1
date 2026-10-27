# 서버 터미널 에이전트 설치 (2026-10-27). 관리자 PowerShell(서버 계정 pc)에서 실행.
# 운영 앱은 건드리지 않는다. Claude Code·Codex CLI 를 npm 전역으로 깔고, 에이전트를 예약 작업으로 띄운다.
# 사용자 선택: 서버 전체 권한 — 작업은 현재 계정, 가장 높은 권한(S4U, 암호 저장 없음)으로 돈다.
param([string]$ToolsRoot='C:\services\Bit-O\tools', [string]$NodeDir='C:\Program Files\nodejs')
$ErrorActionPreference='Stop'
$root=Join-Path $ToolsRoot 'server-terminal'
$node=Join-Path $NodeDir 'node.exe'; $npm=Join-Path $NodeDir 'npm.cmd'
New-Item -ItemType Directory -Force -Path $root | Out-Null
# 설정 파일에 service_role 키가 들어간다 — SYSTEM·Administrators·현재 계정만 읽는다.
& icacls $root /inheritance:r /grant:r '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' "$($env:USERNAME):(OI)(CI)F" | Out-Null
if ($LASTEXITCODE -ne 0) {throw 'ACL 설정 실패'}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'terminal-agent.cjs') -Destination $root -Force
Push-Location $root
try {
  if (-not (Test-Path 'package.json')) { [IO.File]::WriteAllText((Join-Path $root 'package.json'),'{"private":true}') }
  & $npm install --no-audit --no-fund '@lydell/node-pty@1.1.0' | Out-Null
  if ($LASTEXITCODE -ne 0) {throw 'node-pty 설치 실패'}
} finally { Pop-Location }
& $npm install -g --no-audit --no-fund '@anthropic-ai/claude-code' '@openai/codex' | Out-Null
if ($LASTEXITCODE -ne 0) {throw 'Claude Code·Codex 설치 실패'}
$globalBin=(& $npm prefix -g).Trim()
# 관리 콘솔 설정에서 HEALTH Supabase 주소·service_role 키를 그대로 가져온다(화면에 찍지 않는다).
$runtime=@{}
foreach($line in [IO.File]::ReadAllLines('C:\services\Bit-O\admin\config\runtime.env')){ if($line -match '^(HEALTH_SUPABASE_URL|HEALTH_SUPABASE_SERVICE_ROLE_KEY|SERVER_CONTROL_HOST_ID)=(.*)$'){ $runtime[$matches[1]]=$matches[2].Trim().Trim('"',"'") } }
if (-not $runtime.HEALTH_SUPABASE_URL -or -not $runtime.HEALTH_SUPABASE_SERVICE_ROLE_KEY) {throw '관리 콘솔 설정에 HEALTH Supabase 값이 없습니다'}
$hostId = if ($runtime.SERVER_CONTROL_HOST_ID) { $runtime.SERVER_CONTROL_HOST_ID } else { 'primary' }
$workdir=Join-Path $env:USERPROFILE 'agent-workspace'
$config=@{url=$runtime.HEALTH_SUPABASE_URL;key=$runtime.HEALTH_SUPABASE_SERVICE_ROLE_KEY;hostId=$hostId;workdir=$workdir;extraPath=@($globalBin,$NodeDir,'C:\Program Files\Git\cmd')}
[IO.File]::WriteAllText((Join-Path $root 'terminal-config.json'),($config | ConvertTo-Json))
$config=$null; $runtime=$null
$name='BitO-Server-Terminal'
if (Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue) { Stop-ScheduledTask -TaskName $name; Unregister-ScheduledTask -TaskName $name -Confirm:$false }
$action=New-ScheduledTaskAction -Execute $node -Argument "`"$root\terminal-agent.cjs`" `"$root\terminal-config.json`"" -WorkingDirectory $root
$trigger=New-ScheduledTaskTrigger -AtStartup
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal=New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType S4U -RunLevel Highest
Register-ScheduledTask -TaskName $name -Action $action -Trigger $trigger -Settings $settings -Principal $principal | Out-Null
Start-ScheduledTask -TaskName $name
Write-Output "installed: $name as $env:USERNAME, workdir $workdir, claude $(Test-Path (Join-Path $globalBin 'claude.cmd')), codex $(Test-Path (Join-Path $globalBin 'codex.cmd'))"
