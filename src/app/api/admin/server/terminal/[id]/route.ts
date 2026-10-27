import { getCurrentAdminEmail } from '@/features/admin/admin';
import { isSameOriginJson } from '@/features/server/same-origin';
import { getTerminal, readTerminalOutput, sendTerminal } from '@/features/server/terminal';
import { isLive, parseAfter, parseSend } from '@/features/server/terminal-model';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type Context = { params: Promise<{ id: string }> };

/** 세션 상태 + after 이후 출력. */
export async function GET(request: Request, { params }: Context) {
  if (!(await getCurrentAdminEmail())) return json({ error: '관리자만 사용할 수 있습니다.' }, 403);
  const { id } = await params;
  if (!UUID.test(id)) return json({ error: '세션을 찾을 수 없습니다.' }, 404);
  try {
    const session = await getTerminal(id);
    if (!session) return json({ error: '세션을 찾을 수 없습니다.' }, 404);
    const chunks = await readTerminalOutput(id, parseAfter(new URL(request.url).searchParams.get('after')));
    return json({ session, chunks });
  } catch (error) { return json({ error: error instanceof Error ? error.message : '서버 터미널 연결 오류' }, 503); }
}

/** 키 입력·창 크기·닫기. */
export async function POST(request: Request, { params }: Context) {
  const actor = await getCurrentAdminEmail();
  if (!actor) return json({ error: '관리자만 사용할 수 있습니다.' }, 403);
  if (!isSameOriginJson(request)) return json({ error: '허용되지 않은 요청입니다.' }, 403);
  const { id } = await params;
  if (!UUID.test(id)) return json({ error: '세션을 찾을 수 없습니다.' }, 404);
  const input = parseSend(await request.json().catch(() => null));
  if (!input) return json({ error: '보낼 내용을 확인해 주세요.' }, 400);
  try {
    const session = await getTerminal(id);
    if (!session) return json({ error: '세션을 찾을 수 없습니다.' }, 404);
    if (!isLive(session)) return json({ error: '이미 끝난 세션입니다.' }, 409);
    await sendTerminal(id, input.kind, input.data, actor);
    return json({ ok: true });
  } catch (error) { return json({ error: error instanceof Error ? error.message : '서버 터미널 연결 오류' }, 503); }
}
