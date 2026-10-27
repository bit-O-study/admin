import { Suspense } from "react";
import { isSiteConfigured } from "@/lib/supabase/admin-clients";
import { getActiveUsersSeries, getMembers } from "@/features/health/data";
import { getIqStats } from "@/features/iq/data";
import {
  getLiquorVisitToday,
  getLiquorVisitTotal,
} from "@/features/liquor/data";
import { getMemoStats, isMemoConfigured } from "@/features/memo/data";
import { getActionItems } from "@/features/admin/action-items";
import { KpiCard, DashboardView, OverviewCard, type ServiceKpi } from "@/features/admin/components/dashboard-view";
import { getActivity } from "@/features/admin/activity";
import { ActivityList } from "@/features/admin/components/activity-list";
import { getStatusReport } from "@/features/admin/status";
import { LEVEL_DOT, LEVEL_LABEL, LEVEL_PILL, summarize } from "@/features/admin/status-model";
import { cn } from "@/lib/utils";
import type { ServiceKey } from "@/features/admin/services";

export const dynamic = "force-dynamic";

/**
 * 통합 대시보드 (2026-10-14 리뉴얼) — 처리할 일 → 서비스별 오늘 접속 → 헬쑤 회원·접속 그래프.
 * 서비스 하나가 실패해도 그 카드만 '—' 로 두고 나머지는 뜬다.
 */
export default async function AdminDashboardPage() {
  const liquorOn = isSiteConfigured("liquor");

  const [actions, members, day, iq, liquorToday, liquorTotal] = await Promise.all([
    getActionItems(),
    getMembers(),
    getActiveUsersSeries("day"),
    getIqStats(),
    liquorOn ? getLiquorVisitToday() : Promise.resolve(null),
    liquorOn ? getLiquorVisitTotal() : Promise.resolve(null),
  ]);

  const lite = members.map((m) => ({ createdAt: m.createdAt, withdrawnAt: m.withdrawnAt }));
  // 헬쑤 = 로그인 기반이라 '방문 ≈ 접속' — admin_active_users 일별 값.
  const healthDays = day.slice(-30).map((d) => d.users);


  const kpis: Record<ServiceKey, ServiceKpi> = {
    health: {
      label: "로그인 접속",
      today: healthDays.length ? healthDays[healthDays.length - 1] : 0,
      yesterday: healthDays.length > 1 ? healthDays[healthDays.length - 2] : null,
      spark: healthDays,
      href: "/admin/health",
      extra: [{ label: "총 회원", value: `${lite.filter((m) => !m.withdrawnAt).length.toLocaleString("ko-KR")}명` }],
    },
    memo: { label: "로그인 접속", today: null, href: "/admin/memo", note: "불러오는 중…" },
    iq: {
      label: "방문",
      today: iq ? iq.todayVisits : null,
      href: "/admin/iq",
      note: iq ? undefined : "데이터 없음",
      extra: iq ? [{ label: "총 응시", value: iq.totalTests.toLocaleString("ko-KR") }] : undefined,
    },
    liquor: {
      label: "방문",
      today: liquorToday,
      href: "/admin/liquor",
      note: liquorOn ? undefined : "미설정",
      extra: liquorTotal !== null ? [{ label: "누적", value: liquorTotal.toLocaleString("ko-KR") }] : undefined,
    },
  };

  return (
    // 2026-10-27: 헬쑤 회원·접속 그래프는 헬쑤 › 개요로 옮겼다.
    <DashboardView
      actions={actions}
      kpis={kpis}
      serviceCards={{ memo: <Suspense fallback={<KpiCard service="memo" kpi={kpis.memo} />}><MemoCard /></Suspense> }}
      activity={<OverviewCard title="활동" href="/admin/activity" linkLabel="전체 보기"><Suspense fallback={<CardLoading />}><RecentActivity /></Suspense></OverviewCard>}
      status={<OverviewCard title="서비스 상태" href="/admin/status" linkLabel="상태 화면"><Suspense fallback={<CardLoading />}><StatusSummary /></Suspense></OverviewCard>}
    />
  );
}

async function MemoCard() {
  const memo = await getMemoStats(30);
  const days = memo?.days ?? [];
  return <KpiCard service="memo" kpi={{ label: "로그인 접속", today: memo ? (days.at(-1)?.visitors ?? 0) : null, yesterday: memo && days.length > 1 ? days[days.length - 2].visitors : null, spark: days.map(d => d.visitors), href: "/admin/memo", note: memo ? undefined : isMemoConfigured() ? "불러오지 못함" : "미설정", extra: memo ? [{ label: "전체 사용자", value: `${memo.totals.users}명` }] : undefined }} />;
}

function CardLoading() {
  return <p role="status" className="px-4 py-8 text-center text-[13px] text-zinc-500">불러오는 중…</p>;
}

async function RecentActivity() {
  const { items, failed } = await getActivity({ days: 7 });
  if (items.length === 0) return <p className="px-4 py-8 text-center text-[13px] text-zinc-500">{failed.length ? "활동을 불러오지 못했어요." : "최근 7일 동안 기록된 활동이 없어요."}</p>;
  return <ActivityList items={items.slice(0, 6)} />;
}

async function StatusSummary() {
  const report = await getStatusReport();
  const sum = summarize(report.items);
  // 문제 있는 항목을 먼저, 최대 6줄.
  const order = { down: 0, warn: 1, unknown: 2, ok: 3 } as const;
  const rows = [...report.items].sort((a, b) => order[a.level] - order[b.level]).slice(0, 6);
  return (
    <div>
      <p className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-[12.5px] text-zinc-500">
        <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 font-medium", LEVEL_PILL[sum.level])}>
          <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", LEVEL_DOT[sum.level])} />
          {sum.label}
        </span>
        전체 {report.items.length}개 항목
      </p>
      <ul>
        {rows.map((i) => (
          <li key={i.key} className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-[13px] last:border-0">
            <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", LEVEL_DOT[i.level])} />
            <span className="min-w-0 flex-1 truncate">{i.label}</span>
            <span className="hidden truncate font-mono text-[11.5px] text-zinc-500 sm:block">{i.detail}</span>
            <span className="sr-only">{LEVEL_LABEL[i.level]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
