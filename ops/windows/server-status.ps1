param([string]$InventoryPath=(Join-Path $PSScriptRoot 'server-inventory.json'))
$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$inventory=Get-Content -LiteralPath $InventoryPath -Raw | ConvertFrom-Json
Add-Type -AssemblyName System.Net.Http
$handler=New-Object System.Net.Http.HttpClientHandler
$handler.AllowAutoRedirect=$false
$client=New-Object System.Net.Http.HttpClient($handler)
$client.Timeout=[TimeSpan]::FromSeconds(5)
try {
  $services=@(Get-Service -Name 'actions.runner.*' -ErrorAction SilentlyContinue)
  $listeners=@(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue)
  $apps=@(foreach($app in $inventory){
    $release=$null
    $errorMessage=$null
    $manifest=Join-Path $app.root $app.manifest
    if(Test-Path -LiteralPath $manifest){
      try {$release=Get-Content -LiteralPath $manifest -Raw | ConvertFrom-Json}
      catch {$errorMessage='Invalid release manifest'}
    }
    $task=Get-ScheduledTask -TaskName $app.task -ErrorAction SilentlyContinue
    $runner=@($services | Where-Object {$_.Name -eq "actions.runner.bit-O-study-$($app.name).bito-server-$($app.name)"})
    $ports=@($listeners | Where-Object {$_.LocalPort -eq $app.port})
    $status=$null
    try {
      $response=$client.GetAsync("http://127.0.0.1:$($app.port)$($app.healthPath)").GetAwaiter().GetResult()
      try {$status=[int]$response.StatusCode} finally {$response.Dispose()}
    } catch {if(-not $errorMessage){$errorMessage='HTTP endpoint unavailable'}}
    $deployed=[bool]($release.sha -match '^[a-f0-9]{40}$')
    # Running supervisors without a release are deliberately reported as not deployed.
    $state=if(-not $deployed){'not-deployed'}elseif($status -ge 200 -and $status -lt 400 -and [string]$task.State -eq 'Running'){'healthy'}else{'unhealthy'}
    [pscustomobject]@{
      name=$app.name; state=$state; deployed=$deployed; sha=$release.sha
      taskState=[string]$task.State
      runnerState=@($runner | ForEach-Object {[string]$_.Status})
      port=$app.port; listenAddresses=@($ports | ForEach-Object {$_.LocalAddress})
      httpStatus=$status; error=$errorMessage
      workflowUrl="https://github.com/bit-O-study/$($app.name)/actions/workflows/$($app.workflow)"
    }
  })
  [pscustomobject]@{checkedAt=[DateTime]::UtcNow.ToString('o');hostname=$env:COMPUTERNAME;apps=$apps} | ConvertTo-Json -Depth 6
} finally {$client.Dispose();$handler.Dispose()}
