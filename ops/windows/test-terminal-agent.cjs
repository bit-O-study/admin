// 서버 터미널 에이전트 회귀 테스트 — 가짜 저장소와 가짜 PTY 로만 돈다(실제 프로세스·DB 없음).
const assert = require('node:assert/strict');
const { createTerminalAgent, createRestStore, COMMANDS } = require('./terminal-agent.cjs');

function memoryStore() {
  const sessions = [], chunks = [];
  let seq = 0;
  return {
    sessions, chunks,
    add: (s) => sessions.push({ state: 'starting', cols: 100, rows: 30, ...s }),
    input: (session_id, kind, data) => chunks.push({ id: ++seq, session_id, kind, data }),
    heartbeat: async () => {},
    listRunning: async () => sessions.filter((s) => s.state === 'running'),
    claimStarting: async () => sessions.filter((s) => s.state === 'starting').map((s) => ((s.state = 'running'), s)),
    markEnded: async (id, state, exitCode, message) => { const s = sessions.find((x) => x.id === id); if (s && ['starting', 'running'].includes(s.state)) Object.assign(s, { state, exitCode, message }); },
    writeOutput: async (id, data) => chunks.push({ id: ++seq, session_id: id, kind: 'o', data }),
    readInput: async (list) => chunks.filter((c) => c.kind !== 'o' && list.some((l) => l.id === c.session_id && c.id > l.after)),
  };
}
function fakePty() {
  const spawned = [];
  const spawnPty = (file, args, opts) => {
    const p = { file, args, opts, written: [], resized: null, killed: false, dataCb: null, exitCb: null };
    p.onData = (cb) => (p.dataCb = cb);
    p.onExit = (cb) => (p.exitCb = cb);
    p.write = (d) => p.written.push(d);
    p.resize = (c, r) => (p.resized = [c, r]);
    p.kill = () => (p.killed = true);
    spawned.push(p);
    return p;
  };
  return { spawned, spawnPty };
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  // 1) 종류별 고정 명령으로 열고, 입력·크기 변경을 PTY 로, 출력을 저장소로.
  {
    const store = memoryStore(), pty = fakePty();
    const agent = createTerminalAgent({ store, spawnPty: pty.spawnPty, hostId: 'primary', workdir: 'C:/w' });
    store.add({ id: 's1', kind: 'claude' });
    await agent.tick();
    assert.equal(pty.spawned.length, 1);
    assert.deepEqual([pty.spawned[0].file, pty.spawned[0].args], [COMMANDS.claude.file, COMMANDS.claude.args]);
    assert.equal(pty.spawned[0].opts.cwd, 'C:/w');
    assert.equal(store.sessions[0].state, 'running');
    store.input('s1', 'i', 'hello\r');
    store.input('s1', 'r', '140x40');
    store.input('s1', 'r', '9999x1'); // 범위 밖 크기는 무시
    await agent.tick();
    assert.deepEqual(pty.spawned[0].written, ['hello\r']);
    assert.deepEqual(pty.spawned[0].resized, [140, 40]);
    await agent.tick(); // 같은 입력을 두 번 쓰지 않는다
    assert.equal(pty.spawned[0].written.length, 1);
    pty.spawned[0].dataCb('out-1');
    pty.spawned[0].dataCb('out-2');
    await wait(200);
    assert.deepEqual(store.chunks.filter((c) => c.kind === 'o').map((c) => c.data), ['out-1out-2']);
    pty.spawned[0].exitCb({ exitCode: 0 });
    await wait(20);
    assert.equal(store.sessions[0].state, 'exited');
  }
  // 2) 모르는 종류는 열지 않는다. 종료 요청(k)은 프로세스를 끝내고 'closed'.
  {
    const store = memoryStore(), pty = fakePty();
    const agent = createTerminalAgent({ store, spawnPty: pty.spawnPty, hostId: 'primary', workdir: 'C:/w' });
    store.add({ id: 'bad', kind: 'cmd.exe /c del' });
    store.add({ id: 's2', kind: 'shell' });
    await agent.tick();
    assert.equal(pty.spawned.length, 1);
    assert.equal(store.sessions.find((s) => s.id === 'bad').state, 'failed');
    store.input('s2', 'k', '');
    await agent.tick();
    assert.equal(pty.spawned[0].killed, true);
    assert.equal(store.sessions.find((s) => s.id === 's2').state, 'closed');
  }
  // 3) 재시작 복구: 진행 중이던 세션은 끝냄, 아직 열리지 않은 요청은 남김. 오래 쉬면 닫음.
  {
    const store = memoryStore(), pty = fakePty();
    let t = 0;
    const agent = createTerminalAgent({ store, spawnPty: pty.spawnPty, hostId: 'primary', workdir: 'C:/w', idleMs: 1000, now: () => t });
    store.add({ id: 'old', kind: 'shell', state: 'running' });
    store.add({ id: 'new', kind: 'codex' });
    await agent.recover();
    assert.equal(store.sessions.find((s) => s.id === 'old').state, 'failed');
    assert.equal(store.sessions.find((s) => s.id === 'new').state, 'starting');
    await agent.tick();
    assert.deepEqual(pty.spawned[0].args, COMMANDS.codex.args);
    t = 5000;
    await agent.tick();
    assert.equal(pty.spawned[0].killed, true);
    assert.equal(store.sessions.find((s) => s.id === 'new').state, 'closed');
  }
  // 4) REST 저장소: 조건부 PATCH 로만 세션을 차지하고, service 키를 헤더에만 싣는다.
  {
    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push({ url, init });
      if (init.method === 'GET') return new Response(JSON.stringify([{ id: 'a' }]), { status: 200 });
      return new Response(JSON.stringify([{ id: 'a', kind: 'shell', cols: 80, rows: 24 }]), { status: 200 });
    };
    const store = createRestStore({ url: 'https://x.supabase.co', key: 'k'.repeat(30), hostId: 'primary', fetchImpl });
    const got = await store.claimStarting();
    assert.equal(got[0].id, 'a');
    const patch = calls.find((c) => c.init.method === 'PATCH');
    assert.match(patch.url, /id=eq\.a&state=eq\.starting/);
    assert.equal(JSON.parse(patch.init.body).state, 'running');
    assert.ok(calls.every((c) => !c.url.includes('kkkk')));
  }
  console.log('terminal-agent tests passed: fixed commands, input/resize/output, kill, unknown kind, restart recovery, idle close, conditional claim');
})().catch((e) => { console.error(e); process.exitCode = 1; });
