// Read-only: never launches ADB, changes ACLs, controls a task or reads credentials.
const net = require('node:net');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
async function existingDevices() {
  return new Promise(resolve => {
    let data = Buffer.alloc(0), finished = false;
    const socket = net.createConnection({ host: '127.0.0.1', port: 5037 });
    const done = result => { if (!finished) { finished = true; socket.destroy(); resolve(result); } };
    socket.setTimeout(5000, () => done({ error: 'adb_daemon_timeout' }));
    socket.on('error', error => done({ error: error.code || 'adb_socket_error' }));
    socket.on('end', () => done({ error: 'adb_incomplete_response' }));
    socket.on('connect', () => { const command = 'host:devices-l'; socket.write(command.length.toString(16).padStart(4, '0') + command); });
    socket.on('data', chunk => {
      data = Buffer.concat([data, chunk]);
      if (data.length > 65536) return done({ error: 'adb_response_limit' });
      if (data.length < 8) return;
      if (data.subarray(0, 4).toString() !== 'OKAY') return done({ error: 'adb_request_rejected' });
      const sizeText = data.subarray(4, 8).toString();
      if (!/^[0-9a-f]{4}$/i.test(sizeText)) return done({ error: 'adb_invalid_length' });
      const size = parseInt(sizeText, 16);
      if (data.length < 8 + size) return;
      const rows = data.subarray(8, 8 + size).toString('utf8').trim().split(/\r?\n/).filter(Boolean);
      done({ devices: rows.map(row => { const [serial, state] = row.trim().split(/\s+/); return { serial, state }; }) });
    });
  });
}
async function main() {
  const result = { checked_at: new Date().toISOString(), adb: await existingDevices() };
  try {
    const text = fs.readFileSync('C:/services/Bit-O/tools/whisky-adb/artifacts/adb/automation/latest.json', 'utf8').replace(/^\uFEFF/, '');
    const status = JSON.parse(text);
    result.latest = Object.fromEntries(['started_at', 'finished_at', 'apply', 'status', 'queued', 'observed', 'updated', 'error', 'eligible', 'unsupported_or_duplicate_links'].filter(key => key in status).map(key => [key, status[key]]));
  } catch (error) { result.latest = { error: error.code || 'status_read_failed' }; }
  const ps = `$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue';$rows=@();foreach($name in @('Whisky-ADB-Bridge','Whisky-ADB-Price-Refresh')){try{$t=Get-ScheduledTask -TaskName $name;$i=Get-ScheduledTaskInfo -TaskName $name;$rows += [pscustomobject]@{name=$name;state=[string]$t.State;last_result=$i.LastTaskResult;last_run_utc=$i.LastRunTime.ToUniversalTime().ToString('o');next_run_utc=$i.NextRunTime.ToUniversalTime().ToString('o')}}catch{$rows += [pscustomobject]@{name=$name;error=$_.Exception.GetType().Name}}};ConvertTo-Json -InputObject @($rows) -Compress`;
  try {
    result.tasks = JSON.parse(execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(ps, 'utf16le').toString('base64')], { encoding: 'utf8', timeout: 30000, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }).replace(/^\uFEFF/, '').trim());
  } catch (error) { result.tasks = { error: error.code || 'task_query_failed' }; }
  console.log(JSON.stringify(result, null, 2));
}
main().catch(() => { console.error('Whisky diagnostic failed'); process.exitCode = 1; });
