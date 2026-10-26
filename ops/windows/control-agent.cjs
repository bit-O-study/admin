// Independent loopback service. No shell commands or client-supplied paths are accepted.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');
const { createDeploymentMonitor } = require('./deployment-status.cjs');

function read(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); } catch { return null; } }
function probe(app) {
  return new Promise(resolve => {
    const req = http.get({ hostname: '127.0.0.1', port: app.port, path: app.healthPath || '/', timeout: 1800 }, res => {
      res.resume(); resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false)); req.on('timeout', () => req.destroy());
  });
}
function createAgent({ inventory, token, auditPath, deploymentMonitor = createDeploymentMonitor() }) {
  if (typeof token !== 'string' || token.length < 32) throw Error('Agent token must contain at least 32 characters');
  const apps = new Map(inventory.map(app => [app.name, app]));
  if (apps.size !== inventory.length) throw Error('Duplicate inventory entry');
  for (const app of inventory) {
    if (!/^[\w-]+$/.test(app.name) || !path.isAbsolute(app.root) || !Number.isInteger(app.port)) throw Error('Invalid inventory');
  }
  const pending = new Set();
  const astScript = path.join(__dirname, 'control-ast.ps1');
  const isAst = app => app.name === 'ast' && path.resolve(app.root).toLowerCase() === path.resolve('C:/ast').toLowerCase() && app.port === 8787;
  // A previous agent may have exited during a task operation. Never silently retry it.
  for (const app of inventory.filter(isAst)) {
    const command = read(path.join(app.root, 'control.json')), result = read(path.join(app.root, 'control-result.json'));
    if (command && command.id !== result?.id) fs.writeFileSync(path.join(app.root, 'control-result.json'), JSON.stringify({ id: command.id, ok: false, error: '에이전트가 재시작되었습니다. 실제 상태를 확인한 후 다시 요청해 주세요.' }));
  }
  const authorized = value => {
    const supplied = Buffer.from(value || ''); const expected = Buffer.from('Bearer ' + token);
    return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
  };
  function capability(app) {
    if (isAst(app)) return process.platform === 'win32' && fs.existsSync(astScript);
    const status = read(path.join(app.root, 'supervisor-status.json'));
    return status?.version === 1 && Date.now() - Date.parse(status.checkedAt) < 15000;
  }
  async function snapshot() {
    const projects = await Promise.all(inventory.map(async app => {
      const release = read(path.join(app.root, app.manifest || 'current.json'));
      const proc = read(path.join(app.root, 'process.json'));
      const control = read(path.join(app.root, 'control.json'));
      const result = read(path.join(app.root, 'control-result.json'));
      const healthy = await probe(app);
      const deployed = /^[a-f0-9]{40}$/.test(release?.sha || '');
      const capable = capability(app);
      return { name: app.name, port: app.port, sha: deployed ? release.sha : null, deployment: deploymentMonitor(app),
        pid: healthy && Number.isInteger(proc?.pid) ? proc.pid : null,
        state: healthy ? 'running' : control?.action === 'off' && result?.id === control.id && result?.ok ? 'stopped' : deployed ? 'unhealthy' : 'not-deployed',
        desired: control?.action === 'off' ? 'off' : 'on',
        pending: Boolean(control && control.id !== result?.id),
        controlError: control?.id === result?.id && result?.ok === false ? (isAst(app) && typeof result.error === 'string' ? result.error.slice(0, 250) : '프로세스 변경에 실패했습니다. 서버 로그를 확인해 주세요.') : null,
        controllable: capable && deployed && app.name !== 'admin',
        controlReason: app.name === 'admin' ? '관리 콘솔은 연결 유지를 위해 서버에서 직접 관리합니다.' : !capable ? '제어 가능한 supervisor 연결이 필요합니다.' : !deployed ? '먼저 프로젝트를 배포해 주세요.' : null };
    }));
    const total = os.totalmem(), free = os.freemem();
    return { checkedAt: new Date().toISOString(), memory: { total, free, used: total - free, percent: Math.round((total - free) / total * 100) },
      environment: { hostname: os.hostname(), platform: os.platform(), release: os.release(), architecture: os.arch(), node: process.version, cpu: os.cpus()[0]?.model || 'Unknown', cores: os.cpus().length, uptime: Math.floor(os.uptime()) }, projects };
  }
  const server = http.createServer(async (req, res) => {
    const reply = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
    if (!authorized(req.headers.authorization)) return reply(401, { error: 'Unauthorized' });
    if (req.headers.origin) return reply(403, { error: 'Browser access forbidden' });
    try {
      if (req.method === 'GET' && req.url === '/status') return reply(200, await snapshot());
      if (req.method !== 'POST' || req.url !== '/control') return reply(404, { error: 'Not found' });
      let body = '';
      for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 2048) return reply(413, { error: 'Body too large' }); }
      let input; try { input = JSON.parse(body); } catch { return reply(400, { error: 'Invalid JSON' }); }
      const app = apps.get(input?.project);
      if (!app || !['on', 'off'].includes(input?.action) || typeof input?.actor !== 'string' || input.actor.length > 254) return reply(400, { error: 'Invalid control request' });
      if (app.name === 'admin') return reply(409, { error: '관리 콘솔은 서버에서 직접 관리해 주세요.' });
      if (!capability(app)) return reply(409, { error: '제어 가능한 supervisor 연결이 필요합니다.' });
      if (!/^[a-f0-9]{40}$/.test(read(path.join(app.root, app.manifest || 'current.json'))?.sha || '')) return reply(409, { error: '배포된 프로젝트만 제어할 수 있습니다.' });
      const existing = read(path.join(app.root, 'control.json')), result = read(path.join(app.root, 'control-result.json'));
      if (pending.has(app.name) || (existing && existing.id !== result?.id)) return reply(409, { error: '이전 변경이 진행 중입니다.' });
      pending.add(app.name);
      try {
        const command = { id: crypto.randomUUID(), action: input.action, requestedAt: new Date().toISOString() };
        // Fail closed if the audit trail cannot be recorded.
        fs.appendFileSync(auditPath, JSON.stringify({ ...command, project: app.name, actor: input.actor }) + '\n');
        const file = path.join(app.root, 'control.json');
        fs.writeFileSync(file + '.tmp', JSON.stringify(command)); fs.renameSync(file + '.tmp', file);
        if (isAst(app)) {
          execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', astScript, '-Action', input.action], { windowsHide: true, encoding: 'utf8', timeout: 300000, maxBuffer: 16384 }, (error, stdout) => {
            let outcome; try { outcome = JSON.parse(stdout.replace(/^\uFEFF/, '')); } catch { outcome = null; }
            const completed = { id: command.id, action: command.action, ok: !error && outcome?.ok === true, error: typeof outcome?.error === 'string' ? outcome.error.slice(0, 250) : 'AST 상태 변경을 완료하지 못했습니다. 서버에서 상태를 확인해 주세요.', finishedAt: new Date().toISOString() };
            try {
              const resultFile = path.join(app.root, 'control-result.json');
              fs.writeFileSync(resultFile + '.tmp', JSON.stringify(completed)); fs.renameSync(resultFile + '.tmp', resultFile);
              fs.appendFileSync(auditPath, JSON.stringify({ ...completed, project: app.name }) + '\n');
            } catch { console.error('Could not persist AST operation result'); }
          });
        }
        return reply(202, { id: command.id });
      } finally { pending.delete(app.name); }
    } catch { reply(503, { error: '서버 관리 에이전트 작업에 실패했습니다.' }); }
  });
  server.requestTimeout = 10000;
  return server;
}
module.exports = { createAgent };
if (require.main === module) {
  const config = read(path.resolve(process.argv[2] || 'control-agent.config.json'));
  if (!config) throw Error('Missing agent config');
  const token = fs.readFileSync(config.tokenFile, 'utf8').trim();
  const inventory = read(config.inventoryFile);
  const port = config.port || 4199;
  createAgent({ inventory, token, auditPath: config.auditPath }).listen(port, '127.0.0.1', () => console.log('Server control agent listening on loopback port ' + port));
}
