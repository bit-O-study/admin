import "server-only";

import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { APP_EVENT_LOOKBACK_DAYS } from "@/features/health/app-events";
import { CRON_LOOKBACK_DAYS } from "@/features/health/cron-runs";
import { CRON_NAMES } from "@/features/health/cron-run-model";
import { isAdminUser } from "./admin";

/**
 * 처리할 일 건수 (2026-10-14 리뉴얼).
 * 예전엔 미확인 문의·미처리 신고·크론 실패·앱 오류가 각 페이지 상단 글자에만 있고 대시보드엔 없었다.
 * 사이드바 배지와 대시보드 '처리할 일' 이 같은 숫자를 쓴다. 하나가 실패해도 0 으로 두고 화면은 뜬다.
 */
export type NavCounts = { supportUnread: number; reportsOpen: number };

/** 사이드바 배지용 — 가벼운 head 카운트 둘. 한 요청 안에서는 한 번만 센다. */
export const getNavCounts = cache(async (): Promise<NavCounts> => {
  try {
    const db = await createSupabaseServerClient();
    const [support, reports] = await Promise.all([
      db.from("support_tickets").select("id", { count: "exact", head: true }).is("admin_read_at", null),
      db.from("post_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]);
    return { supportUnread: support.count ?? 0, reportsOpen: reports.count ?? 0 };
  } catch {
    return { supportUnread: 0, reportsOpen: 0 };
  }
});

export type ActionItems = NavCounts & {
  /** 최근 기간 앱 오류(심각도 error) 건수. */
  appErrors: number;
  appErrorDays: number;
  /** 마지막 실행이 실패했거나 한 번도 안 돈 크론 수. */
  cronIssues: number;
};

export async function getActionItems(): Promise<ActionItems> {
  if (!(await isAdminUser())) return { supportUnread: 0, reportsOpen: 0, appErrors: 0, appErrorDays: APP_EVENT_LOOKBACK_DAYS, cronIssues: 0 };
  const db = await createSupabaseServerClient();
  const since = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
  const [counts, events, crons] = await Promise.all([
    getNavCounts(),
    db.from("app_events").select("severity,count").gte("occurred_at", since(APP_EVENT_LOOKBACK_DAYS)).order("occurred_at", { ascending: false }).limit(5000),
    db.from("cron_runs").select("name,status").gte("started_at", since(CRON_LOOKBACK_DAYS)).order("started_at", { ascending: false }).limit(3000),
  ]);
  const latest = new Map<string, string | null>(CRON_NAMES.map(name => [name, null]));
  const seen = new Set<string>();
  for (const row of crons.data ?? []) {
    if (!seen.has(row.name)) { latest.set(row.name, row.status); seen.add(row.name); }
  }
  return {
    ...counts,
    appErrors: (events.data ?? []).reduce((total, row) => total + (row.severity === "error" ? (Number.isFinite(row.count) ? Math.max(1, row.count) : 1) : 0), 0),
    appErrorDays: APP_EVENT_LOOKBACK_DAYS,
    cronIssues: [...latest.values()].filter(status => status === null || status === "error").length,
  };
}

/** 사이드바 배지를 달 링크. */
export function navBadges(c: NavCounts): Record<string, number> {
  return { "/admin/health/support": c.supportUnread, "/admin/health/reports": c.reportsOpen };
}
