import "server-only";

import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppEvents } from "@/features/health/app-events";
import { getCronRuns } from "@/features/health/cron-runs";

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
  const [counts, events, crons] = await Promise.all([
    getNavCounts(),
    getAppEvents(1).catch(() => null),
    getCronRuns(1).catch(() => null),
  ]);
  return {
    ...counts,
    appErrors: events?.summary.errors ?? 0,
    appErrorDays: events?.lookbackDays ?? 0,
    cronIssues: crons ? crons.summaries.filter((s) => s.lastStatus === "error" || s.lastRunAt === null).length : 0,
  };
}

/** 사이드바 배지를 달 링크. */
export function navBadges(c: NavCounts): Record<string, number> {
  return { "/admin/health/support": c.supportUnread, "/admin/health/reports": c.reportsOpen };
}
