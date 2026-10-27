import "server-only";

import { isAdminUser } from "@/features/admin/admin";
import { getActionItems } from "@/features/admin/action-items";
import { judgeAppErrors, judgeCron, judgeLatency, judgeProject, type StatusItem } from "@/features/admin/status-model";
import { CRON_LABEL } from "@/features/health/cron-run-model";
import { getCronRuns } from "@/features/health/cron-runs";
import { getIqStats } from "@/features/iq/data";
import { getMemoStats, isMemoConfigured } from "@/features/memo/data";
import { agentRequest } from "@/features/server/agent";
import type { ServerSnapshot } from "@/features/server/types";
import { adminDb, isSiteConfigured } from "@/lib/supabase/admin-clients";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 서비스 상태 모으기 (2026-10-27 BOadmin 2.0).
 * 위쪽 막대 알약이 모든 화면에서 부르므로 60초 동안 결과를 재사용한다. 확인 하나가 느리거나
 * 실패해도 나머지는 그대로 낸다(각 확인에 시간 제한).
 */
const TTL_MS = 60_000;
const CHECK_TIMEOUT_MS = 6_000;
const PROJECT_LABEL: Record<string, string> = { health_app: "헬쑤", admin: "관리 콘솔", trip: "여행", whisky_app: "위스키", accountBook: "가계부", MeetingMinutes: "메모 moa", ticket: "티켓", ast: "AST" };

export type StatusReport = { items: StatusItem[]; checkedAt: string };
let cached: { at: number; report: StatusReport } | null = null;

function withTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), CHECK_TIMEOUT_MS))]);
}
async function timed<T>(fn: () => Promise<T>): Promise<{ ok: boolean; ms: number; value?: T }> {
  const t = Date.now();
  try {
    const value = await withTimeout(fn());
    return { ok: true, ms: Date.now() - t, value };
  } catch {
    return { ok: false, ms: Date.now() - t };
  }
}

async function healthChecks(): Promise<StatusItem[]> {
  const db = await timed(async () => {
    const s = await createSupabaseServerClient();
    const { error } = await s.from("admins").select("email", { count: "exact", head: true });
    if (error) throw error;
  });
  const [actions, crons] = await Promise.all([timed(getActionItems), timed(() => getCronRuns(1))]);
  const items: StatusItem[] = [
    { key: "health-db", label: "헬쑤 데이터 연결", scope: "health", href: "/admin/health", ...judgeLatency(db.ok, db.ms) },
  ];
  if (actions.ok && actions.value) {
    items.push({ key: "health-app-errors", label: "헬쑤 앱 오류", scope: "health", href: "/admin/health/events", ...judgeAppErrors(actions.value.appErrors, actions.value.appErrorDays) });
  }
  if (crons.ok && crons.value) {
    for (const s of crons.value.summaries) {
      items.push({ key: `cron-${s.name}`, label: `크론 · ${CRON_LABEL[s.name] ?? s.name}`, scope: "health", href: `/admin/health/crons?cron=${encodeURIComponent(s.name)}`, ...judgeCron(s) });
    }
  } else {
    items.push({ key: "cron", label: "크론 기록", scope: "health", href: "/admin/health/crons", level: "unknown", detail: "기록을 불러오지 못함" });
  }
  return items;
}

async function serviceChecks(): Promise<StatusItem[]> {
  const iq = await timed(async () => {
    if (!(await getIqStats())) throw new Error("no data");
  });
  const items: StatusItem[] = [{ key: "iq", label: "아이큐 데이터", scope: "iq", href: "/admin/iq", ...judgeLatency(iq.ok, iq.ms) }];

  if (isSiteConfigured("liquor")) {
    const liquor = await timed(async () => {
      const { error } = await adminDb("liquor").from("site_visit").select("id", { count: "exact", head: true }).limit(1);
      if (error) throw error;
    });
    items.push({ key: "liquor", label: "위스키 데이터", scope: "liquor", href: "/admin/liquor", ...judgeLatency(liquor.ok, liquor.ms) });
  } else {
    items.push({ key: "liquor", label: "위스키 데이터", scope: "liquor", href: "/admin/liquor", level: "unknown", detail: "미설정" });
  }

  if (isMemoConfigured()) {
    const memo = await timed(async () => {
      if (!(await getMemoStats(1))) throw new Error("no data");
    });
    items.push({ key: "memo", label: "메모 moa 통계 API", scope: "memo", href: "/admin/memo", ...judgeLatency(memo.ok, memo.ms, 2500) });
  } else {
    items.push({ key: "memo", label: "메모 moa 통계 API", scope: "memo", href: "/admin/memo", level: "unknown", detail: "미설정" });
  }
  return items;
}

async function serverChecks(): Promise<StatusItem[]> {
  const res = await timed(async () => {
    const r = await agentRequest("/status");
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json()) as ServerSnapshot;
  });
  if (!res.ok || !res.value) {
    return [{ key: "server", label: "운영 서버", scope: "server", href: "/admin/server", level: "unknown", detail: "관리 에이전트에 연결하지 못함" }];
  }
  const snap = res.value;
  const items: StatusItem[] = snap.projects.map((p) => ({
    key: `server-${p.name}`,
    label: `서버 · ${PROJECT_LABEL[p.name] ?? p.name}`,
    scope: "server" as const,
    href: "/admin/server",
    ...judgeProject(p),
  }));
  if (snap.relay?.stale) items.unshift({ key: "server-relay", label: "운영 서버 연결", scope: "server", href: "/admin/server", level: "warn", detail: "상태 수신이 지연됨" });
  return items;
}

export async function getStatusReport({ fresh = false }: { fresh?: boolean } = {}): Promise<StatusReport> {
  if (!(await isAdminUser())) return { items: [], checkedAt: new Date().toISOString() };
  if (!fresh && cached && Date.now() - cached.at < TTL_MS) return cached.report;
  const groups = await Promise.allSettled([healthChecks(), serviceChecks(), serverChecks()]);
  const items = groups.flatMap((g) => (g.status === "fulfilled" ? g.value : []));
  const report = { items, checkedAt: new Date().toISOString() };
  cached = { at: Date.now(), report };
  return report;
}
