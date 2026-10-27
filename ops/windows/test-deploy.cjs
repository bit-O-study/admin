// Runs a temp-root copy of deploy.ps1; no real service directory or supervisor is touched.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bito-deploy-test-'));
const quote = value => "'" + value.replaceAll("'", "''") + "'";
const original = fs.readFileSync(path.join(__dirname, 'deploy.ps1'), 'utf8').replace(/^\uFEFF/, '');
const sha = 'a'.repeat(40), other = 'b'.repeat(40);
function run(scenario, { current, releaseExists, manifestSha } = {}) {
  const dir = path.join(root, scenario), service = path.join(dir, 'admin');
  fs.mkdirSync(path.join(service, 'releases'), { recursive: true });
  const script = path.join(dir, 'deploy.ps1');
  const patched = original.replace('$root="C:\\services\\Bit-O\\$Project"', `$root=${quote(service)}`);
  assert.notEqual(patched, original, 'service root placeholder not found');
  fs.writeFileSync(script, '\ufeff' + patched);
  if (current) fs.writeFileSync(path.join(service, 'current.json'), JSON.stringify({ sha: current, previous: null }));
  if (releaseExists) fs.mkdirSync(path.join(service, 'releases', sha));
  const archive = path.join(dir, 'release.tar');
  if (manifestSha) {
    const stage = path.join(dir, 'stage'); fs.mkdirSync(stage);
    fs.writeFileSync(path.join(stage, 'release.json'), JSON.stringify({ sha: manifestSha, project: 'admin' }));
    const tar = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe');
    assert.equal(spawnSync(tar, ['-cf', archive, '-C', stage, 'release.json']).status, 0);
  }
  const result = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, '-Project', 'admin', '-Sha', sha, '-Archive', archive], {
    encoding: 'utf8', windowsHide: true,
    // System32 first so deploy.ps1 uses Windows tar, as on the server, not a Git Bash tar from PATH.
    env: { ...process.env, PATH: path.join(process.env.SystemRoot || 'C:\\Windows', 'System32') + path.delimiter + process.env.PATH, GITHUB_REF: 'refs/heads/main', GITHUB_REPOSITORY: 'bit-O-study/admin', GITHUB_EVENT_NAME: 'workflow_dispatch' },
  });
  return { ...result, service };
}
try {
  const active = run('already-active', { current: sha, releaseExists: true });
  assert.equal(active.status, 0, active.stderr);
  assert.match(active.stdout, /Already deployed admin a{40}; skipping/);
  assert.equal(fs.existsSync(path.join(active.service, 'request.json')), false, 'skip must not request activation');

  const inactive = run('exists-not-active', { current: other, releaseExists: true });
  assert.notEqual(inactive.status, 0);
  assert.match(inactive.stderr + inactive.stdout, /Release already exists but is not active/);

  const noCurrent = run('exists-no-current', { releaseExists: true });
  assert.notEqual(noCurrent.status, 0);
  assert.match(noCurrent.stderr + noCurrent.stdout, /Release already exists but is not active/);

  const fresh = run('fresh-release', { current: other, manifestSha: other });
  assert.notEqual(fresh.status, 0);
  assert.match(fresh.stderr + fresh.stdout, /Release identity mismatch/, 'new release must still pass the existence guard and be extracted');
  console.log('deploy.ps1 tests passed: skip active, reject inactive, reject missing current, fresh release continues');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
