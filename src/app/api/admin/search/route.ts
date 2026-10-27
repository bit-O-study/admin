import { isAdminUser } from "@/features/admin/admin";
import { SEARCH_LIMIT, SEARCH_MIN_LENGTH, searchMembers, searchReports } from "@/features/admin/search-model";
import { getMembers } from "@/features/health/data";
import { getReports } from "@/features/health/reports";
import { getSupportTickets } from "@/features/health/support";
import { SUPPORT_STATUSES } from "@/features/health/support-model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * 통합 검색 (2026-10-27 BOadmin 2.0). 관리자만. 2글자부터, 종류마다 5건까지.
 * 출처 하나가 실패해도 나머지 결과는 돌려준다.
 */
export async function GET(request: Request) {
  if (!(await isAdminUser())) return json({ error: "관리자만 사용할 수 있습니다." }, 403);
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < SEARCH_MIN_LENGTH) return json({ members: [], tickets: [], reports: [] });

  const [members, tickets, reports] = await Promise.allSettled([getMembers(), getSupportTickets({ q }), getReports(200)]);
  return json({
    members: members.status === "fulfilled" ? searchMembers(q, members.value) : [],
    tickets:
      tickets.status === "fulfilled"
        ? tickets.value.tickets.slice(0, SEARCH_LIMIT).map((t) => ({
            id: t.id,
            number: t.number,
            title: t.title,
            status: SUPPORT_STATUSES[t.status] ?? t.status,
            unread: !t.admin_read_at,
          }))
        : [],
    reports: reports.status === "fulfilled" ? searchReports(q, reports.value) : [],
    failed: [members, tickets, reports].some((r) => r.status === "rejected"),
  });
}
