import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { relaySnapshot, type RelayCommand } from '@/features/server/relay-state';
import { executeRelayCommand } from '@/features/server/relay-worker';
import type { ServerSnapshot } from '@/features/server/types';
const now = Date.now();
const at = (delta = 0) => new Date(now + delta).toISOString();
const snapshot = { checkedAt: at(), projects: [{ name: 'trip', controllable: true, pending: false, desired: 'on', state: 'running' }] } as ServerSnapshot;
const command = { id: 'id', project: 'trip', action: 'off', actor: 'admin@example.test', state: 'queued', created_at: at(), finished_at: null, message: null } as RelayCommand;
describe('server relay', () => {
  it('keeps stale data visible but blocks every project control', () => {
    const result = relaySnapshot(snapshot, at(-21000), [], now);
    expect(result.relay?.stale).toBe(true);
    expect(result.projects[0].controllable).toBe(false);
    expect(result.projects[0].state).toBe('running');
  });
  it('shows queued command separately from actual running state', () => {
    const project = relaySnapshot(snapshot, at(), [command], now).projects[0];
    expect(project.pending).toBe(true); expect(project.desired).toBe('off'); expect(project.state).toBe('running');
  });
  it('uses a newer actual snapshot after agent acceptance', () => {
    expect(relaySnapshot(snapshot, at(), [{ ...command, state: 'accepted', finished_at: at(-1000) }], now).projects[0].pending).toBe(false);
  });
  it('retains failed command reason without changing actual state', () => {
    const project = relaySnapshot(snapshot, at(), [{ ...command, state: 'uncertain', message: '확인 필요' }], now).projects[0];
    expect(project.controlError).toBe('확인 필요'); expect(project.state).toBe('running');
  });
  it('preserves authenticated actor and marks 202 as accepted', async () => {
    const request = vi.fn().mockResolvedValue(new Response('{}', { status: 202 }));
    expect((await executeRelayCommand(command, request)).state).toBe('accepted');
    expect(request).toHaveBeenCalledWith('/control', { project: 'trip', action: 'off', actor: 'admin@example.test' });
  });
  it('never retries an ambiguous execution', async () => {
    const request = vi.fn().mockRejectedValue(new Error('timeout'));
    expect((await executeRelayCommand(command, request)).state).toBe('uncertain');
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('reports local denial as rejected', async () => {
    const request = vi.fn().mockResolvedValue(new Response('{}', { status: 409 }));
    expect((await executeRelayCommand(command, request)).state).toBe('rejected');
  });
});
