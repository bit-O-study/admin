import { getReports } from "@/features/health/reports";
import { ReportsManager } from "@/features/health/components/reports-manager";

export const dynamic = "force-dynamic";

export default async function HealthReportsPage() {
  const reports = await getReports();
  const open = reports.filter((r) => r.status === "open");

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-zinc-950 dark:text-zinc-100">
        신고
      </h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        미처리 {open.length}건 · 전체 {reports.length}건
      </p>
      <ReportsManager reports={reports} />
    </div>
  );
}