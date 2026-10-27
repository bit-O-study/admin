import 'server-only';
import { relayDb, relayHost } from './relay';
import type { TerminalChunk, TerminalKind, TerminalSession } from './terminal-model';

// 서버 터미널 저장소(HEALTH Supabase, service_role 전용 — ops/windows/server-terminal.sql).
// 서버 쪽 ops/windows/terminal-agent.cjs 가 같은 테이블을 읽어 PTY 로 옮긴다.
const SESSION_COLUMNS = 'id,kind,actor,state,created_at,started_at,ended_at,exit_code,message';

export async function terminalOverview(): Promise<{ agentSeenAt: string | null; sessions: TerminalSession[] }> {
  const db = relayDb();
  const [agent, sessions] = await Promise.all([
    db.from('server_terminal_agents').select('seen_at').eq('host_id', relayHost()).maybeSingle(),
    db.from('server_terminal_sessions').select(SESSION_COLUMNS).eq('host_id', relayHost()).order('created_at', { ascending: false }).limit(20),
  ]);
  if (agent.error || sessions.error) throw Error('서버 터미널 연결에 실패했습니다.');
  return { agentSeenAt: agent.data?.seen_at ?? null, sessions: (sessions.data ?? []) as TerminalSession[] };
}

export async function createTerminal(kind: TerminalKind, cols: number, rows: number, actor: string): Promise<string> {
  const { data, error } = await relayDb().from('server_terminal_sessions')
    .insert({ host_id: relayHost(), kind, cols, rows, actor }).select('id').single();
  if (error || !data) throw Error('세션을 만들지 못했습니다.');
  return data.id as string;
}

export async function getTerminal(id: string): Promise<TerminalSession | null> {
  const { data, error } = await relayDb().from('server_terminal_sessions').select(SESSION_COLUMNS).eq('id', id).eq('host_id', relayHost()).maybeSingle();
  if (error) throw Error('세션을 불러오지 못했습니다.');
  return data as TerminalSession | null;
}

export async function readTerminalOutput(id: string, after: number): Promise<TerminalChunk[]> {
  const { data, error } = await relayDb().from('server_terminal_chunks').select('id,data')
    .eq('session_id', id).eq('kind', 'o').gt('id', after).order('id').limit(200);
  if (error) throw Error('출력을 불러오지 못했습니다.');
  return (data ?? []) as TerminalChunk[];
}

/** 입력에는 누가 쳤는지(actor)를 남긴다 — 서버 전체 권한 세션이라 감사 기록이 된다. */
export async function sendTerminal(id: string, kind: 'i' | 'r' | 'k', data: string, actor: string): Promise<void> {
  const { error } = await relayDb().from('server_terminal_chunks').insert({ session_id: id, kind, data, actor });
  if (error) throw Error('서버로 보내지 못했습니다.');
}
