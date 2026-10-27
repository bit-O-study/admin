"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, Trash2, UserX } from "lucide-react";

import { buttonClass, Badge } from "@/components/ui/kit";
import { useConfirm } from "@/components/use-confirm";
import { cn } from "@/lib/utils";
import type { ReportRow } from "@/features/health/reports";
import { reportKindLabel } from "@/features/health/report";
import {
  banBadgeLabel,
  formatReportTime,
  reportActionState,
  suspendButtonLabel,
} from "@/features/health/report-view";
import {
  deleteReportedContentAction,
  reopenReportAction,
  resolveReportAction,
  suspendReportedUserAction,
} from "@/features/health/report-actions";

/**
 * 신고 처리 목록. 조치들은 서로를 막지 않는다 —
 * 정지를 걸어도 신고는 열린 채라 이어서 게시글/댓글 삭제까지 할 수 있고,
 * 처리완료한 신고도 콘텐츠가 남아 있으면 삭제·정지가 그대로 가능하다.
 * 2026-10-27 BOadmin 2.0: 브라우저 confirm·prompt·alert 를 앱 안 대화상자와 오류 줄로 바꿨다
 * (안드로이드 WebView 에선 브라우저 대화상자가 뜨지 않는다).
 */
export function ReportsManager({ reports, emptyText = "아직 신고가 없습니다." }: { reports: ReportRow[]; emptyText?: string }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suspendFor, setSuspendFor] = useState<ReportRow | null>(null);
  const [confirmDialog, ask] = useConfirm();
  const [, start] = useTransition();

  function run(id: string, fn: () => Promise<{ ok: boolean; error?: string }>) {
    setPendingId(id);
    setError(null);
    start(async () => {
      const r = await fn();
      setPendingId(null);
      if (!r.ok) setError(r.error ?? "처리에 실패했어요.");
      else router.refresh();
    });
  }

  if (reports.length === 0) {
    return <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-[13px] text-zinc-500 dark:border-zinc-800">{emptyText}</p>;
  }

  return (
    <>
      {confirmDialog}
      {error && (
        <p role="alert" className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      <ul className="overflow-hidden rounded-lg border border-line bg-surface">
        {reports.map((r) => {
          const busy = pendingId === r.id;
          const s = reportActionState({
            status: r.status,
            contentExists: r.contentExists,
            targetUserId: r.targetUserId,
            suspendedUntil: r.targetSuspendedUntil,
            bannedAt: r.targetBannedAt,
          });
          const banBadge = banBadgeLabel(s.banState, r.targetSuspendedUntil);
          const kind = reportKindLabel(r.targetKind);
          return (
            <li key={r.id} className="grid gap-3 border-b border-line px-4 py-4 last:border-0 md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-zinc-500">
                  <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", s.resolved ? "bg-zinc-300 dark:bg-zinc-700" : "bg-red-500")} />
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{s.resolved ? "처리완료" : "미처리"}</span>
                  <span>· {kind}</span>
                  {r.targetAuthor && <span>· 작성자 {r.targetAuthor}</span>}
                  <span>· {formatReportTime(r.createdAt)}</span>
                </div>
                <p className={cn("mt-1.5 line-clamp-2 text-[14px]", s.contentDeleted && "text-zinc-400 line-through")}>{r.targetPreview || "(내용 없음)"}</p>
                <p className="mt-1 text-[13px] text-zinc-500">사유: {r.reason}</p>
                {(s.contentDeleted || banBadge) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.contentDeleted && <Badge>{kind} 삭제됨</Badge>}
                    {banBadge && <Badge tone="amber">{banBadge}</Badge>}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-start gap-1.5 md:justify-end">
                <button
                  type="button"
                  disabled={busy || !s.canDelete}
                  onClick={async () => {
                    if (!(await ask({ title: `${kind} 삭제`, message: `이 ${kind}을(를) 삭제할까요? 되돌릴 수 없습니다.`, confirmLabel: "삭제", tone: "danger" }))) return;
                    run(r.id, () => deleteReportedContentAction(r.targetKind, r.targetId));
                  }}
                  className={buttonClass("secondary", "sm", "text-red-600 dark:text-red-400")}
                >
                  {busy ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Trash2 size={14} aria-hidden="true" />}
                  {s.canDelete ? "삭제" : "삭제됨"}
                </button>
                {s.canSuspend && (
                  <button type="button" disabled={busy} onClick={() => setSuspendFor(r)} className={buttonClass("secondary", "sm")}>
                    <UserX size={14} aria-hidden="true" />
                    {suspendButtonLabel(s.banState)}
                  </button>
                )}
                {s.resolved ? (
                  <button type="button" disabled={busy} onClick={() => run(r.id, () => reopenReportAction(r.id))} className={buttonClass("ghost", "sm")}>
                    <RotateCcw size={14} aria-hidden="true" />
                    다시 열기
                  </button>
                ) : (
                  <button type="button" disabled={busy} onClick={() => run(r.id, () => resolveReportAction(r.id))} className={buttonClass("primary", "sm")}>
                    <Check size={14} aria-hidden="true" />
                    처리완료
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {suspendFor && (
        <SuspendDialog
          author={suspendFor.targetAuthor}
          onCancel={() => setSuspendFor(null)}
          onConfirm={(days) => {
            const r = suspendFor;
            setSuspendFor(null);
            run(r.id, () => suspendReportedUserAction(r.targetUserId!, days, `신고 처리: ${r.reason}`.slice(0, 200)));
          }}
        />
      )}
    </>
  );
}

/** 정지 기간 고르기 — 예전 브라우저 prompt("정지 기간(일)") 대신. */
function SuspendDialog({ author, onCancel, onConfirm }: { author: string | null; onCancel: () => void; onConfirm: (days: number) => void }) {
  const [days, setDays] = useState("7");
  const n = Number(days);
  const valid = Number.isInteger(n) && n >= 1 && n <= 3650;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="suspend-title" onClick={onCancel}>
      <form
        className="w-full max-w-sm rounded-xl border border-line bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) onConfirm(n);
        }}
      >
        <h2 id="suspend-title" className="text-[16px] font-semibold">작성자 정지</h2>
        <p className="mt-1 text-[13px] text-zinc-500">{author ? `${author} 님을` : "작성자를"} 며칠 동안 정지할까요? 신고는 열린 채로 둡니다.</p>
        <div className="mt-4 flex gap-1.5">
          {["1", "7", "30"].map((d) => (
            <button key={d} type="button" onClick={() => setDays(d)} className={buttonClass(days === d ? "primary" : "secondary", "sm")}>{d}일</button>
          ))}
        </div>
        <label htmlFor="suspend-days" className="mt-3 block text-[12.5px] text-zinc-500">직접 입력(1~3650일)</label>
        <input id="suspend-days" inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ""))} className="mt-1 h-9 w-full rounded-md border border-line bg-surface px-3 text-[14px]" autoFocus />
        {!valid && days !== "" && <p className="mt-1 text-[12px] text-red-600">1에서 3650 사이로 입력하세요.</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={buttonClass("secondary", "sm")}>취소</button>
          <button type="submit" disabled={!valid} className={buttonClass("danger", "sm")}>{valid ? `${n}일 정지` : "정지"}</button>
        </div>
      </form>
    </div>
  );
}
