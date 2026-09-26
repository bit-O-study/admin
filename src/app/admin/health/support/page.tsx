import Link from "next/link";

import { getSupportTickets } from "@/features/health/support";
import { SupportRefresh } from "@/features/health/components/support-forms";
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

/** 카카오 알림 연결은 카카오 OAuth 리다이렉트가 등록된 헬쑤앱 도메인에서 한다. */
const HEALTH_APP_URL = process.env.HEALTH_APP_URL ?? "https://health-app-five-iota.vercel.app";

const input =
  "rounded-lg border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-600 dark:bg-zinc-900";

export default async function HealthSupportPage({
  searchParams,
}: {
  searchParams: Promise<SupportFilters>;
}) {
  const filters = await searchParams;
  const { tickets, total, unread, page, error } = await getSupportTickets(filters);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-zinc-950 dark:text-zinc-100">고객센터</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            미확인 {unread}건 · 전체 {total}건
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`${HEALTH_APP_URL}/admin/support/notifications`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-zinc-600 underline dark:text-zinc-400"
          >
            카카오톡 알림 설정 (헬쑤앱)
          </a>
          <SupportRefresh />
        </div>
      </div>

      <form className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <input
          aria-label="문의 검색"
          name="q"
          defaultValue={filters.q}
          placeholder="제목 또는 접수번호"
          className={`${input} min-w-0 flex-1`}
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
        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          검색
        </button>
      </form>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          문의 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : tickets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-600">
          조건에 맞는 문의가 없습니다.
        </p>
      ) : (
        <ul aria-label="문의 목록" className="flex flex-col gap-2">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link
                href={`${SUPPORT_BASE}/${t.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span>#{t.number}</span>
                  <span>{SUPPORT_CATEGORIES[t.category]}</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {SUPPORT_STATUSES[t.status]}
                  </span>
                  {t.priority !== "normal" && (
                    <span className="rounded bg-red-100 px-1.5 text-red-700 dark:bg-red-950 dark:text-red-300">
                      {SUPPORT_PRIORITIES[t.priority as keyof typeof SUPPORT_PRIORITIES] ?? t.priority}
                    </span>
                  )}
                  {!t.admin_read_at && (
                    <span className="rounded bg-blue-100 px-1.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      새 소식
                    </span>
                  )}
                </div>
                <h2 className="mt-1 break-words font-semibold text-zinc-950 dark:text-zinc-100">
                  {t.title}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">{formatSupportTime(t.updated_at)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <nav aria-label="문의 페이지" className="mt-4 flex items-center justify-between text-sm">
        {page > 1 ? <Link href={supportPageHref(filters, page - 1)}>← 이전</Link> : <span />}
        <span className="text-zinc-500">{page}페이지</span>
        {page * SUPPORT_PAGE_SIZE < total ? (
          <Link href={supportPageHref(filters, page + 1)}>다음 →</Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
