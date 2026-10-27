import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { relaySnapshot, type RelayCommand } from './relay-state';
export const relayHost = () => process.env.SERVER_CONTROL_HOST_ID || 'primary';
export function relayDb() {
  const url = process.env.HEALTH_SUPABASE_URL;
  const key = process.env.HEALTH_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw Error('서버 관리 중계 연결 설정을 확인해 주세요.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) } });
}
export async function relayRequest(path: '/status' | '/control', body?: unknown): Promise<Response> {
  const db = relayDb();
  if (path === '/control') {
    const command = body as { project: string; action: string; actor: string };
    const { data, error } = await db.rpc('server_control_enqueue', { p_host: relayHost(), p_project: command.project, p_action: command.action, p_actor: command.actor });
    if (error) return Response.json({ error: '현재 요청을 전달할 수 없습니다. 서버 연결과 진행 중인 요청을 확인해 주세요.' }, { status: 409 });
    return Response.json({ id: data }, { status: 202 });
  }
  const [host, commands] = await Promise.all([
    db.from('server_control_hosts').select('snapshot,received_at').eq('id', relayHost()).maybeSingle(),
    db.from('server_control_commands').select('id,project,action,actor,state,created_at,finished_at,message').eq('host_id', relayHost()).gte('created_at', new Date(Date.now() - 600000).toISOString()).order('created_at', { ascending: false }).limit(100),
  ]);
  if (host.error || commands.error) throw Error('서버 관리 중계 연결에 실패했습니다.');
  if (!host.data) throw Error('운영 서버의 첫 상태 수신을 기다리고 있습니다.');
  return Response.json(relaySnapshot(host.data.snapshot, host.data.received_at, commands.data as RelayCommand[]));
}
