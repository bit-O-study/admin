import type { ServerSnapshot } from './types';
export type RelayCommand = { id: string; project: string; action: 'on' | 'off'; actor: string; state: string; created_at: string; finished_at: string | null; message: string | null };
export function relaySnapshot(snapshot: ServerSnapshot, receivedAt: string, commands: RelayCommand[], now = Date.now()): ServerSnapshot {
  const stale = !Number.isFinite(Date.parse(receivedAt)) || now - Date.parse(receivedAt) > 20000;
  return { ...snapshot, relay: { receivedAt, stale }, projects: snapshot.projects.map(project => {
    const command = commands.find(item => item.project === project.name);
    const pending = command && (['queued', 'claimed'].includes(command.state) || (command.state === 'accepted' && Date.parse(command.finished_at || '') >= Date.parse(receivedAt)));
    const failed = command && ['rejected', 'expired', 'uncertain'].includes(command.state) && now - Date.parse(command.created_at) < 600000;
    return { ...project, ...(pending ? { pending: true, desired: command.action } : {}),
      ...(failed ? { controlError: command.message || '요청을 완료하지 못했습니다. 현재 상태를 확인해 주세요.' } : {}),
      ...(stale ? { controllable: false, controlReason: '운영 서버 연결이 지연되어 제어할 수 없습니다.' } : {}) };
  }) };
}
