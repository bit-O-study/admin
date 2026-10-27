import "server-only";

import { isAdminUser } from "@/features/admin/admin";
import { buildActivity, type Activity, type ActivitySources } from "@/features/admin/activity-model";
import { getAppEvents } from "@/features/health/app-events";
import { getCronRuns } from "@/features/health/cron-runs";
import { CRON_LABEL } from "@/features/health/cron-run-model";
import { getMembers } from "@/features/health/data";
import { getReports } from "@/features/health/reports";
import { getSupportTickets } from "@/features/health/support";
import { agentRequest } from "@/features/server/agent";
import type { ServerSnapshot } from "@/features/server/types";

/**
 * 활동 피드 데이터 모으기 (2026-10-27 BOadmin 2.0).
 * 출처마다 따로 불러오고, 실패한 출처는 이름만 알려 준다(나머지 피드는 그대로).
 */
const PROJECT_LABEL: Record<string, string> = { health_app: "헬쑤", admin: "관리 콘솔", trip: "여행", whisky_app: "위스키", accountBook: "가계부", MeetingMinutes: "메모 moa", ticket: "티켓", ast: "AST" };

async function deploys(): Promise<NonNullable<ActivitySources["deploys"]>> {
  const r = await agentRequest("/status");
  if (!r.ok) throw new Error(String(r.status));
  const snap = (await r.json()) as ServerSnapshot;
  return snap.projects.flatMap((p) => {
    const d = p.deployment;
    if (!d) return [];
    const label = PROJECT_LABEL[p.name] ?? p.name;
    const rows: NonNullable<ActivitySources["deploys"]> = [];
    if (d.local.deployedAt) rows.push({ name: p.name, label, state: d.local.state, sha: d.local.sha, at: d.local.deployedAt, ok: true });
    if (d.ci.state === "failure" && d.ci.updatedAt) rows.push({ name: p.name, label, state: d.ci.state, sha: d.ci.sha, at: d.ci.updatedAt, ok: false });
    return rows;
  });
}

export async function getActivity({ days = 7 }: { days?: number } = {}): Promise<{ items: Activity[]; failed: string[] }> {
  if (!(await isAdminUser())) return { items: [], failed: [] };
  const [members, tickets, reports, crons, events, server] = await Promise.allSettled([
    getMembers(),
    getSupportTickets({}),
    getReports(200),
    getCronRuns(100),
    getAppEvents(200),
    deploys(),
  ]);
  const failed: string[] = [];
  const pick = <T,>(r: PromiseSettledResult<T>, name: string): T | undefined => {
    if (r.status === "fulfilled") return r.value;
    failed.push(name);
    return undefined;
  };
  const t = pick(tickets, "문의");
  if (t?.error) failed.push("문의");
  const items = buildActivity(
    {
      members: pick(members, "회원"),
      tickets: t?.tickets,
      reports: pick(reports, "신고"),
      // 크론 이름표는 괄호 속 주기를 빼고 쓴다(예: "운동 무활동 감지").
      cronRuns: pick(crons, "크론")?.recent.map((r) => ({ ...r, label: CRON_LABEL[r.name]?.replace(/\s*\(.*\)$/, "") })),
      appEvents: pick(events, "앱 오류")?.recent,
      deploys: pick(server, "서버 배포"),
    },
    { days },
  );
  return { items, failed: [...new Set(failed)] };
}
