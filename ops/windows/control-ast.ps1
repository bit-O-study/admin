# Only the fixed paper-trading task can be controlled; no paths or commands come from HTTP.
param([Parameter(Mandatory=$true)][ValidateSet('on','off')][string]$Action)
$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
$projectRoot='C:\ast'
$taskName='AST-Paper-Trader'
$stateFile=Join-Path $projectRoot 'admin-control-state.json'
$mutex=[Threading.Mutex]::new($false,'Global\AST-Deploy-AST-Paper-Trader')
$owned=$false
$exitCode=0
$pausedByUs=$false
$disabledByUs=$false
$originalHalted=$true
function Read-Status { Invoke-RestMethod -Uri 'http://127.0.0.1:8787/api/status' -TimeoutSec 5 }
function Control-Paper([string]$command) {
  Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:8787/api/control' -ContentType 'application/json' -Body (@{action=$command}|ConvertTo-Json -Compress) -TimeoutSec 5 | Out-Null
}
function Assert-Paper($status) {
  # Missing fields must not be interpreted as a safe empty position.
  if ($status.mode -ne 'paper' -or $null -eq $status.balance -or
      $null -eq $status.balance.coin -or $status.balance.coin -ne 0 -or
      $null -ne $status.position -or $status.lastError -or $status.killed -or
      $status.halted -isnot [bool]) {
    throw 'AST는 정상 모의투자·무포지션 상태에서만 제어할 수 있습니다.'
  }
}
function Has-Listener { return [bool](Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue) }
function Save-State($value) {
  [IO.File]::WriteAllText($stateFile+'.tmp',($value|ConvertTo-Json -Compress))
  Move-Item -LiteralPath ($stateFile+'.tmp') -Destination $stateFile -Force
}
try {
  try {$owned=$mutex.WaitOne(0)} catch [Threading.AbandonedMutexException] {$owned=$true}
  if (!$owned) {throw 'AST 배포 또는 제어가 이미 진행 중입니다.'}
  $task=Get-ScheduledTask -TaskName $taskName
  $runner=Join-Path $projectRoot 'scripts\server\run-paper.ps1'
  $arguments='-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "'+$runner+'" -ProjectRoot "'+$projectRoot+'"'
  if (@($task.Actions).Count -ne 1 -or
      $task.Actions[0].Execute -ne 'C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe' -or
      $task.Actions[0].Arguments -ne $arguments -or $task.Actions[0].WorkingDirectory -ne $projectRoot -or
      @('SYSTEM','S-1-5-18') -notcontains $task.Principal.UserId -or $task.Settings.MultipleInstances -ne 2) {
    throw 'AST 예약 작업 설정을 확인해야 합니다.'
  }
  if ($Action -eq 'off') {
    if ($task.State -eq 'Disabled' -and !(Has-Listener)) {
      @{ok=$true;action='off'}|ConvertTo-Json -Compress
    } else {
      $before=Read-Status
      Assert-Paper $before
      $originalHalted=$before.halted
      if (!$originalHalted) {Control-Paper 'pause';$pausedByUs=$true}
      $ready=Read-Status
      Assert-Paper $ready
      if (!$ready.halted -or $ready.balance.krw -ne $before.balance.krw) {throw 'AST 상태가 변경되어 중지를 취소했습니다.'}
      Save-State @{originalHalted=$originalHalted;requestedAt=[DateTime]::UtcNow.ToString('o');action='off'}
      # Disable first: its minute trigger and child restart loop otherwise undo OFF.
      Disable-ScheduledTask -TaskName $taskName | Out-Null
      $disabledByUs=$true
      Stop-ScheduledTask -TaskName $taskName
      $stopped=$false
      for($i=0;$i -lt 30;$i++) {
        if (!(Has-Listener)) {$stopped=$true;break}
        Start-Sleep -Seconds 1
      }
      if (!$stopped) {throw 'AST 종료를 확인하지 못했습니다. 서버에서 확인해 주세요.'}
      @{ok=$true;action='off'}|ConvertTo-Json -Compress
    }
  } else {
    if ($task.State -eq 'Running') {
      $status=Read-Status
      if ($status.mode -ne 'paper') {throw 'AST 모의투자 실행 상태를 확인해야 합니다.'}
      @{ok=$true;action='on'}|ConvertTo-Json -Compress
    } else {
      if (Has-Listener) {throw 'AST 기존 프로세스가 남아 있어 시작할 수 없습니다.'}
      $saved=$null
      if (Test-Path -LiteralPath $stateFile) {$saved=Get-Content -LiteralPath $stateFile -Raw -Encoding UTF8|ConvertFrom-Json}
      Enable-ScheduledTask -TaskName $taskName | Out-Null
      Start-ScheduledTask -TaskName $taskName
      $healthy=$false
      for($i=0;$i -lt 45;$i++) {
        try {
          $status=Read-Status
          if ($status.mode -ne 'paper' -or $status.lastError) {throw 'Not ready'}
          $healthy=$true;break
        } catch {Start-Sleep -Seconds 1}
      }
      if (!$healthy) {throw 'AST 시작 요청 후 정상 응답을 확인하지 못했습니다.'}
      # Resume only a pause introduced by our own OFF request, never an existing user pause.
      if ($saved -and $saved.action -eq 'off' -and $saved.originalHalted -eq $false) {
        Assert-Paper $status
        Control-Paper 'resume'
      }
      Save-State @{action='on';finishedAt=[DateTime]::UtcNow.ToString('o')}
      @{ok=$true;action='on'}|ConvertTo-Json -Compress
    }
  }
} catch {
  # Before task shutdown starts, roll back only the pause introduced by this request.
  if ($pausedByUs -and !$disabledByUs) {try {Control-Paper 'resume'} catch {}}
  $message=[string]$_.Exception.Message
  if ($message -notmatch '^AST') {$message='AST 제어에 실패했습니다. 서버 로그와 예약 작업을 확인해 주세요.'}
  @{ok=$false;error=$message}|ConvertTo-Json -Compress
  $exitCode=1
} finally {
  if($owned){$mutex.ReleaseMutex()}
  $mutex.Dispose()
}
exit $exitCode
