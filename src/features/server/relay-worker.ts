import 'server-only';
import { randomUUID } from 'node:crypto';
import { localAgentRequest } from './agent';
import { relayDb, relayHost } from './relay';
import type { RelayCommand } from './relay-state';

// Claim is permanent: a timeout/crash never causes an automatic second execution.
export async function executeRelayCommand(command: RelayCommand, request = localAgentRequest) {
  try {
    const response = await request('/control', { project: command.project, action: command.action, actor: command.actor });
    if (response.status === 202) return { state: 'accepted', message: null };
    return { state: 'rejected', message: '운영 서버가 요청을 거절했습니다. 현재 상태와 제어 조건을 확인해 주세요.' };
  } catch {
    return { state: 'uncertain', message: '실행 결과를 확인하지 못했습니다. 자동 재시도하지 않습니다. 현재 상태를 확인해 주세요.' };
  }
}

export function startRelayWorker() {
  const scope = globalThis as typeof globalThis & { serverControlRelayStarted?: boolean };
  if (scope.serverControlRelayStarted || !process.env.SERVER_CONTROL_TOKEN || !process.env.HEALTH_SUPABASE_SERVICE_ROLE_KEY || !process.env.HEALTH_SUPABASE_URL) return;
  scope.serverControlRelayStarted = true;
  const worker = randomUUID();
  const db = relayDb();
  let warned = false;
  async function tick() {
    try {
      const response = await localAgentRequest('/status');
      if (!response.ok) throw Error('status');
      const published = await db.rpc('server_control_publish', { p_host: relayHost(), p_snapshot: await response.json() });
      if (published.error) throw Error('publish');
      const claimed = await db.rpc('server_control_claim', { p_host: relayHost(), p_worker: worker });
      if (claimed.error) throw Error('claim');
      const command = claimed.data?.[0] as RelayCommand | undefined;
      if (command) {
        const result = await executeRelayCommand(command);
        const finished = await db.from('server_control_commands').update({ ...result, finished_at: new Date().toISOString() }).eq('id', command.id).eq('worker_id', worker).eq('state', 'claimed');
        if (finished.error) throw Error('finish');
      }
      warned = false;
    } catch {
      if (!warned) console.warn('[server-control] Relay synchronization unavailable; commands are never automatically retried.');
      warned = true;
    } finally { setTimeout(() => void tick(), 2000).unref(); }
  }
  void tick();
}
