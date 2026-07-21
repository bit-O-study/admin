"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const HEALTH_SECTIONS: { href: string; label: string }[] = [
  { href: "/admin/health", label: "대시보드" },
  { href: "/admin/health/members", label: "회원정보" },
  { href: "/admin/health/reports", label: "신고" },
  { href: "/admin/health/settings", label: "관리자설정" },
  { href: "/admin/health/exercise-media", label: "운동영상" },
];

function isActive(href: string, pathname: string): boolean {
  return href === "/admin/health"
    ? pathname === "/admin/health"
    : pathname.startsWith(href);
}

export function HealthNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-zinc-200 pb-px dark:border-zinc-800">
      {HEALTH_SECTIONS.map((s) => {
        const active = isActive(s.href, pathname);
        return (
          <Link
            key={s.href}
            href={s.href}
            className={cn(
              "whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-semibold transition",
              active
                ? "border-b-2 border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
            )}
          >
            {s.label}
          </Link>
        );
      })}
    </nav>
  );
}