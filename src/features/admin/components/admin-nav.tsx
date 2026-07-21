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
import { ADMIN_SECTIONS, isAdminLinkActive } from "@/features/admin/nav-model";

const ICONS: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/liquor": Wine,
  "/admin/iq": Brain,
  "/admin/health": Dumbbell,
};

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 overflow-x-auto p-3 lg:h-full lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible lg:p-4">
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

      {ADMIN_SECTIONS.map((section) => (
        <div
          key={section.title}
          className="flex items-center gap-2 lg:mt-2 lg:flex-col lg:items-stretch lg:gap-1"
        >
          <p className="hidden px-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-zinc-400 lg:block">
            {section.title}
          </p>
          {section.links.map((link) => {
            const Icon = ICONS[link.href] ?? LayoutDashboard;
            const active = isAdminLinkActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition lg:w-full",
                  active
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
                )}
              >
                <Icon aria-hidden="true" size={18} />
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}

      <form action={signOutAction} className="shrink-0 lg:mt-auto lg:w-full lg:pt-2">
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