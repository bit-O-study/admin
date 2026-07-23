"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Wine,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { signOutAction } from "@/features/auth/actions";
import {
  ADMIN_GROUPS,
  OVERVIEW_LINK,
  activeHref,
  allNavHrefs,
} from "@/features/admin/nav-model";

const GROUP_ICONS: Record<string, LucideIcon> = {
  health: Dumbbell,
  iq: Brain,
  liquor: Wine,
};

export function AdminNav() {
  const pathname = usePathname();
  const active = activeHref(pathname, allNavHrefs());

  return (
    <nav className="flex flex-col gap-1 p-3 lg:h-full lg:p-4">
      <div className="mb-4 hidden items-center gap-2 px-2 lg:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
          <LayoutDashboard aria-hidden="true" size={18} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
            통합 관리자
          </p>
          <p className="text-[11px] text-zinc-500">heltch admin</p>
        </div>
      </div>

      {/* 개요 — 통합 대시보드 */}
      <Link
        href={OVERVIEW_LINK.href}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
          active === OVERVIEW_LINK.href
            ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
            : "text-zinc-700 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
        )}
      >
        <LayoutDashboard aria-hidden="true" size={18} />
        {OVERVIEW_LINK.label}
      </Link>

      {/* 사이트별 트리 */}
      {ADMIN_GROUPS.map((group) => {
        const Icon = GROUP_ICONS[group.key] ?? LayoutDashboard;
        const groupActive = group.links.some((l) => l.href === active);
        return (
          <div key={group.key} className="mt-3">
            <Link
              href={group.href}
              className={cn(
                "inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition",
                groupActive
                  ? "text-zinc-950 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              <Icon aria-hidden="true" size={18} />
              {group.label}
            </Link>
            <div className="mt-0.5 flex flex-col gap-0.5 border-l border-zinc-200 pl-3 dark:border-zinc-800 lg:ml-4">
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition",
                    active === link.href
                      ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      <form action={signOutAction} className="mt-6 lg:mt-auto lg:pt-2">
        <button
          type="submit"
          className="inline-flex w-full items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-zinc-500 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
        >
          <LogOut aria-hidden="true" size={18} />
          로그아웃
        </button>
      </form>
    </nav>
  );
}