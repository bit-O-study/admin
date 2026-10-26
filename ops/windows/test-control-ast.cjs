// All task and HTTP operations are mocked; no real AST process is started or stopped.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bito-ast-control-test-'));
const quote = value => "'" + value.replaceAll("'", "''") + "'";
const original = fs.readFileSync(path.join(__dirname, 'control-ast.ps1'), 'utf8').replace(/^\uFEFF/, '');
function run(scenario, action, saved) {
  const dir = path.join(root, scenario); fs.mkdirSync(dir);
  const target = path.join(dir, 'adapter.ps1'), wrapper = path.join(dir, 'fixture.ps1');
  fs.writeFileSync(target, '\ufeff' + original.replace("$projectRoot='C:\\ast'", `$projectRoot=${quote(dir)}`).replace("'Global\\AST-Deploy-AST-Paper-Trader'", quote(`Local\\AST-Test-${scenario}-${process.pid}`)).replace("if ($message -notmatch '^AST') {$message='AST 제어에 실패했습니다. 서버 로그와 예약 작업을 확인해 주세요.'}", ''));
  if (saved) fs.writeFileSync(path.join(dir, 'admin-control-state.json'), JSON.stringify(saved));
  fs.writeFileSync(wrapper, '\ufeff' + `
$scenario=${quote(scenario)}
$root=${quote(dir)}
$global:mockstopped=$false
$global:mockstarted=$false
$global:mockpaused=$false
$global:mockevents=[Collections.Generic.List[string]]::new()
function Get-ScheduledTask {
  $runner=Join-Path $root 'scripts\\server\\run-paper.ps1'
  $args='-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "'+$runner+'" -ProjectRoot "'+$root+'"'
  if($scenario -eq 'wrong-task'){$args='unexpected'}
  [pscustomobject]@{State=$(if(${quote(action)} -eq 'on'){'Disabled'}else{'Running'});Actions=@([pscustomobject]@{Execute='C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe';Arguments=$args;WorkingDirectory=$root});Principal=[pscustomobject]@{UserId='SYSTEM'};Settings=[pscustomobject]@{MultipleInstances=2}}
}
function Invoke-RestMethod {
  param($Uri,$TimeoutSec,$Method,$ContentType,$Body)
  if($Method -eq 'Post'){$command=($Body|ConvertFrom-Json).action;$global:mockevents.Add($command);$global:mockpaused=$command -eq 'pause';return [pscustomobject]@{ok=$true}}
  [pscustomobject]@{mode=$(if($scenario -eq 'live'){'live'}else{'paper'});balance=[pscustomobject]@{coin=0;krw=10000000};position=$(if($scenario -eq 'position'){[pscustomobject]@{qty=1}}else{$null});lastError=$null;killed=$false;halted=($global:mockpaused -or $scenario -eq 'halted' -or ${quote(action)} -eq 'on')}
}
function Get-NetTCPConnection { if($scenario -eq 'orphan' -or (!$global:mockstopped -and ${quote(action)} -eq 'off')){[pscustomobject]@{State='Listen'}} }
function Disable-ScheduledTask {$global:mockevents.Add('disable');if($scenario -eq 'disable-failed'){throw 'mock failure'}}
function Stop-ScheduledTask {$global:mockevents.Add('stop');$global:mockstopped=$true}
function Enable-ScheduledTask {$global:mockevents.Add('enable')}
function Start-ScheduledTask {$global:mockevents.Add('start');$global:mockstarted=$true}
function Start-Sleep {}
& ${quote(target)} -Action ${quote(action)}
[IO.File]::WriteAllText(${quote(path.join(dir, 'events.json'))},(ConvertTo-Json -InputObject @($global:mockevents) -Compress))
`);
  const output = execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', wrapper], { encoding: 'utf8', windowsHide: true, timeout: 15000 });
  const result = JSON.parse(output.trim());
  const events = JSON.parse(fs.readFileSync(path.join(dir, 'events.json'), 'utf8'));
  return { result, events, state: fs.existsSync(path.join(dir, 'admin-control-state.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'admin-control-state.json'), 'utf8')) : null };
}
for (const scenario of ['live', 'position', 'wrong-task']) {
  const { result, events } = run(scenario, 'off'); assert.equal(result.ok, false); assert.deepEqual(events, []);
}
let r = run('off', 'off'); assert.equal(r.result.ok, true, JSON.stringify(r)); assert.deepEqual(r.events, ['pause', 'disable', 'stop']); assert.equal(r.state.originalHalted, false);
r = run('halted', 'off'); assert.equal(r.result.ok, true); assert.deepEqual(r.events, ['disable', 'stop']); assert.equal(r.state.originalHalted, true);
r = run('resume', 'on', { action: 'off', originalHalted: false }); assert.equal(r.result.ok, true); assert.deepEqual(r.events, ['enable', 'start', 'resume']);
r = run('preserve', 'on', { action: 'off', originalHalted: true }); assert.equal(r.result.ok, true); assert.deepEqual(r.events, ['enable', 'start']);
r = run('orphan', 'on'); assert.equal(r.result.ok, false); assert.deepEqual(r.events, []);
r = run('disable-failed', 'off'); assert.equal(r.result.ok, false); assert.deepEqual(r.events, ['pause', 'disable', 'resume']);
console.log('PASS AST mock tests: live/position/task mismatch rejected, safe OFF ordering, pause preservation, ON restore, orphan rejection, failure rollback.');
