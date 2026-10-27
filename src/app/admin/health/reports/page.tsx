import { ChipLink, PageHeader } from "@/components/ui/kit";
import { getReports } from "@/features/health/reports";
import { ReportsManager } from "@/features/health/components/reports-manager";

export const dynamic = "force-dynamic";

const VIEWS = [
  { value: "open", label: "미처리" },
  { value: "resolved", label: "처리완료" },
  { value: "all", label: "전체" },
] as const;

/** 헬쑤 › 신고 (2026-10-27 BOadmin 2.0) — 기본은 미처리만, 상태 세그먼트는 주소(?status=)에. */
export default async function HealthReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const view = VIEWS.find((v) => v.value === status)?.value ?? "open";
  const reports = await getReports();
  const counts = { open: reports.filter((r) => r.status === "open").length, resolved: reports.filter((r) => r.status === "resolved").length, all: reports.length };
  const shown = view === "all" ? reports : reports.filter((r) => r.status === view);

  return (
    <div>
      <PageHeader title="신고" description={`미처리 ${counts.open}건 · 전체 ${counts.all}건`} />
      <div className="mb-4 flex gap-1">
        {VIEWS.map((v) => (
          <ChipLink key={v.value} href={v.value === "open" ? "/admin/health/reports" : `/admin/health/reports?status=${v.value}`} active={view === v.value}>
            {v.label} <span className="text-zinc-400">{counts[v.value]}</span>
          </ChipLink>
        ))}
      </div>
      <ReportsManager reports={shown} emptyText={view === "open" ? "미처리 신고가 없어요." : "신고가 없습니다."} />
    </div>
  );
}
