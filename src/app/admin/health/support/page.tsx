import Link from "@/components/PendingLink";

import { getSupportTickets } from "@/features/health/support";
import { SupportRefresh } from "@/features/health/components/support-forms";
import { Badge, Card, ChipLink, EmptyState, PageHeader, buttonClass, fieldClass } from "@/components/ui/kit";
import {
  formatSupportTime,
  SUPPORT_BASE,
  SUPPORT_CATEGORIES,
  SUPPORT_PAGE_SIZE,
  SUPPORT_PRIORITIES,
  SUPPORT_STATUSES,
  supportPageHref,
  type SupportFilters,
} from "@/features/health/support-model";

export const dynamic = "force-dynamic";


// 리뉴얼(2026-10-14): 공용 입력칸 모양. 날짜칸은 폭만 줄인다.
const input = `${fieldClass} w-auto`;

export default async function HealthSupportPage({
  searchParams,
}: {
  searchParams: Promise<SupportFilters>;
}) {
  const filters = await searchParams;
  const { tickets, total, unread, page, error } = await getSupportTickets(filters);

  return (
    <div>
      <PageHeader
        title="고객센터"
        description={<>미확인 <b className="text-zinc-900 dark:text-zinc-100">{unread}</b>건 · 전체 {total}건</>}
        actions={
          <>
            <Link href="/admin/health/support/notifications" className={buttonClass("ghost", "sm")}>
              카카오톡 알림 설정
            </Link>
            <SupportRefresh />
          </>
        }
      />

      {/* 상태 칩 — 자주 쓰는 거르기를 한 번에(나머지 조건은 아래 검색칸). */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        <ChipLink href={supportPageHref({ ...filters, status: undefined }, 1)} active={!filters.status}>
          전체
        </ChipLink>
        {Object.entries(SUPPORT_STATUSES).map(([k, v]) => (
          <ChipLink key={k} href={supportPageHref({ ...filters, status: k }, 1)} active={filters.status === k}>
            {v}
          </ChipLink>
        ))}
      </div>

      <form className="mb-4 flex flex-wrap items-end gap-2 rounded-2xl border border-zinc-200/70 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <input
          aria-label="문의 검색"
          name="q"
          defaultValue={filters.q}
          placeholder="제목 또는 접수번호"
          className={`${fieldClass} min-w-40 flex-1`}
        />
        <select aria-label="상태 필터" name="status" defaultValue={filters.status ?? ""} className={input}>
          <option value="">모든 상태</option>
          {Object.entries(SUPPORT_STATUSES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select aria-label="종류 필터" name="category" defaultValue={filters.category ?? ""} className={input}>
          <option value="">모든 종류</option>
          {Object.entries(SUPPORT_CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <label className="text-xs text-zinc-600 dark:text-zinc-400">
          접수 시작
          <input type="date" name="from" defaultValue={filters.from} className={`${input} block`} />
        </label>
        <label className="text-xs text-zinc-600 dark:text-zinc-400">
          접수 종료
          <input type="date" name="to" defaultValue={filters.to} className={`${input} block`} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input name="mine" value="1" type="checkbox" defaultChecked={filters.mine === "1"} />
          내 담당
        </label>
        <button className={buttonClass("primary")}>검색</button>
      </form>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          문의 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : tickets.length === 0 ? (
        <EmptyState title="조건에 맞는 문의가 없어요" />
      ) : (
        // 받은 편지함처럼 한 상자 안에 줄로 — 안 읽은 문의는 점과 굵은 제목.
        <Card padded={false}>
          <ul aria-label="문의 목록" className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {tickets.map((t) => (
              <li key={t.id}>
                <Link href={`${SUPPORT_BASE}/${t.id}`} className="flex items-start gap-3 px-4 py-3.5 transition hover:bg-zinc-50 sm:px-5 dark:hover:bg-zinc-800/50">
                  <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${t.admin_read_at ? "bg-transparent" : "bg-indigo-500"}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className={`block break-words ${t.admin_read_at ? "font-semibold text-zinc-700 dark:text-zinc-300" : "font-extrabold text-zinc-950 dark:text-zinc-50"}`}>
                      {t.title}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                      <span className="tabular-nums">#{t.number}</span>
                      <span>·</span>
                      <span>{SUPPORT_CATEGORIES[t.category]}</span>
                      <Badge tone={t.status === "new" ? "indigo" : t.status === "resolved" || t.status === "closed" ? "emerald" : "zinc"}>{SUPPORT_STATUSES[t.status]}</Badge>
                      {t.priority !== "normal" && (
                        <Badge tone="red">{SUPPORT_PRIORITIES[t.priority as keyof typeof SUPPORT_PRIORITIES] ?? t.priority}</Badge>
                      )}
                      {!t.admin_read_at && <span className="sr-only">새 소식</span>}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-zinc-400">{formatSupportTime(t.updated_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <nav aria-label="문의 페이지" className="mt-4 flex items-center justify-between text-sm">
        {page > 1 ? <Link className={buttonClass("secondary", "sm")} href={supportPageHref(filters, page - 1)}>← 이전</Link> : <span />}
        <span className="text-xs font-bold text-zinc-500">{page}페이지</span>
        {page * SUPPORT_PAGE_SIZE < total ? (
          <Link className={buttonClass("secondary", "sm")} href={supportPageHref(filters, page + 1)}>다음 →</Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
