import Link from "@/components/PendingLink";
import { RefreshCw } from "lucide-react";

import { ButtonLink, PageHeader } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import { NAV_SCOPES } from "@/features/admin/nav-model";
import { SCOPE_DOT } from "@/features/admin/services";
import { getStatusReport } from "@/features/admin/status";
import { LEVEL_DOT, LEVEL_LABEL, LEVEL_PILL, summarize } from "@/features/admin/status-model";

export const dynamic = "force-dynamic";

/**
 * 전체 서비스 › 상태 (2026-10-27 BOadmin 2.0).
 * 데이터 연결·크론·앱 오류·서버 앱을 한 표로. 지금 상태만 본다(지난 기록 저장소는 아직 없음).
 */
export default async function StatusPage({ searchParams }: { searchParams: Promise<{ fresh?: string }> }) {
  const { fresh } = await searchParams;
  const report = await getStatusReport({ fresh: fresh === "1" });
  const sum = summarize(report.items);
  const time = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(report.checkedAt));
  const scopes = NAV_SCOPES.filter((s) => report.items.some((i) => i.scope === s.key));

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="상태"
        description={`${time} 확인 · 결과는 60초 동안 재사용합니다`}
        actions={<ButtonLink href="/admin/status?fresh=1" variant="secondary" size="sm"><RefreshCw size={14} aria-hidden="true" />지금 다시 확인</ButtonLink>}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className={cn("inline-flex h-7 items-center gap-2 rounded-full px-3 text-[13px] font-medium", LEVEL_PILL[sum.level])}>
          <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", LEVEL_DOT[sum.level])} />
          {sum.label}
        </span>
        <span className="text-[13px] text-zinc-500">
          정상 {sum.counts.ok} · 주의 {sum.counts.warn} · 장애 {sum.counts.down} · 확인 불가 {sum.counts.unknown}
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {scopes.map((scope) => (
          <section key={scope.key} aria-labelledby={`st-${scope.key}`}>
            <h2 id={`st-${scope.key}`} className="mb-2 flex items-center gap-2 text-[13px] font-medium text-zinc-500">
              <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", SCOPE_DOT[scope.key])} />
              {scope.label}
            </h2>
            <ul className="overflow-hidden rounded-lg border border-line bg-surface">
              {report.items.filter((i) => i.scope === scope.key).map((i) => (
                <li key={i.key} className="border-b border-line last:border-0">
                  <Link href={i.href} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 hover:bg-zinc-50 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_96px] dark:hover:bg-zinc-900">
                    <span className="min-w-0 truncate text-[13.5px] font-medium">{i.label}</span>
                    <span className="col-span-2 row-start-2 min-w-0 truncate font-mono text-[12px] text-zinc-500 sm:col-span-1 sm:row-start-auto">{i.detail}</span>
                    <span className={cn("inline-flex h-6 items-center justify-self-end gap-1.5 rounded-full px-2.5 text-[12px] font-medium", LEVEL_PILL[i.level])}>
                      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", LEVEL_DOT[i.level])} />
                      {LEVEL_LABEL[i.level]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {report.items.length === 0 && <p className="text-[13px] text-zinc-500">확인할 항목을 불러오지 못했습니다.</p>}
      </div>
    </div>
  );
}
