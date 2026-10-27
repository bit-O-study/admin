import 'server-only';

export async function agentRequest(path: '/status' | '/control', body?: unknown): Promise<Response> {
  if (!process.env.SERVER_CONTROL_TOKEN) {
    const { relayRequest } = await import('./relay');
    return relayRequest(path, body);
  }
  return localAgentRequest(path, body);
}

export async function localAgentRequest(path: '/status' | '/control', body?: unknown): Promise<Response> {
  const token = process.env.SERVER_CONTROL_TOKEN;
  if (!token || token.length < 32) throw new Error('서버 관리 연결이 아직 설정되지 않았습니다.');
  const base = new URL(process.env.SERVER_CONTROL_URL || 'http://127.0.0.1:4199');
  if (base.protocol !== 'http:' || base.hostname !== '127.0.0.1' || base.username || base.password) {
    throw new Error('서버 관리 연결 설정을 확인해 주세요.');
  }
  try {
    return await fetch(new URL(path, base), {
      method: body ? 'POST' : 'GET', cache: 'no-store', redirect: 'error',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8000),
    });
  } catch { throw new Error('서버 관리 에이전트에 연결할 수 없습니다.'); }
}
