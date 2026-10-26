const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createDeploymentMonitor, localDeployment } = require('./deployment-status.cjs');
const app = { name: 'admin', root: fs.mkdtempSync(path.join(os.tmpdir(), 'bito-ci-test-')), workflow: 'windows-server.yml' };
const tick = () => new Promise(resolve => setImmediate(resolve));
test('public CI monitoring reports the actual failed job/step and caches requests', async () => {
  let calls = 0;
  const monitor = createDeploymentMonitor({ fetcher: async () => ({ ok: true, json: async () => ++calls === 1 ? { workflow_runs: [{ id: 42, status: 'completed', conclusion: 'failure', head_sha: 'a'.repeat(40), updated_at: '2026-10-26T10:00:00Z' }] } : { jobs: [{ name: 'build', conclusion: 'failure', steps: [{ name: 'Test, build and package', conclusion: 'failure' }] }] } }) });
  assert.equal(monitor(app).ci.state, 'loading'); await tick();
  const result = monitor(app).ci;
  assert.equal(result.state, 'failure'); assert.equal(result.stage, 'build / Test, build and package');
  assert.equal(result.runUrl, 'https://github.com/bit-O-study/admin/actions/runs/42');
  monitor(app); assert.equal(calls, 2);
});
test('rate limits are unavailable rather than successful or failed deployments', async () => {
  const monitor = createDeploymentMonitor({ fetcher: async () => ({ ok: false, status: 403 }) });
  monitor(app); await tick();
  assert.equal(monitor(app).ci.state, 'unavailable');
  assert.match(monitor(app).ci.reason, /조회 한도/);
});
test('local activation reasons are allowlisted and current release is separate from failed attempt', () => {
  fs.writeFileSync(path.join(app.root, 'current.json'), JSON.stringify({ sha: 'a'.repeat(40), updatedAt: '2026-10-26' }));
  fs.writeFileSync(path.join(app.root, 'result.json'), JSON.stringify({ ok: false, sha: 'b'.repeat(40), error: 'Application health check failed' }));
  assert.equal(localDeployment(app).sha, 'a'.repeat(40));
  assert.equal(localDeployment(app).attemptedSha, 'b'.repeat(40));
  assert.equal(localDeployment(app).reason, '시작 후 정상 응답 확인 실패');
  fs.writeFileSync(path.join(app.root, 'result.json'), JSON.stringify({ ok: false, error: 'secret environment path' }));
  assert.equal(JSON.stringify(localDeployment(app)).includes('secret environment path'), false);
});
