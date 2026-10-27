import { isAdminUser } from "@/features/admin/admin";
import { libraryRequest } from "@/features/library/data";
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
export async function GET(request: Request) {
  if (!(await isAdminUser())) return json({ error: "관리자 권한이 필요합니다." }, 403);
  const id = new URL(request.url).searchParams.get("download");
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) return json({ error: "파일을 확인해 주세요." }, 400);
  try {
    const response = await libraryRequest("?download=" + id);
    const result = await response.json();
    if (!response.ok) return json(result, response.status);
    const url = new URL(result.url);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".trycloudflare.com")) throw new Error("Invalid storage URL");
    return new Response(null, { status: 302, headers: { Location: url.href, "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
  } catch { return json({ error: "파일 서버에 연결하지 못했습니다." }, 503); }
}
export async function POST(request: Request) {
  if (!(await isAdminUser())) return json({ error: "관리자 권한이 필요합니다." }, 403);
  let sameOrigin = false;
  try { const origin = new URL(request.headers.get("origin") || ""); const destination = new URL(request.url); sameOrigin = origin.host === (request.headers.get("host") || destination.host) && origin.protocol === destination.protocol; } catch {}
  if (!sameOrigin || !request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "허용되지 않은 요청입니다." }, 403);
  const text = await request.text();
  if (text.length > 12000) return json({ error: "검수 메모가 너무 깁니다." }, 413);
  let body;
  try { body = JSON.parse(text); } catch { return json({ error: "요청 형식을 확인해 주세요." }, 400); }
  try { const response = await libraryRequest("", body); return json(await response.json(), response.status); }
  catch { return json({ error: "검수 기록을 저장하지 못했습니다." }, 503); }
}
