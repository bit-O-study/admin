import { Suspense } from "react";

import { PageHeader } from "@/components/ui/kit";
import { getActiveUsersSeries, getMembers } from "@/features/health/data";
import { HealthDashboard } from "@/features/health/components/health-dashboard";

export const dynamic = "force-dynamic";

/**
 * 헬쑤 › 개요 (2026-10-27 BOadmin 2.0).
 * 통합 대시보드 아래에 붙어 있던 회원·접속 그래프를 헬쑤 탭의 첫 화면으로 옮겼다.
 * 예전엔 이 주소가 회원정보로 넘기기만 했다.
 */
export default async function HealthOverviewPage() {
  const [members, day] = await Promise.all([getMembers(), getActiveUsersSeries("day")]);
  const lite = members.map((m) => ({ createdAt: m.createdAt, withdrawnAt: m.withdrawnAt }));
  return (
    <>
      <PageHeader title="개요" description="회원 수·가입·탈퇴·접속 추이" />
      <Suspense fallback={<p role="status" className="py-10 text-center text-[13px] text-zinc-500">접속 추이를 불러오는 중…</p>}>
        <Charts members={lite} day={day} />
      </Suspense>
    </>
  );
}

async function Charts({ members, day }: { members: { createdAt: string; withdrawnAt: string | null }[]; day: Awaited<ReturnType<typeof getActiveUsersSeries>> }) {
  const [month, year] = await Promise.all([getActiveUsersSeries("month"), getActiveUsersSeries("year")]);
  return <HealthDashboard members={members} active={{ day, month, year }} />;
}
