import Link from "next/link";

import { getSupportTicket } from "@/features/health/support";
import {
  SupportManageForm,
  SupportMarkRead,
  SupportReplyForm,
} from "@/features/health/components/support-forms";
import {
  formatSupportTime,
  SUPPORT_BASE,
  SUPPORT_CATEGORIES,
  SUPPORT_DELIVERY,
  SUPPORT_STATUSES,
} from "@/features/health/support-model";

export const dynamic = "force-dynamic";

const card =
  "rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900";

export default async function HealthSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const d = await getSupportTicket(id);
  const t = d.ticket;

  return (
    <div className="space-y-4">
      <SupportMarkRead id={id} />
      <Link href={SUPPORT_BASE} className="text-sm text-zinc-600 underline dark:text-zinc-400">
        ← 문의 목록
      </Link>

      <section className={card}>
        <p className="text-xs text-zinc-500">
          #{t.number} · {SUPPORT_CATEGORIES[t.category]} · {SUPPORT_STATUSES[t.status]}
        </p>
        <h1 className="mt-1 break-words text-xl font-bold text-zinc-950 dark:text-zinc-100">
          {t.title}
        </h1>
        <p className="mt-1 text-xs text-zinc-500">{formatSupportTime(t.created_at)}</p>
      </section>

      <section className={card}>
        <SupportManageForm ticket={t} />
      </section>

      <section aria-label="문의 대화" className="space-y-3">
        {d.messages.map((m) => (
          <article
            key={m.id}
            className={`${card} ${m.is_admin ? "border-l-4 border-l-zinc-900 dark:border-l-zinc-100" : ""}`}
          >
            <div className="mb-2 flex justify-between gap-3 text-xs text-zinc-500">
              <strong>{m.is_admin ? "고객센터" : "회원"}</strong>
              <span>{formatSupportTime(m.created_at)}</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
          </article>
        ))}
        {d.messages.length >= 200 && (
          <p className="text-sm text-zinc-500">대화가 많아 처음 200개만 표시합니다.</p>
        )}
      </section>

      {d.attachments.length > 0 && (
        <section aria-label="첨부 사진" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {d.attachments.map((f) =>
            f.url ? (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700"
              >
                {/* 5분짜리 서명 URL — next/image 최적화 대상 아님 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt="문의 첨부 사진" className="h-40 w-full object-contain" />
              </a>
            ) : (
              <p key={f.id} className="text-sm text-zinc-500">
                사진을 불러오지 못했어요. (HEALTH_SUPABASE_SERVICE_ROLE_KEY 확인)
              </p>
            ),
          )}
        </section>
      )}

      <section className={card}>
        <SupportReplyForm id={id} />
      </section>

      <section aria-label="내부 메모" className={`${card} space-y-2`}>
        <h2 className="text-sm font-semibold">관리자 전용 메모</h2>
        {d.notes.length === 0 ? (
          <p className="text-sm text-zinc-500">메모가 없습니다.</p>
        ) : (
          d.notes.map((n) => (
            <p key={n.id} className="whitespace-pre-wrap break-words text-sm">
              {n.body}
              <span className="ml-2 text-xs text-zinc-500">{formatSupportTime(n.created_at)}</span>
            </p>
          ))
        )}
      </section>

      <details className={card}>
        <summary className="cursor-pointer text-sm font-semibold">진단 정보</summary>
        <pre className="mt-3 overflow-auto text-xs">{JSON.stringify(t.diagnostics, null, 2)}</pre>
      </details>

      <details className={card}>
        <summary className="cursor-pointer text-sm font-semibold">처리·발송 이력</summary>
        <ul className="mt-3 space-y-1 text-xs">
          {d.events.map((e) => (
            <li key={e.id}>
              {formatSupportTime(e.created_at)} · {e.kind} {e.detail}
            </li>
          ))}
          {d.deliveries.map((n) => (
            <li key={n.id}>
              {formatSupportTime(n.created_at)} ·{" "}
              {SUPPORT_DELIVERY[n.status as keyof typeof SUPPORT_DELIVERY] ?? n.status}
              {n.error_code ? ` (${n.error_code})` : ""}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
