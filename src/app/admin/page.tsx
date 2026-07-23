import Link from "next/link";

import {
  SITE_META,
  isSiteConfigured,
  type SiteKey,
} from "@/lib/supabase/admin-clients";
import { getActiveUsersSeries, getMembers } from "@/features/health/data";
import { dashboardSummary } from "@/features/health/dashboard-stats";
import { HealthDashboard } from "@/features/health/components/health-dashboard";
import { getIqStats } from "@/features/iq/data";
import {
  getLiquorCount,
  getLiquorViewTotal,
  getLiquorVisitToday,
  getLiquorVisitTotal,
} from "@/features/liquor/data";
import { getHealthTodayVisits } from "@/features/analytics/vercel";

export const dynamic = "force-dynamic";

const SITES: SiteKey[] = ["health", "iq", "liquor"];

type Stat = { label: string; value: string };

function fmt(n: number): string {
  return n.toLocaleString("ko-KR");
}

/** 오늘 방문수 카드 데이터. value=null 이면 "—". */
type TodayVisit = {
  site: SiteKey;
  value: number | null;
  note: string | null;
};

export default async function AdminDashboardPage() {
  const liquorOn = isSiteConfigured("liquor");

  const [
    members,
    day,
    month,
    year,
    iq,
    liquorCount,
    liquorViews,
    liquorVisits,
    liquorToday,
    healthVisits,
  ] = await Promise.all([
    getMembers(),
    getActiveUsersSeries("day"),
    getActiveUsersSeries("month"),
    getActiveUsersSeries("year"),
    getIqStats(),
    liquorOn ? getLiquorCount() : Promise.resolve(0),
    liquorOn ? getLiquorViewTotal() : Promise.resolve(0),
    liquorOn ? getLiquorVisitTotal() : Promise.resolve(0),
    liquorOn ? getLiquorVisitToday() : Promise.resolve(0),
    getHealthTodayVisits(),
  ]);

  const lite = members.map((m) => ({
    createdAt: m.createdAt,
    withdrawnAt: m.withdrawnAt,
  }));
  const health = dashboardSummary(lite);

  // ── 오늘 방문수(도메인별) ──────────────────────────────
  // 헬쑤=Vercel Web Analytics, 위스키=site_visit(오늘), 아이큐=iq_admin_stats.today_visits
  const todayVisits: TodayVisit[] = [
    {
      site: "health",
      value: healthVisits ? healthVisits.visitors : null,
      note: healthVisits ? null : "Web Analytics 켜기 필요",
    },
    {
      site: "liquor",
      value: liquorOn ? liquorToday : null,
      note: liquorOn ? null : "미설정",
    },
    {
      site: "iq",
      value: iq ? iq.todayVisits : null,
      note: iq ? null : "데이터 없음",
    },
  ];

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

      {/* ── 오늘 방문수 ── */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          오늘 방문수{" "}
          <span className="font-normal text-zinc-400">(도메인별)</span>
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {todayVisits.map((v) => (
            <TodayVisitCard key={v.site} visit={v} />
          ))}
        </div>
      </section>

      {/* ── 헬쑤앱 회원·접속 추이(바깥 대시보드로 이동) ── */}
      <section className="mb-8">
        <HealthDashboard members={lite} active={{ day, month, year }} />
      </section>

      {/* ── 사이트 요약 · 바로가기 ── */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          사이트 바로가기
        </h2>
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
      </section>
    </div>
  );
}

const VISIT_TONE: Record<SiteKey, string> = {
  health: "text-emerald-700 dark:text-emerald-400",
  liquor: "text-amber-700 dark:text-amber-400",
  iq: "text-violet-700 dark:text-violet-400",
};

function TodayVisitCard({ visit }: { visit: TodayVisit }) {
  const meta = SITE_META[visit.site];
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
        <span className="text-base">{meta.emoji}</span>
        {meta.label}
      </p>
      <p
        className={`mt-1 text-3xl font-bold tabular-nums ${VISIT_TONE[visit.site]}`}
      >
        {visit.value === null ? "—" : visit.value.toLocaleString("ko-KR")}
      </p>
      {visit.note && (
        <p className="mt-0.5 text-[11px] text-zinc-400">{visit.note}</p>
      )}
    </div>
  );
}