// 서버 터미널 에이전트 (2026-10-27). 운영 서버에서 Claude Code·Codex·PowerShell 을 진짜 터미널(PTY)로 띄우고,
// 관리자 화면과는 HEALTH Supabase 의 server_terminal_* 테이블로만 주고받는다(관리자 화면 → 입력, 서버 → 출력).
// 사용자 선택에 따라 서버 관리자 권한으로 실행된다. 그래서 다음을 지킨다:
// - 세션은 관리자 API 가 만든 것만 연다(이 프로세스는 외부 포트를 열지 않는다).
// - 실행 파일은 아래 COMMANDS 세 가지로 고정. 관리자가 고르는 것은 종류(kind)뿐이다.
// - 에이전트가 다시 시작되면 이전 세션은 '끝남'으로 표시하고 다시 이어 붙이지 않는다.
// - 오래 아무 입출력이 없는 세션은 닫는다.
'use strict';
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

const COMMANDS = {
  // CLI 가 끝나면 세션도 끝난다. 셸이 필요하면 'shell' 세션을 연다.
  // npm 전역 설치의 claude.ps1 은 서버 실행 정책에 막힌다 — 정책은 그대로 두고 cmd 로 claude.cmd·codex.cmd 를 부른다.
  claude: { file: 'cmd.exe', args: ['/d', '/c', 'claude.cmd'] },
  codex: { file: 'cmd.exe', args: ['/d', '/c', 'codex.cmd'] },
  shell: { file: 'powershell.exe', args: ['-NoLogo'] },
};
const FLUSH_MS = 120;
const MAX_CHUNK = 60000;

function createTerminalAgent({ store, spawnPty, workdir, idleMs = 2 * 3600_000, now = () => Date.now(), log = () => {} }) {
  const live = new Map(); // id → { pty, after, buffer, timer, lastActive }

  async function flush(id) {
    const s = live.get(id);
    if (!s || !s.buffer) return;
    const data = s.buffer;
    s.buffer = '';
    clearTimeout(s.timer);
    s.timer = null;
    for (let i = 0; i < data.length; i += MAX_CHUNK) await store.writeOutput(id, data.slice(i, i + MAX_CHUNK));
  }

  async function finish(id, state, exitCode, message) {
    const s = live.get(id);
    if (!s) return;
    await flush(id).catch(() => {});
    live.delete(id);
    await store.markEnded(id, state, exitCode ?? null, message ?? null);
  }

  function start(session) {
    const command = COMMANDS[session.kind];
    if (!command) return store.markEnded(session.id, 'failed', null, '알 수 없는 세션 종류입니다.');
    let pty;
    try {
      pty = spawnPty(command.file, command.args, { name: 'xterm-256color', cols: session.cols, rows: session.rows, cwd: workdir, env: process.env });
    } catch (error) {
      return store.markEnded(session.id, 'failed', null, `실행하지 못했습니다: ${error.message}`.slice(0, 500));
    }
    const s = { pty, after: 0, buffer: '', timer: null, lastActive: now() };
    live.set(session.id, s);
    pty.onData((data) => {
      s.buffer += data;
      s.lastActive = now();
      if (s.buffer.length >= MAX_CHUNK) void flush(session.id);
      else if (!s.timer) s.timer = setTimeout(() => void flush(session.id), FLUSH_MS);
    });
    pty.onExit(({ exitCode }) => void finish(session.id, 'exited', exitCode, null));
    log(`started ${session.kind} ${session.id}`);
  }

  async function recover() {
    // 이전 에이전트가 남긴 진행 중 세션은 프로세스가 이미 사라졌다. 다시 붙이지 않고 끝낸다.
    for (const s of await store.listRunning()) await store.markEnded(s.id, 'failed', null, '서버 터미널 에이전트가 다시 시작되어 세션이 끝났습니다.');
  }

  async function tick() {
    await store.heartbeat({ hostname: os.hostname(), sessions: live.size, workdir });
    for (const session of await store.claimStarting()) await start(session);
    if (live.size === 0) return;
    const inputs = await store.readInput([...live.entries()].map(([id, s]) => ({ id, after: s.after })));
    for (const chunk of inputs) {
      const s = live.get(chunk.session_id);
      if (!s || chunk.id <= s.after) continue;
      s.after = chunk.id;
      s.lastActive = now();
      if (chunk.kind === 'i') s.pty.write(chunk.data);
      else if (chunk.kind === 'r') {
        const [cols, rows] = chunk.data.split('x').map(Number);
        if (cols >= 20 && cols <= 400 && rows >= 5 && rows <= 200) s.pty.resize(cols, rows);
      } else if (chunk.kind === 'k') {
        s.pty.kill();
        await finish(chunk.session_id, 'closed', null, '관리자가 세션을 닫았습니다.');
      }
    }
    for (const [id, s] of live) {
      if (now() - s.lastActive > idleMs) {
        s.pty.kill();
        await finish(id, 'closed', null, '오래 사용하지 않아 세션을 닫았습니다.');
      }
    }
  }

  return { tick, recover, live, COMMANDS };
}

/** HEALTH Supabase REST(PostgREST) 저장소. service_role 키는 이 서버의 설정 파일에만 있다. */
function createRestStore({ url, key, hostId, fetchImpl = fetch }) {
  const base = `${url.replace(/\/$/, '')}/rest/v1`;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  async function call(method, pathAndQuery, body, prefer) {
    const res = await fetchImpl(`${base}/${pathAndQuery}`, { method, headers: { ...headers, ...(prefer ? { Prefer: prefer } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw Error(`${method} ${pathAndQuery.split('?')[0]}: ${res.status}`);
    // Prefer: return=minimal 은 201 + 빈 본문으로 온다 — 본문이 있을 때만 JSON 으로 읽는다.
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }
  const host = encodeURIComponent(hostId);
  return {
    heartbeat: (info) => call('POST', 'server_terminal_agents', { host_id: hostId, seen_at: new Date().toISOString(), info }, 'resolution=merge-duplicates,return=minimal'),
    // 'starting' 은 아직 열리지 않은 새 요청이라 남겨 둔다(다음 tick 에서 연다).
    listRunning: () => call('GET', `server_terminal_sessions?host_id=eq.${host}&state=eq.running&select=id`),
    // starting → running 을 조건부(state=eq.starting)로 바꾼 행만 연다 — 한 세션을 두 번 열지 않는다.
    claimStarting: async () => {
      const rows = await call('GET', `server_terminal_sessions?host_id=eq.${host}&state=eq.starting&select=id&order=created_at&limit=5`);
      const claimed = [];
      for (const r of rows) {
        const got = await call('PATCH', `server_terminal_sessions?id=eq.${r.id}&state=eq.starting`, { state: 'running', started_at: new Date().toISOString() }, 'return=representation');
        if (got.length) claimed.push(got[0]);
      }
      return claimed;
    },
    markEnded: (id, state, exitCode, message) => call('PATCH', `server_terminal_sessions?id=eq.${id}&state=in.(starting,running)`, { state, exit_code: exitCode, message, ended_at: new Date().toISOString() }, 'return=minimal'),
    writeOutput: (id, data) => call('POST', 'server_terminal_chunks', { session_id: id, kind: 'o', data }, 'return=minimal'),
    readInput: async (sessions) => {
      if (!sessions.length) return [];
      const ids = sessions.map((s) => s.id).join(',');
      const after = Math.min(...sessions.map((s) => s.after));
      return call('GET', `server_terminal_chunks?session_id=in.(${ids})&kind=in.(i,r,k)&id=gt.${after}&select=id,session_id,kind,data&order=id&limit=500`);
    },
  };
}

function readConfig(file) {
  const cfg = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^﻿/, ''));
  if (!/^https:\/\//.test(cfg.url || '') || typeof cfg.key !== 'string' || cfg.key.length < 20) throw Error('터미널 에이전트 설정(url, key)을 확인하세요.');
  // extraPath: 예약 작업으로 뜨면 사용자 PATH(npm 전역 claude·codex)가 없을 수 있어 앞에 붙인다.
  const extraPath = Array.isArray(cfg.extraPath) ? cfg.extraPath.filter((p) => typeof p === 'string' && path.isAbsolute(p)) : [];
  return { url: cfg.url, key: cfg.key, hostId: cfg.hostId || 'primary', workdir: cfg.workdir || path.join(os.homedir(), 'agent-workspace'), extraPath };
}

async function main() {
  const cfg = readConfig(process.argv[2] || path.join(__dirname, 'terminal-config.json'));
  fs.mkdirSync(cfg.workdir, { recursive: true });
  if (cfg.extraPath.length) process.env.PATH = [...cfg.extraPath, process.env.PATH].join(path.delimiter);
  const { spawn } = require('@lydell/node-pty');
  const agent = createTerminalAgent({ store: createRestStore(cfg), spawnPty: spawn, workdir: cfg.workdir, log: (m) => console.log(new Date().toISOString(), m) });
  await agent.recover().catch((e) => console.warn('recover failed', e.message));
  let warned = false;
  const loop = async () => {
    try {
      await agent.tick();
      warned = false;
    } catch (e) {
      if (!warned) console.warn(new Date().toISOString(), 'terminal relay unavailable:', e.message);
      warned = true;
    } finally {
      setTimeout(loop, 300);
    }
  };
  void loop();
}

if (require.main === module) main().catch((e) => { console.error(e.message); process.exitCode = 1; });
module.exports = { createTerminalAgent, createRestStore, readConfig, COMMANDS };
