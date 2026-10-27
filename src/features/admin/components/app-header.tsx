"use client";

import Link from "@/components/PendingLink";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronsUpDown, LogOut, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { signOutAction } from "@/features/auth/actions";
import { NAV_SCOPES, locate, tabHrefs, type NavScope } from "@/features/admin/nav-model";
import { openCommandPalette } from "@/features/admin/components/command-palette";
import { SCOPE_DOT } from "@/features/admin/services";

/**
 * 위쪽 막대 (2026-10-27 BOadmin 2.0, Vercel 식).
 * 1줄: 로고 / 서비스 전환 ··· 검색 · 계정.  2줄: 지금 서비스의 탭.
 * 예전 왼쪽 사이드바(링크 20개)를 대신한다. 한 번에 보이는 메뉴는 많아야 8개다.
 */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

const badgeClass = "rounded-full bg-red-500 px-1.5 text-[10.5px] font-semibold leading-[18px] text-white tabular-nums";
const fmt = (n: number) => (n > 99 ? "99+" : String(n));

export function AppHeader({ badges = {}, email, status }: { badges?: Record<string, number>; email?: string | null; /** 상태 알약(서버에서 따로 불러와 끼운다). */ status?: ReactNode }) {
  const pathname = usePathname() ?? "";
  const here = locate(pathname);
  const scopeBadge = (s: NavScope) => s.tabs.flatMap(tabHrefs).reduce((sum, h) => sum + (badges[h] ?? 0), 0);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="flex h-14 items-center gap-2 px-4 sm:px-6">
        <Link href="/admin" aria-label="BOadmin 개요" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-[10px] font-semibold tracking-tight text-white dark:bg-zinc-50 dark:text-zinc-950">
          BO
        </Link>
        <span aria-hidden="true" className="select-none text-xl font-light text-zinc-300 dark:text-zinc-700">/</span>
        <ScopeSwitcher current={here.scope} badgeOf={scopeBadge} />
        <span className="flex-1" />
        {status}
        <button
          type="button"
          onClick={openCommandPalette}
          className="hidden h-8 w-60 items-center gap-2 rounded-md border border-line bg-canvas px-2.5 text-[13px] text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-700 sm:flex dark:hover:border-zinc-700 dark:hover:text-zinc-300"
        >
          <Search size={14} aria-hidden="true" />
          검색
          <kbd className="ml-auto rounded border border-line bg-surface px-1 font-mono text-[10.5px]">Ctrl K</kbd>
        </button>
        <button type="button" onClick={openCommandPalette} aria-label="검색" className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 sm:hidden dark:hover:bg-zinc-900">
          <Search size={17} aria-hidden="true" />
        </button>
        <AccountMenu email={email} />
      </div>
      <nav aria-label={`${here.scope.label} 메뉴`} className="no-scrollbar flex gap-1 overflow-x-auto px-2 sm:px-4">
        {here.scope.tabs.map((tab) => {
          const on = here.tab === tab;
          const count = tabHrefs(tab).reduce((sum, h) => sum + (badges[h] ?? 0), 0);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "relative flex h-11 shrink-0 items-center gap-1.5 px-3 text-[13.5px] transition",
                on ? "text-zinc-950 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50",
              )}
            >
              {tab.label}
              {count > 0 && <span className={badgeClass}>{fmt(count)}</span>}
              {on && <span aria-hidden="true" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-zinc-950 dark:bg-zinc-50" />}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function ScopeSwitcher({ current, badgeOf }: { current: NavScope; badgeOf: (s: NavScope) => number }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 items-center gap-2 rounded-md px-2 text-[14px] font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", SCOPE_DOT[current.key])} />
        {current.label}
        <ChevronsUpDown size={14} className="text-zinc-400" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" aria-label="서비스 전환" className="absolute top-10 left-0 z-40 w-60 rounded-lg border border-line bg-surface p-1 shadow-[0_8px_30px_rgba(0,0,0,.12)]">
          <p className="px-2 pt-1.5 pb-1 text-[11.5px] text-zinc-500">서비스</p>
          {NAV_SCOPES.map((s) => {
            const n = badgeOf(s);
            return (
              <Link
                key={s.key}
                role="menuitem"
                href={s.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13.5px] hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", SCOPE_DOT[s.key])} />
                {s.label}
                {n > 0 && <span className={cn(badgeClass, "ml-auto")}>{fmt(n)}</span>}
                {s.key === current.key && <Check size={14} className={cn("text-zinc-500", n > 0 ? "ml-1" : "ml-auto")} aria-label="지금 서비스" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AccountMenu({ email }: { email?: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const initial = (email ?? "?").charAt(0).toUpperCase();
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="계정 메뉴"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-200 to-zinc-400 text-[12px] font-semibold text-zinc-800 dark:from-zinc-700 dark:to-zinc-900 dark:text-zinc-100"
      >
        {initial}
      </button>
      {open && (
        <div role="menu" aria-label="계정" className="absolute top-10 right-0 z-40 w-64 rounded-lg border border-line bg-surface p-1 shadow-[0_8px_30px_rgba(0,0,0,.12)]">
          <div className="px-2.5 py-2">
            <p className="text-[11.5px] text-zinc-500">로그인 계정</p>
            <p className="truncate text-[13.5px] font-medium">{email ?? "알 수 없음"}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <form action={signOutAction}>
            <button type="submit" role="menuitem" className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13.5px] text-zinc-600 hover:bg-zinc-100 hover:text-red-600 dark:text-zinc-300 dark:hover:bg-zinc-900">
              <LogOut size={15} aria-hidden="true" />
              로그아웃
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/** 탭 안 세부 화면(요금제 › 지급·트레이너 신청·팀 요금제 등). 탭에 세그먼트가 있을 때만 그린다. */
export function SegmentNav() {
  const pathname = usePathname() ?? "";
  const { tab, segment } = locate(pathname);
  if (!tab?.segments) return null;
  return (
    <nav aria-label={`${tab.label} 세부 화면`} className="no-scrollbar mb-6 flex gap-1 overflow-x-auto">
      {tab.segments.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          aria-current={segment === s ? "page" : undefined}
          className={cn(
            "flex h-8 shrink-0 items-center rounded-md px-3 text-[13px] transition",
            segment === s ? "bg-zinc-100 font-medium text-zinc-950 dark:bg-zinc-900 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50",
          )}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}
