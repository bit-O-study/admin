import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ isAdmin: vi.fn(), email: vi.fn(), agent: vi.fn() }));
vi.mock('@/features/admin/admin', () => ({ isAdminUser: mocks.isAdmin, getCurrentAdminEmail: mocks.email }));
vi.mock('@/features/server/agent', () => ({ agentRequest: mocks.agent }));
import { GET, POST } from '@/app/api/admin/server/route';

const command = (origin = 'http://localhost:4101', body: unknown = { project: 'trip', action: 'off' }) => new Request('http://localhost:4101/api/admin/server', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => { vi.clearAllMocks(); mocks.isAdmin.mockResolvedValue(true); mocks.email.mockResolvedValue('admin@example.test'); });

describe('server control API', () => {
  it('rejects unauthenticated reads and writes before agent access', async () => {
    mocks.isAdmin.mockResolvedValue(false); mocks.email.mockResolvedValue(null);
    expect((await GET()).status).toBe(403);
    expect((await POST(command())).status).toBe(403);
    expect(mocks.agent).not.toHaveBeenCalled();
  });
  it('rejects cross-origin and path-like commands', async () => {
    expect((await POST(command('https://attacker.example'))).status).toBe(403);
    expect((await POST(command('http://localhost:4101', { project: '../escape', action: 'off' }))).status).toBe(400);
    expect(mocks.agent).not.toHaveBeenCalled();
  });
  it('passes the authenticated actor and returns accepted rather than completed', async () => {
    mocks.agent.mockResolvedValue(Response.json({ id: 'request-1' }, { status: 202 }));
    const response = await POST(command('http://localhost:4101', { project: 'trip', action: 'off', actor: 'spoofed@example.test' }));
    expect(response.status).toBe(202);
    expect(mocks.agent).toHaveBeenCalledWith('/control', { project: 'trip', action: 'off', actor: 'admin@example.test' });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
  it('shows connection failure without fabricating server data', async () => {
    mocks.agent.mockRejectedValue(new Error('서버 관리 연결이 아직 설정되지 않았습니다.'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: '서버 관리 연결이 아직 설정되지 않았습니다.' });
  });
});
