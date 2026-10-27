import { getCurrentAdminEmail } from '@/features/admin/admin';
import { isSameOriginJson } from '@/features/server/same-origin';
import { createTerminal, terminalOverview } from '@/features/server/terminal';
import { agentOnline, parseCreate } from '@/features/server/terminal-model';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** 서버 터미널 목록과 에이전트 연결 상태. */
export async function GET() {
  if (!(await getCurrentAdminEmail())) return json({ error: '관리자만 사용할 수 있습니다.' }, 403);
  try {
    const { agentSeenAt, sessions } = await terminalOverview();
    return json({ online: agentOnline(agentSeenAt), agentSeenAt, sessions });
  } catch (error) { return json({ error: error instanceof Error ? error.message : '서버 터미널 연결 오류' }, 503); }
}

/** 새 세션(Claude Code·Codex·PowerShell). 실행 명령은 서버 에이전트에 고정돼 있고 여기서는 종류만 고른다. */
export async function POST(request: Request) {
  const actor = await getCurrentAdminEmail();
  if (!actor) return json({ error: '관리자만 사용할 수 있습니다.' }, 403);
  if (!isSameOriginJson(request)) return json({ error: '허용되지 않은 요청입니다.' }, 403);
  const input = parseCreate(await request.json().catch(() => null));
  if (!input) return json({ error: '세션 종류를 확인해 주세요.' }, 400);
  try {
    const { agentSeenAt } = await terminalOverview();
    if (!agentOnline(agentSeenAt)) return json({ error: '서버 터미널 에이전트가 연결돼 있지 않습니다.' }, 409);
    return json({ id: await createTerminal(input.kind, input.cols, input.rows, actor) }, 201);
  } catch (error) { return json({ error: error instanceof Error ? error.message : '서버 터미널 연결 오류' }, 503); }
}
