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
import { KpiCard, DashboardView, type ServiceKpi } from "@/features/admin/components/dashboard-view";
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
    <DashboardView actions={actions} kpis={kpis} serviceCards={{ memo: <Suspense fallback={<KpiCard service="memo" kpi={kpis.memo} />}><MemoCard /></Suspense> }} />
  );
}

async function MemoCard() {
  const memo = await getMemoStats(30);
  const days = memo?.days ?? [];
  return <KpiCard service="memo" kpi={{ label: "로그인 접속", today: memo ? (days.at(-1)?.visitors ?? 0) : null, yesterday: memo && days.length > 1 ? days[days.length - 2].visitors : null, spark: days.map(d => d.visitors), href: "/admin/memo", note: memo ? undefined : isMemoConfigured() ? "불러오지 못함" : "미설정", extra: memo ? [{ label: "전체 사용자", value: `${memo.totals.users}명` }] : undefined }} />;
}
