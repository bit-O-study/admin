"use client";

import Link from "@/components/PendingLink";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { LEVEL_DOT, type Level, type StatusItem } from "@/features/admin/status-model";


/**
 * 위쪽 막대의 상태 알약 (2026-10-27 BOadmin 2.0). 누르면 문제 항목 요약, 끝에 상태 화면 링크.
 * 확인 결과는 서버에서 60초 동안 재사용한다(status.ts).
 */
export function StatusPill({ level, label, problems, checkedAt }: { level: Level; label: string; problems: StatusItem[]; checkedAt: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const time = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" }).format(new Date(checkedAt));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-2 rounded-full border border-line px-3 text-[12.5px] text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-zinc-50"
      >
        <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", LEVEL_DOT[level])} />
        <span className="hidden sm:inline">{label}</span>
        <span className="sr-only sm:hidden">서비스 상태: {label}</span>
      </button>
      {open && (
        <div role="dialog" aria-label="상태 요약" className="absolute top-10 right-0 z-40 w-80 overflow-hidden rounded-lg border border-line bg-surface shadow-[0_8px_30px_rgba(0,0,0,.12)]">
          <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
            <p className="text-[13.5px] font-semibold">상태 요약</p>
            <span className="font-mono text-[11.5px] text-zinc-500">{time} 확인</span>
          </div>
          {problems.length === 0 ? (
            <p className="px-3.5 py-4 text-[13px] text-zinc-500">모든 항목이 정상입니다.</p>
          ) : (
            <ul>
              {problems.slice(0, 6).map((p) => (
                <li key={p.key}>
                  <Link href={p.href} onClick={() => setOpen(false)} className="flex items-center gap-2.5 border-b border-line px-3.5 py-2.5 text-[13px] last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", LEVEL_DOT[p.level])} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.label}</span>
                      <span className="block truncate text-[12px] text-zinc-500">{p.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/status" onClick={() => setOpen(false)} className="block border-t border-line px-3.5 py-2.5 text-[13px] text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50">
            전체 상태 보기 →
          </Link>
        </div>
      )}
    </div>
  );
}
