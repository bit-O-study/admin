"use client";

import Link from "@/components/PendingLink";
import { usePathname } from "next/navigation";
import { Headphones, LayoutGrid, Search, Users, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { openCommandPalette } from "@/features/admin/components/command-palette";

/**
 * 휴대폰 하단 탭 (2026-10-27 BOadmin 2.0).
 * 서비스 전환과 탭은 위쪽 막대가 맡고, 여기엔 가장 자주 여는 곳과 검색만 둔다.
 */
const TABS: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/admin", label: "개요", icon: LayoutGrid, exact: true },
  { href: "/admin/health/members", label: "회원", icon: Users },
  { href: "/admin/health/support", label: "고객센터", icon: Headphones },
];

export function MobileNav({ badges = {} }: { badges?: Record<string, number> }) {
  const pathname = usePathname() ?? "";
  const isOn = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const item = "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium";

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-surface pb-[var(--safe-bottom)] lg:hidden"
    >
      {TABS.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          aria-current={isOn(href, exact) ? "page" : undefined}
          className={cn(item, isOn(href, exact) ? "text-zinc-950 dark:text-zinc-50" : "text-zinc-500")}
        >
          <Icon aria-hidden="true" size={20} strokeWidth={isOn(href, exact) ? 2.2 : 1.8} />
          {label}
          {badges[href] ? (
            <span className="absolute top-1.5 left-1/2 ml-2 rounded-full bg-red-500 px-1.5 text-[10px] font-semibold leading-4 text-white">
              {badges[href] > 99 ? "99+" : badges[href]}
            </span>
          ) : null}
        </Link>
      ))}
      <button type="button" onClick={openCommandPalette} className={cn(item, "text-zinc-500")}>
        <Search aria-hidden="true" size={20} strokeWidth={1.8} />
        검색
      </button>
    </nav>
  );
}
