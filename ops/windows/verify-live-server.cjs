// Run only on the admin host. Does not start or stop any project.
// A temporary, unmailed test account is deleted in finally, along with its admin row.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { parseEnv } = require('node:util');
const root = 'C:/services/Bit-O/admin';
const current = JSON.parse(fs.readFileSync(path.join(root, 'current.json'), 'utf8').replace(/^\uFEFF/, ''));
assert.match(current.sha, /^[a-f0-9]{40}$/);
const requireRelease = createRequire(path.join(root, 'releases', current.sha, 'server.js'));
const { createClient } = requireRelease('@supabase/supabase-js');
const { createServerClient } = requireRelease('@supabase/ssr');
const config = parseEnv(fs.readFileSync(path.join(root, 'config/runtime.env'), 'utf8'));
const url = config.HEALTH_SUPABASE_URL || config.NEXT_PUBLIC_SUPABASE_URL;
const db = createClient(url, config.HEALTH_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const email = `e2e-server-control-${Date.now()}@example.invalid`;
const password = crypto.randomBytes(30).toString('base64url') + 'aA1!';
const base = 'http://127.0.0.1:4101';
let userId, authorized = false;
async function main() {
  const anonymous = await fetch(base + '/api/admin/server', { redirect: 'manual', signal: AbortSignal.timeout(15000) });
  assert.ok([302, 303, 307, 308, 401, 403].includes(anonymous.status), 'Anonymous status must be protected');
  const created = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { display_name: 'Temporary server-control verification' } });
  if (created.error) throw Error('Temporary account creation failed: ' + created.error.code);
  userId = created.data.user.id;
  const added = await db.from('admins').insert({ email });
  if (added.error) throw Error('Temporary authorization failed: ' + added.error.code);
  authorized = true;
  const cookies = new Map();
  const session = createServerClient(url, config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { cookies: { getAll: () => Array.from(cookies, ([name, value]) => ({ name, value })), setAll: values => values.forEach(cookie => cookies.set(cookie.name, cookie.value)) } });
  const login = await session.auth.signInWithPassword({ email, password });
  if (login.error) throw Error('Temporary session failed: ' + login.error.code);
  const cookie = Array.from(cookies, ([name, value]) => `${name}=${value}`).join('; ');
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
  if (authorized) { const result = await db.from('admins').delete().eq('email', email); if (result.error) { console.error('Temporary admin cleanup failed'); process.exitCode = 1; } }
  if (userId) { const result = await db.auth.admin.deleteUser(userId); if (result.error) { console.error('Temporary account cleanup failed'); process.exitCode = 1; } }
  console.log('Temporary verification account cleanup completed; no process control commands were issued.');
});
