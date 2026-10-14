import { getMemoStats, isMemoConfigured } from "@/features/memo/data";
import { PageHeader } from "@/components/ui/kit";
import { ServiceIcon } from "@/features/admin/components/service-icon";
import { MemoChartLazy } from "@/features/memo/components/memo-chart-lazy";

export const dynamic = "force-dynamic";

/** 메모 앱(moa) — 하루에 몇 명이 들어왔는지. 숫자만 받는다(src/features/memo/data.ts). */
export default async function MemoAdminPage() {
  const stats = await getMemoStats(30);
  const days = stats?.days ?? [];
  const today = days.at(-1);
  const last7 = days.slice(-7);
  const avg7 = last7.length ? last7.reduce((s, d) => s + d.visitors, 0) / last7.length : 0;
  const peak = days.reduce<{ day: string; n: number } | null>(
    (best, d) => (d.visitors > (best?.n ?? 0) ? { day: d.day, n: d.visitors } : best),
    null,
  );

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <PageHeader icon={<ServiceIcon service="memo" />} title="메모 moa" description="하루 접속자 · 최근 30일 · 접속 = 그날 앱을 연 로그인 사용자" />

      {!stats ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-500 dark:border-zinc-700">
          {isMemoConfigured()
            ? "메모 앱에서 통계를 받지 못했습니다. 메모 앱 배포와 토큰(STATS_API_TOKEN)을 확인하세요."
            : "아직 연결되지 않았습니다. 이 콘솔 환경변수에 MEMO_APP_URL, MEMO_STATS_TOKEN 을 넣으세요."}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="오늘 접속자" value={`${today?.visitors ?? 0}명`} strong />
            <Stat label="최근 7일 평균" value={`${avg7.toFixed(1)}명`} />
            <Stat label="30일 최고" value={peak ? `${peak.n}명` : "—"} sub={peak ? peak.day.slice(5).replace("-", "/") : undefined} />
            <Stat label="전체 사용자" value={`${stats.totals.users}명`} sub={`프로젝트 ${stats.totals.spaces} · 노트 ${stats.totals.notes}`} />
          </div>

          <section className="mt-6 rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-1 text-sm font-bold">일별 접속자</h2>
            <p className="mb-3 text-xs text-zinc-500">
              접속자 = 그날 앱을 연 사람({stats.trackedSince} 부터 기록) · 활동한 사람 = 메시지·이슈·노트 수정을 남긴 사람 + 접속자
            </p>
            <MemoChartLazy days={days} />
          </section>

          <section className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-800/60">
                <tr>
                  {["날짜", "접속자", "활동한 사람", "가입", "메시지", "노트 수정"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-right font-semibold first:text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 tabular-nums dark:divide-zinc-800">
                {[...days].reverse().map((d) => (
                  <tr key={d.day}>
                    <td className="px-4 py-2 text-left">{d.day}</td>
                    <td className="px-4 py-2 text-right font-bold">{d.visitors}</td>
                    <td className="px-4 py-2 text-right">{d.active}</td>
                    <td className="px-4 py-2 text-right">{d.signups}</td>
                    <td className="px-4 py-2 text-right">{d.messages}</td>
                    <td className="px-4 py-2 text-right">{d.edits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub, strong }: { label: string; value: string; sub?: string; strong?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${strong ? "text-pink-600 dark:text-pink-400" : ""}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-zinc-400">{sub}</p>}
    </div>
  );
}
