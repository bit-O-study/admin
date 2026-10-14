import type { LiquorVisitSource } from "@/features/liquor/data";

/** 양주 사이트 유입 경로 — 최근 30일 많이 온 순. 막대 길이는 30일 방문 비율. */
export function VisitSources({ sources }: { sources: LiquorVisitSource[] | null }) {
  if (!sources) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">
        유입 경로를 보려면 양주 Supabase SQL 에디터에서 <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">frontend/supabase/add_site_visit_source.sql</code> 을 한 번 실행하세요(whisky_app 저장소).
      </p>
    );
  }
  const total = sources.reduce((sum, s) => sum + s.total, 0);
  if (total === 0) {
    return <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">최근 30일 방문 기록이 없습니다.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-zinc-50 text-xs text-zinc-500 dark:bg-zinc-800/60">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold">어디서</th>
            <th className="px-4 py-2.5 text-left font-semibold">30일 비율</th>
            <th className="px-4 py-2.5 text-right font-semibold">오늘</th>
            <th className="px-4 py-2.5 text-right font-semibold">7일</th>
            <th className="px-4 py-2.5 text-right font-semibold">30일</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 tabular-nums dark:divide-zinc-800">
          {sources.map((s) => {
            const pct = Math.round((s.total / total) * 100);
            return (
              <tr key={s.source}>
                <td className="px-4 py-2.5">
                  <p className="font-semibold">{s.source}</p>
                  {s.hosts.length > 0 && <p className="text-[11px] text-zinc-400">{s.hosts.map((h) => h.host).join(" · ")}</p>}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-zinc-500">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">{s.today.toLocaleString("ko-KR")}</td>
                <td className="px-4 py-2.5 text-right">{s.last7.toLocaleString("ko-KR")}</td>
                <td className="px-4 py-2.5 text-right font-bold">{s.total.toLocaleString("ko-KR")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-zinc-100 px-4 py-2 text-[11px] text-zinc-400 dark:border-zinc-800">
        세션당 1회 기록. ‘직접 방문’ = 주소 입력·즐겨찾기·출처를 숨긴 앱. ‘기록 전’ = 유입 기록을 켜기 전 방문.
      </p>
    </div>
  );
}
