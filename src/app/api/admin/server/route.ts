import { getCurrentAdminEmail, isAdminUser } from '@/features/admin/admin';
import { agentRequest } from '@/features/server/agent';
import { isSameOriginJson } from '@/features/server/same-origin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET() {
  if (!(await isAdminUser())) return json({ error: '관리자만 사용할 수 있습니다.' }, 403);
  try {
    const response = await agentRequest('/status');
    if (!response.ok) return json({ error: '서버 상태를 가져오지 못했습니다.' }, 503);
    return json(await response.json());
  } catch (error) { return json({ error: error instanceof Error ? error.message : '서버 연결 오류' }, 503); }
}

export async function POST(request: Request) {
  const actor = await getCurrentAdminEmail();
  if (!actor) return json({ error: '관리자만 사용할 수 있습니다.' }, 403);
  if (!isSameOriginJson(request)) {
    return json({ error: '허용되지 않은 요청입니다.' }, 403);
  }
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 1024) return json({ error: '요청이 너무 큽니다.' }, 413);
    input = JSON.parse(raw);
  } catch { return json({ error: '요청 형식을 확인해 주세요.' }, 400); }
  if (!input || typeof input.project !== 'string' || !/^[\w-]{1,50}$/.test(input.project) || !['on', 'off'].includes(input.action)) return json({ error: '프로젝트와 동작을 확인해 주세요.' }, 400);
  try {
    const response = await agentRequest('/control', { project: input.project, action: input.action, actor });
    if (response.status === 202) return json(await response.json(), 202);
    if (response.status === 409) return json(await response.json(), 409);
    return json({ error: '프로세스 변경 요청에 실패했습니다.' }, 503);
  } catch (error) { return json({ error: error instanceof Error ? error.message : '서버 연결 오류' }, 503); }
}
