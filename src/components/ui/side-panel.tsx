"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import Link from "@/components/PendingLink";

/**
 * 오른쪽 상세 패널 (2026-10-27 BOadmin 2.0). 목록 화면에서 한 줄을 고르면 열린다.
 * 열린 상태는 주소(?member= 등)가 정한다 — 새로고침·링크 공유에도 같은 패널이 열린다.
 * 넓은 화면: 위쪽 막대 아래 오른쪽에 고정(목록은 그대로 보임). 휴대폰: 아래에서 올라오는 시트.
 * Esc 와 닫기 버튼은 패널 없는 주소(closeHref)로 바꾼다.
 */
export function SidePanel({ title, closeHref, children }: { title: string; closeHref: string; children: ReactNode }) {
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("[role=alertdialog],[aria-modal=true]")) router.replace(closeHref, { scroll: false });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeHref, router]);

  return (
    <>
      <Link href={closeHref} scroll={false} aria-label="패널 닫기" className="fixed inset-0 z-30 bg-black/30 lg:hidden" />
      <aside
        ref={ref}
        tabIndex={-1}
        aria-label={title}
        className="fixed inset-x-0 bottom-0 z-40 flex max-h-[85vh] flex-col rounded-t-xl border-t border-line bg-surface shadow-[0_-16px_40px_rgba(0,0,0,.18)] outline-none lg:inset-x-auto lg:top-[101px] lg:right-0 lg:max-h-none lg:w-[440px] lg:rounded-none lg:border-t-0 lg:border-l lg:shadow-[-16px_0_32px_-16px_rgba(0,0,0,.18)]"
      >
        <Link
          href={closeHref}
          scroll={false}
          aria-label="닫기"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
        >
          <X size={16} aria-hidden="true" />
        </Link>
        <div className="min-h-0 flex-1 overflow-y-auto pb-[var(--safe-bottom)]">{children}</div>
      </aside>
    </>
  );
}

/** 패널 안 한 묶음: 작은 제목 + 내용. */
export function PanelSection({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-line px-5 py-4 last:border-0">
      <h3 className="mb-2.5 text-[12px] font-medium text-zinc-500">{title}</h3>
      {children}
    </section>
  );
}
