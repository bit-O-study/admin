import "server-only";

import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAllRows } from "@/lib/supabase/paginate";
import { APP_EVENT_LOOKBACK_DAYS } from "@/features/health/app-events";
import { CRON_LOOKBACK_DAYS } from "@/features/health/cron-runs";
import { CRON_NAMES } from "@/features/health/cron-run-model";
import { isAdminUser } from "./admin";

/**
 * 처리할 일 건수 (2026-10-14 리뉴얼).
 * 예전엔 미확인 문의·미처리 신고·크론 실패·앱 오류가 각 페이지 상단 글자에만 있고 대시보드엔 없었다.
 * 사이드바 배지와 대시보드 '처리할 일' 이 같은 숫자를 쓴다.
 * 못 읽은 값은 null — 대시보드는 "—" 로 보여 준다(0 으로 위장하지 않는다). 배지는 null 이면 안 단다.
 */
export type NavCounts = { supportUnread: number | null; reportsOpen: number | null };

/** 사이드바 배지용 — 가벼운 head 카운트 둘. 한 요청 안에서는 한 번만 센다. */
export const getNavCounts = cache(async (): Promise<NavCounts> => {
  try {
    const db = await createSupabaseServerClient();
    const [support, reports] = await Promise.all([
      db.from("support_tickets").select("id", { count: "exact", head: true }).is("admin_read_at", null),
      db.from("post_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]);
    return {
      supportUnread: support.error ? null : (support.count ?? 0),
      reportsOpen: reports.error ? null : (reports.count ?? 0),
    };
  } catch {
    return { supportUnread: null, reportsOpen: null };
  }
});

export type ActionItems = NavCounts & {
  /** 최근 기간 앱 오류(심각도 error) 건수. */
  appErrors: number | null;
  appErrorDays: number;
  /** 마지막 실행이 실패했거나 한 번도 안 돈 크론 수. */
  cronIssues: number | null;
};

/** 한 번에 1000행까지만 오는 PostgREST 한도를 넘어 끝까지 읽되, 이 이상은 자른다. */
const MAX_EVENT_ROWS = 20000;
const MAX_CRON_ROWS = 10000;

export async function getActionItems(): Promise<ActionItems> {
  if (!(await isAdminUser())) {
    return { supportUnread: null, reportsOpen: null, appErrors: null, appErrorDays: APP_EVENT_LOOKBACK_DAYS, cronIssues: null };
  }
  const db = await createSupabaseServerClient();
  const since = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
  const [counts, events, crons] = await Promise.all([
    getNavCounts(),
    // 예전: .limit(5000) — PostgREST 가 1000행에서 말없이 잘라 오류 수가 줄어 보였다.
    // 오류(severity=error)만, 범위를 나눠 끝까지 읽는다.
    fetchAllRows<{ severity: string; count: number | null }>(
      (from, to) =>
        db
          .from("app_events")
          .select("severity,count")
          .eq("severity", "error")
          .gte("occurred_at", since(APP_EVENT_LOOKBACK_DAYS))
          .order("occurred_at", { ascending: false })
          .range(from, to),
      { maxRows: MAX_EVENT_ROWS },
    ),
    fetchAllRows<{ name: string; status: string | null }>(
      (from, to) =>
        db
          .from("cron_runs")
          .select("name,status")
          .gte("started_at", since(CRON_LOOKBACK_DAYS))
          .order("started_at", { ascending: false })
          .range(from, to),
      { maxRows: MAX_CRON_ROWS },
    ),
  ]);
  const latest = new Map<string, string | null>(CRON_NAMES.map(name => [name, null]));
  const seen = new Set<string>();
  for (const row of crons.rows) {
    if (!seen.has(row.name)) { latest.set(row.name, row.status); seen.add(row.name); }
  }
  return {
    ...counts,
    appErrors: events.error
      ? null
      : events.rows.reduce((total, row) => total + (row.severity === "error" ? (Number.isFinite(row.count) ? Math.max(1, row.count as number) : 1) : 0), 0),
    appErrorDays: APP_EVENT_LOOKBACK_DAYS,
    cronIssues: crons.error ? null : [...latest.values()].filter(status => status === null || status === "error").length,
  };
}

/** 사이드바 배지를 달 링크(못 읽은 값은 배지 없음). */
export function navBadges(c: NavCounts): Record<string, number> {
  return { "/admin/health/support": c.supportUnread ?? 0, "/admin/health/reports": c.reportsOpen ?? 0 };
}
