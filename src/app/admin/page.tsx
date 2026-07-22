import Link from "next/link";

import {
  SITE_META,
  isSiteConfigured,
  type SiteKey,
} from "@/lib/supabase/admin-clients";
import { getMembers } from "@/features/health/data";
import { dashboardSummary } from "@/features/health/dashboard-stats";
import { getIqStats } from "@/features/iq/data";
import {
  getLiquorCount,
  getLiquorViewTotal,
  getLiquorVisitTotal,
} from "@/features/liquor/data";

export const dynamic = "force-dynamic";

const SITES: SiteKey[] = ["liquor", "iq", "health"];

type Stat = { label: string; value: string };

function fmt(n: number): string {
  return n.toLocaleString("ko-KR");
}

export default async function AdminDashboardPage() {
  // 도메인별 핵심 통계 — 헬쑤=총회원수, 아이큐=총방문·총응시, 양주=총 상품수.
  // (양주는 방문 추적 테이블이 없어 GA 로 트래픽을 보므로, DB 지표인 상품수를 표시)
  const liquorOn = isSiteConfigured("liquor");
  const [members, iq, liquorCount, liquorViews, liquorVisits] =
    await Promise.all([
      getMembers(),
      getIqStats(),
      liquorOn ? getLiquorCount() : Promise.resolve(0),
      liquorOn ? getLiquorViewTotal() : Promise.resolve(0),
      liquorOn ? getLiquorVisitTotal() : Promise.resolve(0),
    ]);
  const health = dashboardSummary(
    members.map((m) => ({ createdAt: m.createdAt, withdrawnAt: m.withdrawnAt })),
  );

  const STATS: Record<SiteKey, Stat[]> = {
    health: [{ label: "총 회원수", value: `${fmt(health.totalMembers)}명` }],
    iq: [
      { label: "총 방문수", value: fmt(iq?.totalVisits ?? 0) },
      { label: "총 응시수", value: fmt(iq?.totalTests ?? 0) },
    ],
    liquor: [
      { label: "방문자수", value: fmt(liquorVisits) },
      { label: "총 상품수", value: fmt(liquorCount) },
      { label: "총 조회수", value: fmt(liquorViews) },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold">대시보드</h1>
        <p className="mt-1 text-sm text-zinc-500">
          세 사이트를 한 곳에서 관리합니다.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SITES.map((site) => {
          const meta = SITE_META[site];
          const configured = isSiteConfigured(site);
          const stats = STATS[site];
          return (
            <Link
              key={site}
              href={`/admin/${site}`}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{meta.emoji}</span>
                <span
                  className={
                    configured
                      ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800"
                  }
                >
                  {configured ? "연결됨" : "미설정"}
                </span>
              </div>
              <p className="mt-3 font-bold">{meta.label}</p>

              {stats.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <p className="text-[11px] font-semibold text-zinc-400">
                        {s.label}
                      </p>
                      <p className="text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-400">가격 · 상품 관리</p>
              )}

              <p className="mt-3 text-sm text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                관리 열기 →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}