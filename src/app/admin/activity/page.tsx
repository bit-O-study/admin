import { ChipLink, EmptyState, PageHeader } from "@/components/ui/kit";
import { getActivity } from "@/features/admin/activity";
import { ACTIVITY_FILTERS, filterActivity } from "@/features/admin/activity-model";
import { ActivityList } from "@/features/admin/components/activity-list";

export const dynamic = "force-dynamic";

const DAYS = [1, 7, 14] as const;

/**
 * 전체 서비스 › 활동 (2026-10-27 BOadmin 2.0).
 * 가입·탈퇴, 문의, 신고, 크론 실패, 앱 오류, 서버 배포를 시간순으로. 필터는 주소에 남긴다.
 */
export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ type?: string; days?: string }> }) {
  const sp = await searchParams;
  const days = DAYS.find((d) => String(d) === sp.days) ?? 7;
  const types = (sp.type ?? "").split(",").filter((k) => ACTIVITY_FILTERS.some((f) => f.key === k));
  const { items, failed } = await getActivity({ days });
  const shown = filterActivity(items, types.join(","));

  const href = (next: { type?: string[]; days?: number }) => {
    const p = new URLSearchParams();
    const t = next.type ?? types;
    const d = next.days ?? days;
    if (t.length) p.set("type", t.join(","));
    if (d !== 7) p.set("days", String(d));
    const qs = p.toString();
    return `/admin/activity${qs ? `?${qs}` : ""}`;
  };
  const toggle = (key: string) => (types.includes(key) ? types.filter((k) => k !== key) : [...types, key]);

  // 한국 날짜별 묶음.
  const day = (iso: string) => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", weekday: "short" }).format(new Date(iso));
  const groups: { label: string; items: typeof shown }[] = [];
  for (const a of shown) {
    const label = day(a.at);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(a);
    else groups.push({ label, items: [a] });
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <PageHeader title="활동" description={`모든 서비스에서 최근 ${days}일 동안 일어난 일`} />
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="no-scrollbar flex gap-1 overflow-x-auto">
          <ChipLink href={href({ type: [] })} active={types.length === 0}>전체</ChipLink>
          {ACTIVITY_FILTERS.map((f) => (
            <ChipLink key={f.key} href={href({ type: toggle(f.key) })} active={types.includes(f.key)}>{f.label}</ChipLink>
          ))}
        </div>
        <div className="flex gap-1 sm:ml-auto">
          {DAYS.map((d) => (
            <ChipLink key={d} href={href({ days: d })} active={d === days}>{d === 1 ? "오늘" : `${d}일`}</ChipLink>
          ))}
        </div>
      </div>

      {failed.length > 0 && (
        <p role="status" className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          {failed.join(", ")} 기록을 불러오지 못했어요. 나머지 활동만 보여 줍니다.
        </p>
      )}

      {groups.length === 0 ? (
        <EmptyState title="이 기간에 기록된 활동이 없어요" hint="기간을 늘리거나 필터를 지워 보세요." />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <section key={g.label} aria-label={g.label}>
              <h2 className="mb-2 text-[12.5px] font-medium text-zinc-500">{g.label}</h2>
              <div className="overflow-hidden rounded-lg border border-line bg-surface">
                <ActivityList items={g.items} />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
