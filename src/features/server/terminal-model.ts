// 서버 터미널(2026-10-27) — 관리자 화면에서 운영 서버의 Claude Code·Codex·PowerShell 을 연다.
// 입력 검사·상태 판정만 담은 순수 함수(브라우저·서버 공용, 테스트 대상).

export const TERMINAL_KINDS = ['claude', 'codex', 'shell'] as const;
export type TerminalKind = (typeof TERMINAL_KINDS)[number];
export const TERMINAL_LABEL: Record<TerminalKind, string> = { claude: 'Claude Code', codex: 'Codex', shell: 'PowerShell' };

export type TerminalState = 'starting' | 'running' | 'exited' | 'closed' | 'failed';
export type TerminalSession = {
  id: string; kind: TerminalKind; actor: string; state: TerminalState;
  created_at: string; started_at: string | null; ended_at: string | null; exit_code: number | null; message: string | null;
};
export type TerminalChunk = { id: number; data: string };

/** 에이전트 생존 신호가 이보다 오래되면 '연결 끊김'. 에이전트는 0.3초마다 보낸다. */
export const AGENT_STALE_MS = 15_000;
export const MAX_INPUT = 16_384;

export const isLive = (s: Pick<TerminalSession, 'state'>) => s.state === 'starting' || s.state === 'running';
export const agentOnline = (seenAt: string | null | undefined, now = Date.now()) =>
  !!seenAt && now - new Date(seenAt).getTime() < AGENT_STALE_MS;

export function parseCreate(input: unknown): { kind: TerminalKind; cols: number; rows: number } | null {
  if (!input || typeof input !== 'object') return null;
  const { kind, cols, rows } = input as Record<string, unknown>;
  if (!TERMINAL_KINDS.includes(kind as TerminalKind)) return null;
  return { kind: kind as TerminalKind, cols: clampSize(cols, 20, 400, 120), rows: clampSize(rows, 5, 200, 32) };
}

/** 입력(i)·크기 변경(r)·종료(k). 그 밖의 종류는 받지 않는다(출력 o 는 서버만 쓴다). */
export function parseSend(input: unknown): { kind: 'i' | 'r' | 'k'; data: string } | null {
  if (!input || typeof input !== 'object') return null;
  const { type, data, cols, rows } = input as Record<string, unknown>;
  if (type === 'input') return typeof data === 'string' && data.length > 0 && data.length <= MAX_INPUT ? { kind: 'i', data } : null;
  if (type === 'resize') {
    if (!Number.isInteger(cols) || !Number.isInteger(rows)) return null;
    const c = cols as number, r = rows as number;
    return c >= 20 && c <= 400 && r >= 5 && r <= 200 ? { kind: 'r', data: `${c}x${r}` } : null;
  }
  if (type === 'close') return { kind: 'k', data: '' };
  return null;
}

export const parseAfter = (value: string | null) => {
  const n = Number(value ?? 0);
  return Number.isSafeInteger(n) && n >= 0 ? n : 0;
};

function clampSize(value: unknown, min: number, max: number, fallback: number) {
  return Number.isInteger(value) ? Math.min(max, Math.max(min, value as number)) : fallback;
}

export function stateText(s: Pick<TerminalSession, 'state' | 'exit_code' | 'message'>): string {
  if (s.state === 'starting') return '서버에서 여는 중…';
  if (s.state === 'running') return '실행 중';
  if (s.message) return s.message;
  if (s.state === 'exited') return `끝남(코드 ${s.exit_code ?? '?'})`;
  return s.state === 'closed' ? '닫힘' : '실패';
}
