import {
  getIqGradeDistribution,
  getIqRecentResults,
  getIqStats,
} from "@/features/iq/data";

export const dynamic = "force-dynamic";

export default async function IqAdminPage() {
  const [stats, dist, recent] = await Promise.all([
    getIqStats(),
    getIqGradeDistribution(),
    getIqRecentResults(50),
  ]);

  const maxCnt = dist.reduce((m, d) => Math.max(m, d.cnt), 0) || 1;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold">🧠 아이큐</h1>
        <p className="mt-1 text-sm text-zinc-500">응시·방문 통계</p>
      </header>

      {/* 지표 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="총 응시수" value={stats?.totalTests ?? 0} tone="sky" />
        <StatCard
          label="평균 IQ"
          value={stats?.avgIq ?? "-"}
          tone="violet"
        />
        <StatCard label="오늘 응시" value={stats?.todayTests ?? 0} tone="emerald" />
        <StatCard label="총 방문" value={stats?.totalVisits ?? 0} tone="amber" />
        <StatCard label="오늘 방문" value={stats?.todayVisits ?? 0} tone="rose" />
      </div>

      {/* 등급 분포 */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          등급 분포
        </h2>
        {dist.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-500 dark:border-zinc-700">
            아직 응시 데이터가 없습니다.
          </p>
        ) : (
          <ul className="space-y-2">
            {dist.map((d) => (
              <li key={d.grade} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {d.grade}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${(d.cnt / maxCnt) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                  {d.cnt}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 최근 응시 */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          최근 응시 ({recent.length})
        </h2>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-500 dark:border-zinc-700">
            아직 응시 데이터가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-3 py-2 font-semibold">이름</th>
                  <th className="px-3 py-2 font-semibold">나이</th>
                  <th className="px-3 py-2 font-semibold">점수</th>
                  <th className="px-3 py-2 font-semibold">IQ</th>
                  <th className="px-3 py-2 font-semibold">등급</th>
                  <th className="px-3 py-2 font-semibold">시각</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recent.map((r, i) => (
                  <tr key={i} className="bg-white dark:bg-zinc-900">
                    <td className="px-3 py-2 font-medium">{r.name ?? "익명"}</td>
                    <td className="px-3 py-2 text-zinc-500">{r.age ?? "-"}</td>
                    <td className="px-3 py-2 tabular-nums text-zinc-500">
                      {r.correct}/{r.total}
                    </td>
                    <td className="px-3 py-2 font-bold tabular-nums">{r.iq}</td>
                    <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                      {r.grade ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-400">
                      {new Date(r.createdAt).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const TONE: Record<string, string> = {
  sky: "text-sky-700 dark:text-sky-400",
  violet: "text-violet-700 dark:text-violet-400",
  emerald: "text-emerald-700 dark:text-emerald-400",
  amber: "text-amber-700 dark:text-amber-400",
  rose: "text-rose-700 dark:text-rose-400",
};

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${TONE[tone]}`}>
        {typeof value === "number" ? value.toLocaleString("ko-KR") : value}
      </p>
    </div>
  );
}