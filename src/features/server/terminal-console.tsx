'use client';

import '@xterm/xterm/css/xterm.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, SquareTerminal, X } from 'lucide-react';
import { useConfirm } from '@/components/use-confirm';
import { isLive, stateText, TERMINAL_KINDS, TERMINAL_LABEL, type TerminalKind, type TerminalSession } from './terminal-model';

const button = 'flex h-8 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] font-medium hover:bg-zinc-50 disabled:opacity-50 dark:hover:bg-zinc-900';
const post = (url: string, body: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

/** 서버 › 터미널 (2026-10-27): 운영 서버의 Claude Code·Codex·PowerShell 을 관리자 화면에서 연다. */
export function TerminalConsole() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [sessions, setSessions] = useState<TerminalSession[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dialog, ask] = useConfirm();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/server/terminal', { cache: 'no-store' });
      const body = await res.json();
      if (!res.ok) throw Error(body.error || '서버 터미널을 불러오지 못했습니다.');
      setOnline(body.online); setSessions(body.sessions); setError('');
    } catch (e) { setError(e instanceof Error ? e.message : '서버 터미널을 불러오지 못했습니다.'); }
  }, []);
  useEffect(() => {
    const first = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => { if (!document.hidden) void refresh(); }, 5000);
    return () => { clearTimeout(first); clearInterval(timer); };
  }, [refresh]);

  async function open(kind: TerminalKind) {
    setBusy(true);
    try {
      const res = await post('/api/admin/server/terminal', { kind, cols: 120, rows: 32 });
      const body = await res.json();
      if (!res.ok) throw Error(body.error || '세션을 열지 못했습니다.');
      setActive(body.id); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : '세션을 열지 못했습니다.'); }
    finally { setBusy(false); }
  }
  async function close(session: TerminalSession) {
    if (!(await ask({ title: '세션 닫기', message: `${TERMINAL_LABEL[session.kind]} 세션을 닫을까요? 실행 중인 작업도 함께 끝납니다.`, confirmLabel: '닫기', tone: 'danger' }))) return;
    await post(`/api/admin/server/terminal/${session.id}`, { type: 'close' });
    await refresh();
  }

  const current = sessions.find((s) => s.id === active) ?? null;
  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">터미널</h1>
          <p className="mt-1 hidden text-[13.5px] text-zinc-500 sm:block">운영 서버에서 Claude Code·Codex·PowerShell 을 엽니다. 서버 전체 권한으로 실행되고, 입력은 관리자 이름과 함께 기록됩니다.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[13px] text-zinc-500">
            <span className={`size-2 rounded-full ${online ? 'bg-emerald-500' : online === false ? 'bg-red-500' : 'bg-zinc-300'}`} />
            {online ? '서버 연결됨' : online === false ? '서버 에이전트 꺼짐' : '확인 중'}
          </span>
          {TERMINAL_KINDS.map((kind) => (
            <button key={kind} type="button" className={button} disabled={!online || busy} onClick={() => void open(kind)}>
              <Plus className="size-3.5" />{TERMINAL_LABEL[kind]}
            </button>
          ))}
        </div>
      </div>
      {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
      {/* 폰: 칸 폭을 화면에 묶는다(minmax(0,1fr)) — 기본 auto 칸은 세션 가로 목록 길이만큼 늘어나 터미널이 화면 밖으로 밀렸다. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* 폰에서는 세션 목록을 가로 한 줄로 — 세로로 쌓이면 터미널이 아래 탭 막대 밑으로 밀렸다. */}
        <nav aria-label="터미널 세션" className="min-w-0 rounded-lg border border-line bg-surface p-2">
          {sessions.length === 0 && <p className="p-3 text-[13px] text-zinc-500">아직 연 세션이 없습니다.</p>}
          <ul className="flex gap-1 overflow-x-auto lg:block lg:space-y-1">
            {sessions.map((s) => (
              <li key={s.id} className="shrink-0 lg:shrink">
                <button type="button" onClick={() => setActive(s.id)} aria-current={s.id === active || undefined}
                  className={`w-44 rounded-md px-3 py-2 text-left text-[13px] lg:w-full ${s.id === active ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className={`size-1.5 rounded-full ${isLive(s) ? 'bg-emerald-500' : 'bg-zinc-300'}`} />{TERMINAL_LABEL[s.kind]}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-500">{new Date(s.created_at).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {stateText(s)}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section className="min-w-0 overflow-hidden rounded-lg border border-line bg-[#0a0a0a]">
          {current ? (
            <>
              <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-[13px] text-zinc-300">
                <span className="truncate">{TERMINAL_LABEL[current.kind]} · {current.actor} · {stateText(current)}</span>
                {isLive(current) && (
                  <button type="button" onClick={() => void close(current)} className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded px-2 py-1 hover:bg-zinc-800" aria-label="세션 닫기">
                    <X className="size-3.5" />닫기
                  </button>
                )}
              </div>
              <TerminalView key={current.id} session={current} onEnded={() => void refresh()} />
            </>
          ) : (
            <div className="flex h-[360px] flex-col items-center justify-center gap-2 text-[13px] text-zinc-400">
              <SquareTerminal className="size-6" />위에서 세션을 열거나 왼쪽에서 고르세요.
            </div>
          )}
        </section>
      </div>
      {dialog}
    </div>
  );
}

// xterm 은 CSS 변수(var(--font-…))로 글자 폭을 재지 못해 칸이 벌어지고 마지막 줄이 잘렸다 — 실제 글꼴 이름만 쓴다.
const TERM_FONT = '"Cascadia Mono", Consolas, "D2Coding", "Malgun Gothic", Menlo, monospace';
const KEY_BUTTONS: [string, string][] = [['Enter', '\r'], ['Esc', '\x1b'], ['Tab', '\t'], ['Shift+Tab', '\x1b[Z'], ['↑', '\x1b[A'], ['↓', '\x1b[B'], ['Ctrl+C', '\x03']];

/** xterm 화면: 출력은 0.25초마다 이어 받고, 키 입력은 모아서 보낸다. 아래 입력창은 쓰는 글이 그대로 보인다(한글 조합·폰). */
function TerminalView({ session, onEnded }: { session: TerminalSession; onEnded: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const sendRef = useRef<(data: string) => void>(() => {});
  const [state, setState] = useState(session.state);
  const [line, setLine] = useState('');
  useEffect(() => {
    let disposed = false;
    let after = 0;
    let pending = '';
    let flushTimer: ReturnType<typeof setTimeout> | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let live = isLive(session);
    const url = `/api/admin/server/terminal/${session.id}`;
    const cleanups: (() => void)[] = [];

    void (async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([import('@xterm/xterm'), import('@xterm/addon-fit')]);
      if (disposed || !box.current) return;
      const term = new Terminal({ fontFamily: TERM_FONT, fontSize: 13, lineHeight: 1.15, cursorBlink: true, scrollback: 5000, theme: { background: '#0a0a0a' } });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(box.current);
      cleanups.push(() => term.dispose());

      const flush = () => {
        flushTimer = null;
        if (!pending || !live) return;
        const data = pending; pending = '';
        void post(url, { type: 'input', data });
      };
      const queue = (data: string) => {
        if (!live) return;
        pending += data;
        if (!flushTimer) flushTimer = setTimeout(flush, 40);
      };
      sendRef.current = queue;
      const input = term.onData(queue);
      cleanups.push(() => input.dispose());
      const sendSize = () => { if (live) void post(url, { type: 'resize', cols: term.cols, rows: term.rows }); };
      const refit = () => {
        fit.fit();
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(sendSize, 300);
      };
      const observer = new ResizeObserver(refit);
      observer.observe(box.current);
      cleanups.push(() => observer.disconnect());
      refit();
      // 글꼴을 다 받은 뒤 글자 크기를 다시 재야 줄 수가 맞는다.
      void document.fonts?.ready.then(() => { if (!disposed) { term.options.fontFamily = TERM_FONT; refit(); } });
      if (window.matchMedia('(min-width: 1024px)').matches) term.focus();

      // 끝난 세션도 기록은 끝까지 보여 준다.
      while (!disposed) {
        try {
          const res = await fetch(`${url}?after=${after}`, { cache: 'no-store' });
          if (res.ok) {
            const body = await res.json() as { session: TerminalSession; chunks: { id: number; data: string }[] };
            for (const c of body.chunks) { term.write(c.data); after = c.id; }
            setState(body.session.state);
            const nowLive = isLive(body.session);
            if (live && !nowLive) { term.write(`\r\n\x1b[90m[${stateText(body.session)}]\x1b[0m\r\n`); onEnded(); }
            live = nowLive;
            if (!live && body.chunks.length < 200) break;
            if (body.chunks.length >= 200) continue;
          }
        } catch { /* 잠깐 끊겨도 다음 주기에 이어 받는다. */ }
        await new Promise((r) => setTimeout(r, document.hidden ? 2000 : 250));
      }
    })();
    return () => {
      disposed = true;
      sendRef.current = () => {};
      if (flushTimer) clearTimeout(flushTimer);
      if (resizeTimer) clearTimeout(resizeTimer);
      cleanups.forEach((fn) => fn());
    };
    // 세션이 바뀌면 key 로 새로 그린다 — 상태 갱신마다 다시 붙지 않게 id 만 본다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const live = isLive({ state });
  function submit(event: React.FormEvent) {
    event.preventDefault();
    sendRef.current(line + '\r');
    setLine('');
  }
  return (
    <>
      {/* 높이는 화면에 맞춘다(폰: 아래 탭 막대·입력창 자리를 뺀다). 안쪽 여백은 바깥에 둬야 fit 이 줄 수를 정확히 잰다. */}
      <div className="h-[calc(100dvh-380px)] min-h-[260px] p-2 lg:h-[calc(100dvh-430px)] lg:min-h-[380px]">
        <div ref={box} data-state={state} className="h-full w-full" aria-label="터미널 화면" />
      </div>
      <form onSubmit={submit} className="space-y-2 border-t border-zinc-800 p-2">
        <div className="flex gap-2">
          <input
            value={line} onChange={(e) => setLine(e.target.value)} disabled={!live}
            aria-label="터미널에 보낼 내용" placeholder={live ? '여기에 입력하고 Enter — 쓰는 글이 그대로 보입니다' : '끝난 세션입니다'}
            className="h-9 min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 font-mono text-[13px] text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-400 focus:outline-none disabled:opacity-50"
          />
          <button type="submit" disabled={!live} className="h-9 shrink-0 rounded-md bg-zinc-100 px-3 text-[13px] font-medium text-zinc-900 hover:bg-white disabled:opacity-50">보내기</button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto" aria-label="특수 키">
          {KEY_BUTTONS.map(([label, data]) => (
            <button key={label} type="button" disabled={!live} onClick={() => sendRef.current(data)}
              className="h-7 shrink-0 rounded border border-zinc-700 px-2 font-mono text-[12px] text-zinc-300 hover:bg-zinc-800 disabled:opacity-50">
              {label}
            </button>
          ))}
        </div>
      </form>
    </>
  );
}
