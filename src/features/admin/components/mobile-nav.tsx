"use client";

import Link from "@/components/PendingLink";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Headphones, LayoutDashboard, Menu, Users, X, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { AdminNav } from "@/features/admin/components/admin-nav";

/**
 * 휴대폰(lg 미만) 전용 상단 막대 + 하단 탭 + 전체 메뉴 시트 (2026-10-14).
 * 예전에는 사이드바 링크 20개가 본문 위에 그대로 쌓여 메뉴를 다 지나야 내용이 보였다.
 * 자주 가는 셋(대시보드·회원·고객센터)만 탭으로 두고, 나머지는 '메뉴' 시트 안의 기존 사이드바를 쓴다.
 */
const TABS: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/admin/health/members", label: "회원", icon: Users },
  { href: "/admin/health/support", label: "고객센터", icon: Headphones },
];

export function MobileNav({ badges = {} }: { badges?: Record<string, number> }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  // 메뉴에서 페이지를 고르면 시트를 닫는다.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isOn = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 text-[10px] font-black text-white">
            BO
          </span>
          <span className="text-[15px] font-black tracking-tight">BOadmin</span>
        </Link>
      </header>

      <nav
        aria-label="하단 메뉴"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-zinc-200 bg-white pb-[var(--safe-bottom)] dark:border-zinc-800 dark:bg-zinc-900 lg:hidden"
      >
        {TABS.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            aria-current={isOn(href, exact) ? "page" : undefined}
            className={cn(
              "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-bold",
              isOn(href, exact) ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500",
            )}
          >
            <Icon aria-hidden="true" size={20} />
            {label}
            {badges[href] ? (
              <span className="absolute top-1.5 left-1/2 ml-2 rounded-full bg-red-500 px-1.5 text-[10px] font-black leading-4 text-white">
                {badges[href] > 99 ? "99+" : badges[href]}
              </span>
            ) : null}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className={cn("flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-bold", open ? "text-indigo-600" : "text-zinc-500")}
        >
          <Menu aria-hidden="true" size={20} />
          메뉴
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="전체 메뉴">
          <button type="button" aria-label="닫기" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center px-5 pt-4 pb-1">
              <p className="text-base font-black">전체 메뉴</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="닫기" className="ml-auto rounded-lg p-2 text-zinc-500">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto pb-[calc(var(--safe-bottom)+12px)]">
              <AdminNav badges={badges} expandAll />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
