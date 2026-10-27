// Run only on the admin host. Does not start or stop any project.
// A temporary, unmailed test account is deleted in finally, along with its admin row.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { parseEnv } = require('node:util');
const root = 'C:/services/Bit-O/admin';
const current = JSON.parse(fs.readFileSync(path.join(root, 'current.json'), 'utf8').replace(/^\uFEFF/, ''));
assert.match(current.sha, /^[a-f0-9]{40}$/);
const config = parseEnv(fs.readFileSync(path.join(root, 'config/runtime.env'), 'utf8'));
const url = config.HEALTH_SUPABASE_URL || config.NEXT_PUBLIC_SUPABASE_URL;
async function supabase(route, method, body, publicAccess = false) {
  const key = publicAccess ? config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY : config.HEALTH_SUPABASE_SERVICE_ROLE_KEY;
  const response = await fetch(url + route, { method, headers: { apikey: key, ...(publicAccess ? {} : { Authorization: `Bearer ${key}` }), 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  const text = await response.text();
  let data; try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) throw Error(`Verification auth operation failed: HTTP ${response.status} (${data?.code || data?.error_code || 'unknown'})`);
  return data;
}
const email = `e2e-server-control-${Date.now()}@example.invalid`;
const password = crypto.randomBytes(30).toString('base64url') + 'aA1!';
const base = 'http://127.0.0.1:4101';
let userId, authorized = false;
async function main() {
  const anonymous = await fetch(base + '/api/admin/server', { redirect: 'manual', signal: AbortSignal.timeout(15000) });
  assert.ok([302, 303, 307, 308, 401, 403].includes(anonymous.status), 'Anonymous status must be protected');
  const created = await supabase('/auth/v1/admin/users', 'POST', { email, password, email_confirm: true, user_metadata: { display_name: 'Temporary server-control verification' } });
  userId = created.id;
  assert.ok(userId, 'Temporary user ID is required for cleanup');
  await supabase('/rest/v1/admins', 'POST', { email });
  authorized = true;
  const session = await supabase('/auth/v1/token?grant_type=password', 'POST', { email, password }, true);
  session.expires_at ??= Math.floor(Date.now() / 1000) + session.expires_in;
  // Match @supabase/ssr's base64url session cookie and 3180-byte chunk format.
  const name = `sb-${new URL(url).hostname.split('.')[0]}-auth-token`;
  const encoded = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url');
  const cookie = encoded.length <= 3180 ? `${name}=${encoded}` : Array.from({ length: Math.ceil(encoded.length / 3180) }, (_, i) => `${name}.${i}=${encoded.slice(i * 3180, (i + 1) * 3180)}`).join('; ');
  const response = await fetch(base + '/api/admin/server', { headers: { Cookie: cookie }, redirect: 'manual', signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, 'Authenticated status request must succeed');
  const snapshot = await response.json();
  assert.ok(snapshot.memory.total > 0);
  const admin = snapshot.projects.find(project => project.name === 'admin');
  assert.equal(admin.sha, current.sha);
  assert.equal(admin.controllable, false);
  assert.ok(admin.deployment?.local);
  const page = await fetch(base + '/admin/server', { headers: { Cookie: cookie }, redirect: 'manual', signal: AbortSignal.timeout(15000) });
  assert.equal(page.status, 200, 'Authenticated dashboard must render');
  const invalid = await fetch(base + '/api/admin/server', { method: 'POST', headers: { Cookie: cookie, Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ project: 'admin', action: 'invalid-fixture-action' }), signal: AbortSignal.timeout(15000) });
  assert.equal(invalid.status, 400, 'Same-origin requests must reach input validation');
  const cross = await fetch(base + '/api/admin/server', { method: 'POST', headers: { Cookie: cookie, Origin: 'https://invalid.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ project: 'admin', action: 'invalid-fixture-action' }), signal: AbortSignal.timeout(15000) });
  assert.equal(cross.status, 403);
  console.log(JSON.stringify({ result: 'PASS', activeRelease: current.sha, authenticatedApi: response.status, dashboard: page.status, anonymous: anonymous.status, invalidCommand: invalid.status, crossOrigin: cross.status, memoryPercent: snapshot.memory.percent, projects: snapshot.projects.length, ciState: admin.deployment.ci.state }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(async () => {
  if (authorized) { try { await supabase('/rest/v1/admins?email=eq.' + encodeURIComponent(email), 'DELETE'); } catch { console.error('Temporary admin cleanup failed'); process.exitCode = 1; } }
  if (userId) { try { await supabase('/auth/v1/admin/users/' + userId, 'DELETE'); } catch { console.error('Temporary account cleanup failed'); process.exitCode = 1; } }
  console.log('Temporary verification account cleanup completed; no process control commands were issued.');
});
